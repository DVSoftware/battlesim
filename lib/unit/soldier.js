'use strict';

const _ = require('lodash');
const Unit = require('../unit');

class Soldier extends Unit {
	/**
	 * Soldier constructor
	 * @param {Squad} squad Squad instance
	 */
	constructor(squad) {
		super(squad);
		this.experience = 0;
		console.log('[INIT] Creating soldier');
  }

	/**
	 * Level up
	 */
	levelUp() {
		if (this.experience === 50) {
			return;
		}
		this.experience = _.clamp(this.experience + 1, 50);
		// console.log(`[LEVEL UP] Soldier from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' leveled up to ${this.experience}`);
	}

	/**
	 * Get soldier attack probability
	 * @returns {number} Soldier attack probability
	 */
	getAttackProbability() {
		return (0.5 * (1 + (this.getHealth() / 100)) * _.random(50 + this.getExperience(), 100)) / 100;
	}

	/**
	 * Get soldier damage
	 * @returns {number} Soldier damage
	 */
	getDamage() {
		return 0.05 + (this.getExperience() / 100);
	}

	/**
	 * Get soldier experience
	 * @returns {number} Soldier experience
	 */
	getExperience() {
		return this.experience;
	}
}

module.exports = Soldier;
