'use strict';

const _ = require('lodash');
const Army = require('./army');

class Simulator {
	/**
	 * Simulator constructor
	 * @param {Array} armies Armies
	 */
	constructor(armies) {
		this.armies = Army.createArmies(armies, this);
	}

	/**
	 * Charge all units
	 */
	chargeArmies() {
		this.armies.forEach(army => {
			army.chargeSquads();
		});
	}

	/**
	 * Get the weakest squad
	 * @param {Army} attacker Army instance
	 * @returns {Squad} Weakest squad
	 */
	getWeakestSquad(attacker) {
		return _.minBy(
			_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())),
			squad => squad.getDamage()
		);
	}

	/**
	 * Get the strongest squad
	 * @param {Army} attacker Army instance
	 * @returns {Squad} Strongest squad
	 */
	getStrongestSquad(attacker) {
		return _.maxBy(
			_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())),
			squad => squad.getDamage()
		);
	}

	/**
	 * Get the random squad
	 * @param {Army} attacker Army instance
	 * @returns {Squad} Random squad
	 */
	getRandomSquad(attacker) {
		return _.sample(_.flatten(this.getEnemies(attacker).map(enemy => enemy.getActiveSquads())));
	}

	/**
	 * Get all enemies
	 * @param {Army} attacker Army instance
	 * @returns {Array} Enemies
	 */
	getEnemies(attacker) {
		return _.without(this.getActiveArmies(), attacker);
	}

	/**
	 * Get active armies
	 * @returns {Array} Active armies
	 */
	getActiveArmies() {
		return this.armies.filter(army => army.isActive());
	}
}

module.exports = Simulator;
