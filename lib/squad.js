const _ = require('lodash');
const gmean = require('compute-gmean');
const Soldier = require('./unit/soldier');
const Vehicle = require('./unit/vehicle');

// Unit types that will be picked randomly
const Units = [Soldier, Vehicle]; // Could be made programatically

class Squad {
	/**
	 * Create all squads for the army
	 * @param {Array} squads Squads to create
	 * @param {Army} army Army instance
	 * @param {Simulator} simulator Simulator instance
	 * @returns {Array} Squad instances
	 */
	static createSquads(squads, army, simulator) {
		const instances = [];
		this.simulator = simulator;

		if (squads.length < 2) {
			throw new Error('Army has to contain at least 2 squads');
		}

		squads.forEach((squad, squadIndex) => {
			instances.push(new Squad(squad, army, squadIndex, simulator));
		});

		return instances;
	}

	/**
	 * Squad constructor
	 * @param {Object} squad Squad properties
	 * @param {Army} army Army instance
	 * @param {number} squadIndex Squad index
	 * @param {Simulator} simulator Simulator instance
	 */
	constructor(squad, army, squadIndex, simulator) {
		this.squad = squad;
		this.squadIndex = squadIndex;
		this.army = army;
		this.ready = 0;
		this.simulator = simulator;

		console.log(`[INIT] Initializing squad ${squadIndex}`);
		if (squad.units < 5) {
			throw new Error('Squad must have at least 5 units');
		}

		if (squad.units > 10) {
			throw new Error('Squad can have maximum 10 units');
		}

		if (['weakest', 'strongest', 'random'].indexOf(squad.strategy) < 0) {
			throw new Error('Unsupported strategy specified');
		}

		this.units = [];

		for (let i = 0; i < squad.units; i++) {
			// Pick random unit type
			const Unit = _.sample(Units);
			this.units.push(new (Unit)(this));
		}
	}

	/**
	 * Get squad health
	 * @returns {number} Squad health, sum of all units health
	 */
	getHealth() {
		return _.sumBy(this.getActiveUnits(), unit => unit.getHealth());
	}

	/**
	 * Get squad attack probability
	 * @returns {number} Squad attack probability, geometric average of all units attack probability
	 */
	getAttackProbability() {
		return gmean(this.getActiveUnits().map(unit => unit.getAttackProbability()));
	}

	/**
	 * Get squad damage
	 * @returns {number} Squad damage, sum of all units damage
	 */
	getDamage() {
		return _.sumBy(this.getActiveUnits(), unit => unit.getDamage());
	}

	/**
	 * Get active units
	 * @returns {Array} Active untis
	 */
	getActiveUnits() {
		return this.units.filter(unit => unit.isActive());
	}

	/**
	 * Is this squad active
	 * @returns {boolean} Active squad
	 */
	isActive() {
		return _.some(this.units, unit => unit.isActive());
	}

	/**
	 * Level up, propagates to all units
	 */
	levelUp() {
		this.getActiveUnits().forEach(unit => {
			unit.levelUp();
		});
	}

	/**
	 * Unit ready. When all units from a squad are ready (charged), initiate the attack
	 */
	unitReady() {
		if (this.ready === 0) {
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army.name}' is recharging`);
		}
		// Count ready units and compare to active units
		this.ready++;
		if (this.ready >= this.getActiveUnits().length) {
			this.ready = 0;
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army.name}' is ready`);
			this.attack();
		}
	}

	/**
	 * Attack the enemy squad
	 */
	attack() {
		let squadToAttack;

		// Pick a strategy
		switch (this.squad.strategy) {
		case 'weakest':
			squadToAttack = this.simulator.getWeakestSquad(this.army);
			break;
		case 'strongest':
			squadToAttack = this.simulator.getStrongestSquad(this.army);
			break;
		case 'random':
			squadToAttack = this.simulator.getRandomSquad(this.army);
			break;
		default:
		}

		// Get attacker and defender attack probabilities
		const attackerProbability = this.getAttackProbability();
		const defenderProbability = squadToAttack.getAttackProbability();

		console.log(`[ATTACK] Squad ${this.squadIndex} from army '${this.army.name}' attacking squad ${squadToAttack.squadIndex} from army '${squadToAttack.army.name}' with strategy ${this.squad.strategy}`);
		console.log(`         Probability: ${attackerProbability} > ${defenderProbability}`);

		if (attackerProbability > defenderProbability) {
			console.log('[ATTACK] Attack successful');
			squadToAttack.receiveDamage(this.getDamage());
			this.levelUp();
		} else {
			console.log('[ATTACK] Attack failed');
		}

		const activeArmies = this.simulator.getActiveArmies();
		if (activeArmies.length === 1) {
			// Army won
			console.log(`[END] Army '${activeArmies[0].name}' won the battle!`);
			process.exit(0);
		} else {
			// Army did not won yet, recharge all units
			this.getActiveUnits().forEach(unit => {
				unit.rechargeUnit();
			});
		}
	}

	/**
	 * @param {number} damage Damage amount
	 * Receive the damage, distribute to all squad units
	 */
	receiveDamage(damage) {
		const activeUnits = this.getActiveUnits();
		activeUnits.forEach(unit => {
			unit.receiveDamage(damage / activeUnits.length);
		});
		console.log(`[DAMAGE] Squad ${this.squadIndex} from army '${this.army.name}' received ${damage} damage. Health remaining ${this.getHealth()}`);
	}
}

module.exports = Squad;
