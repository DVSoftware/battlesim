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
		console.log(`[INIT] Initializing army '${army.name}'`);
		this.name = army.name;
		this.squads = Squad.createSquads(army.squads, this, simulator);
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
