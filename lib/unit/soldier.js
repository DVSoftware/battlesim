const _ = require('lodash');
const Unit = require('../unit');

class Soldier extends Unit {
	constructor(squad) {
		super(squad);
		this.experience = 0;
		console.log('[INIT] Creating soldier');
		this.startRecharging();
	}

	levelUp() {
		this.experience = _.clamp(this.experience + 1, 50);
		console.log(`[LEVEL UP] Soldier from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' leveled up to ${this.experience}`);
	}

	getAttackProbability() {
		return (0.5 * (1 + (this.getHealth() / 100)) * _.random(50 + this.getExperience(), 100)) / 100;
	}

	getDamage() {
		return 0.05 + (this.getExperience() / 100);
	}

	getExperience() {
		return this.experience;
	}

	unitReady() {
		this.squad.unitReady();
		//console.log(`[RECHARGE] Soldier from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
	}
}

module.exports = Soldier;
