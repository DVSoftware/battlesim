'use strict';

const EventEmitter = require('events');
const _ = require('lodash');

class Unit extends EventEmitter {
	/**
	 * Unit constructor
	 * @param {Squad} squad Squad instance
	 */
	constructor(squad) {
		super();
		// TODO@dvs: Shouldn't the _.random be called by the invoker of the constructor? _.clamp?
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
	 * Get unit damage
	 * @returns {number} Unit damage
	 */
	getDamage() {
		return 0;
	}

	/**
	 * Get unit attack probability
	 * @returns {number} Unit attack probability
	 */
	getAttackProbability() {
		return 0;
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
		this.setHealth(this.getHealth() - amount);
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
	 * Level up
	 */
	levelUp() {
		// Base class does not have experience
	}

	/**
	 * Unit is recharged, notify the parent squad/vehicle
	 */
	unitReady() {
		this.emit('ready', this);
		// console.log(`[RECHARGE] Soldier from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
	}

	/**
	 * Method that is called by the parent to start recharging
	 */
	rechargeUnit() {
		this.rechargeTimeout = setTimeout(() => {
			this.unitReady();
		}, this.recharge);
	}
}

module.exports = Unit;
