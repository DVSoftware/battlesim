const _ = require('lodash');
const Squad = require('./squad');
const blessed = require('blessed');

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
		//console.log(`[INIT] Initializing army '${army.name}'`);
		this.simulator = simulator;
		this.name = army.name;
		this.armyItem = new blessed.box({
			width: '100%-2',
			height: 3,
			label: army.name,
			border: {
				type: 'line',
			},
		});
		this.simulator.armyList.append(this.armyItem);

		this.squads = Squad.createSquads(army.squads, army, simulator);

		this.squadsLeft = new blessed.progressbar({
			top: 0,
			left: 0,
			width: '100%-2',
			height: 1,
			filled: 100,
			style: {
				bar: {
					bg: '#00ff00',
					fg: '#ff0000',
				},
			}
		});

		this.armyItem.append(this.squadsLeft);

		this.simulator.screen.render();
	}

	getActiveSquads() {
		return this.squads.filter(squad => squad.isActive());
	}

	isActive() {
		return _.some(this.squads, squad => squad.isActive());
	}
}

module.exports = Army;
