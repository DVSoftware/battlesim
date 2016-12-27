'use strict';

const _ = require('lodash');
const gmean = require('compute-gmean');
const Soldier = require('./unit/soldier');
const Vehicle = require('./unit/vehicle');
const EventEmitter = require('events');

// Unit types that will be picked randomly
const Units = [Soldier, Vehicle]; // Could be made dynamic

class Squad extends EventEmitter {
	/**
	 * Create all squads for the army
	 * @param {Array} squads Squads to create
	 * @param {Army} army Army instance
	 * @param {Simulator} simulator Simulator instance
	 * @returns {Array} Squad instances
	 */
	static createSquads(squads, army) {
		const instances = [];

		if (squads.length < 2) {
			throw new Error('Army has to contain at least 2 squads');
		}

		squads.forEach((squad, squadIndex) => {
			instances.push(new Squad(squad, squadIndex, army));
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
	constructor(squad, squadIndex, army) {
		super();

		this.squad = squad;
		this.squadIndex = squadIndex;
		this.army = army;
		this.ready = 0;

		console.log(`[INIT] Initializing squad ${squadIndex}`);
		if (squad.units < 5) {
			throw new Error('Squad must have at least 5 units');
		}

		if (squad.units > 10) {
			throw new Error('Squad can have maximum 10 units');
		}

		this.units = [];

		// TODO@dvs: Not that it matters, but what happened with "lodash", like: _.each(_.range(squad.units), () => {
		// Why complicate a simple for loop?
		for (let i = 0; i < squad.units; i++) {
		  // TODO@dvs: Why not have a Unit.createUnits: factory method? _.sample within a constructor?
			// Pick random unit type
			const Unit = _.sample(Units);
			const unit = new (Unit)(this);
			this.units.push(unit);
			unit.on('ready', this.unitReady.bind(this));
		}

	}

	/**
	 * Charge all units
	 */
	chargeUnits() {
		this.units.forEach(unit => {
			unit.rechargeUnit();
		});
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
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army}' is recharging`);
		}
		// Count ready units and compare to active units
		this.ready++;
		if (this.ready >= this.getActiveUnits().length) {
			this.ready = 0;
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army}' is ready`);
			this.emit('attack', this);
		}
		// TODO@dvs:! You can not guarantee which unit called the method. Not sure if 2 timeouts of a single unit called the squads.unitReady
		// Not possible as units are only recharging after the attack, therefore a single unit can't do this twice.
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
		console.log(`[DAMAGE] Squad ${this.squadIndex} from army '${this.army}' received ${damage} damage. Health remaining ${this.getHealth()}`);
	}
}

module.exports = Squad;
