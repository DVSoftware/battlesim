const _ = require('lodash');
const Squad = require('./squad');

class Army {
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

	constructor(army, simulator) {
		console.log(`[INIT] Initializing army '${army.name}'`);
		this.name = army.name;
		this.squads = Squad.createSquads(army.squads, army, simulator);
	}

	getActiveSquads() {
		return this.squads.filter(squad => squad.isActive());
	}

	isActive() {
		return _.some(this.squads, squad => squad.isActive());
	}
}

module.exports = Army;
