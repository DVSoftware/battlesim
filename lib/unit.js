const _ = require('lodash');

class Unit {
	/**
	 * Unit constructor
	 * @param {Squad} squad Squad instance
	 */
	constructor(squad) {
		this.recharge = _.random(100, 2000);
		this.health = 100;
		this.squad = squad;
	}

	/**
	 * Get unit health
	 * @returns {number} Unit health
	 */
	getHealth() {
		return this.health;
	}

	/**
	 * Set unit health
	 * @param {number} health Unit health
	 */
	setHealth(health) {
		this.health = _.clamp(health, 0, 100);

		if (this.health === 0) {
			// console.log('[DESTROY] Unit destroyed');
			clearTimeout(this.rechargeTimeout);
		}
	}

	/**
	 * Is unit active
	 * @returns {boolean} Unit active
	 */
	isActive() {
		return this.getHealth() > 0;
	}

	/**
	 * Receive the damage
	 * @param {number} amount Damage amount
	 */
	receiveDamage(amount) {
		this.setHealth(this.health - amount);
		// console.log(`[DAMAGE] Unit from squad ${this.squad.squadIndex} from army '${this.squad.army.name}' received ${amount} damage. Health left ${this.getHealth()}`);
	}

	/**
	 * Get recharge time
	 * @returns {number} Unit recharge time
	 */
	getRecharge() {
		return this.recharge;
	}

	/**
	 * Start recharging the unit
	 */
	startRecharging() {
		this.rechargeTimeout = setTimeout(() => {
			this.unitReady();
		}, this.recharge);
	}

	/**
	 * Method that is called by the parent to start recharging
	 */
	rechargeUnit() {
		this.startRecharging();
	}
}

module.exports = Unit;
