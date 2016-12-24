const _ = require('lodash');
const Army = require('./army');
const Multiprogress = require('multi-progress');
const blessed = require('blessed');

class Simulator {
	constructor(armies) {
		//this.multiprogress = new Multiprogress();

		this.screen = blessed.screen({
			smartCSR: true
		});

		this.screen.title = 'Battle Simulator';

		this.armyList = new blessed.layout({
			top: 0,
			left: 0,
			height: '100%',
			width: '20%',
			border: {
				type: 'line',
			},
			label: 'Armies',
		});
		this.screen.append(this.armyList);

		this.screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

		this.screen.render();

		this.armies = Army.createArmies(armies, this);

	}

	getWeakestSquad(attacker) {
		return _.minBy(
			_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())),
			squad => squad.getDamage()
		);
	}

	getStrongestSquad(attacker) {
		return _.maxBy(
			_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())),
			squad => squad.getDamage()
		);
	}

	getRandomSquad(attacker) {
		return _.sample(_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())));
	}

	getEnemies(attacker) {
		return _.without(this.getActiveArmies(), attacker);
	}

	getActiveArmies() {
		return this.armies.filter(army => army.isActive());
	}

}

module.exports = Simulator;
