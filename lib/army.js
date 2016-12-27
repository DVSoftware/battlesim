'use strict';

const _ = require('lodash');
const Squad = require('./squad');

class Army {
	/**
	 * Create all armies
	 * @param {Array} armies Armies to create
	 * @param {Simulator} simulator Simulator instance
	 * @returns {Array} Army instances
	 */
	static createArmies(armies, simulator) {
		const instances = [];
		if (armies.length < 2) {
			throw new Error('At least 2 armies need to be specified');
		}
		armies.forEach(army => {
			instances.push(new Army(army, simulator));
		});

		return instances;
	}

	/**
	 * Army constructor
	 * @param {Object} army Army properties
	 * @param {Simulator} simulator Simulator instance
	 */
	constructor(army, simulator) {
		// TODO@dvs: Why propagating the simulator instance?
		console.log(`[INIT] Initializing army '${army.name}'`);
		// TODO@dvs: Uff. Adding other strategies is out of the question I see!
		if (['weakest', 'strongest', 'random'].indexOf(army.strategy) < 0) {
			throw new Error('Unsupported strategy specified');
		}
		this.name = army.name;
		this.strategy = army.strategy;
		this.simulator = simulator;
		this.squads = Squad.createSquads(army.squads, this.name, simulator);

		this.squads.forEach(squad => {
			squad.on('attack', this.attack.bind(this));
		})
	}

	/**
	 * Attack the enemy squad
	 */
	attack(squad) {
		let squadToAttack;

		// Pick a strategy
		switch (this.strategy) {
		case 'weakest':
			squadToAttack = this.simulator.getWeakestSquad(this);
			break;
		case 'strongest':
			squadToAttack = this.simulator.getStrongestSquad(this);
			break;
		case 'random':
			squadToAttack = this.simulator.getRandomSquad(this);
			break;
		// default:
		}
		// TODO@dvs: Why not create a Strategy class and avoid switches and such? Or at least encapsulate in a getStrategy method?

		// Get attacker and defender attack probabilities
		const attackerProbability = squad.getAttackProbability();
		const defenderProbability = squadToAttack.getAttackProbability();

		console.log(`[ATTACK] Squad ${squad.squadIndex} from army '${this.name}' attacking squad ${squadToAttack.squadIndex} from army '${squadToAttack.army}' with strategy ${this.strategy}`);
		console.log(`         Probability: ${attackerProbability} > ${defenderProbability}`);

		if (attackerProbability > defenderProbability) {
			console.log('[ATTACK] Attack successful');
			squadToAttack.receiveDamage(squad.getDamage());
			squad.levelUp();
		} else {
			console.log('[ATTACK] Attack failed');
		}

		const activeArmies = this.simulator.getActiveArmies();
		if (activeArmies.length === 1) {
			// Army won
			console.log(`[END] Army '${activeArmies[0].name}' won the battle!`);
			process.exit(0);
      // TODO@dvs:! Wow. process.exit? A bit harsh on the developer that is supposed to use this class?
		} else {
			// Army did not won yet, recharge all units
			squad.getActiveUnits().forEach(unit => {
				unit.rechargeUnit();
			});
		}
	}

	/**
	 * Charge all squads
	 */
	chargeSquads() {
		this.squads.forEach(squad => {
			squad.chargeUnits();
		});
	}


	/**
	 * Get active squads
	 * @returns {Array} Active squads
	 */
	getActiveSquads() {
		return this.squads.filter(squad => squad.isActive());
	}

	/**
	 * Is this army active
	 * @returns {boolean} Active army
	 */
	isActive() {
		return _.some(this.squads, squad => squad.isActive());
	}
}

module.exports = Army;
