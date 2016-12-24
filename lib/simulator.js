const _ = require('lodash');
const Army = require('./army');

class Simulator {
	constructor(armies) {
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
