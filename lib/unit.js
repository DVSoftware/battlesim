const _ = require('lodash');

class Unit {
	constructor(squad) {
		this.recharge = _.random(100, 2000);
		this.health = 100;
		this.squad = squad;
	}

	getHealth() {
		return this.health;
	}

	setHealth(health) {
		this.health = _.clamp(health, 0, 100);

		if (this.health === 0) {
			// console.log('[DESTROY] Unit destroyed');
			clearTimeout(this.rechargeTimeout);
		}
	}

	isActive() {
		return this.getHealth() > 0;
	}

	receiveDamage(amount) {
		this.setHealth(this.health - amount);
		// console.log(`[DAMAGE] Unit from squad ${this.squad.squadIndex} from army '${this.squad.army.name}' received ${amount} damage. Health left ${this.getHealth()}`);
	}

	getRecharge() {
		return this.recharge;
	}

	startRecharging() {
		this.rechargeTimeout = setTimeout(() => {
			this.unitReady();
		}, this.recharge);
	}

	rechargeUnit() {
		this.startRecharging();
	}
}

module.exports = Unit;
