'use strict';

const _ = require('lodash');
const Unit = require('../unit');
const Soldier = require('./soldier');
const gmean = require('compute-gmean');

class Vehicle extends Unit {
	/**
	 * Vehicle constructor
	 * @param {Squad} squad Squad instance
	 */
	constructor(squad) {
		super(squad);
		// TODO@dvs: Same as with Unit about the _.random thing? Including that now after super(), _.random has been called twice.
		this.recharge = _.random(1000, 2000);
		this.army = squad.army;
		this.squadIndex = squad.squadIndex;
		this.operators = [];

		// TODO@dvs: Why not in a Soldier.createSoldiers. Again with the _.random in a constructor? Or was it _.sample
		const operators = _.random(1, 3);
		console.log(`[INIT] Creating vehicle with ${operators} operators`);
		for (let i = 0; i < operators; i++) {
			console.log('[INIT] Creating vehicle operator');
			const operator = new Soldier(this);
			this.operators.push(operator);
			operator.on('ready', this.unitReady.bind(this));
		}
	}

	/**
	 * Get total health of vehicle and its operators
	 * @returns {number} Vehicle health
	 */
	getHealth() {
		return _.mean(this.getActiveOperators().map(operator => operator.getHealth()).concat([this.getVehicleHealth()]));
	}

	/**
	 * Get vehicle health
	 * @returns {number} Vehicle health
	 */
	getVehicleHealth() {
		return this.health;
	}

	/**
	 * Get active operators
	 * @returns {Array} Active vehicle operators
	 */
	getActiveOperators() {
		return this.operators.filter(operator => operator.isActive());
	}

	/**
	 * Is vehicle active
	 * @returns {boolean} Vehicle active
	 */
	isActive() {
		return this.getHealth() > 0 || _.some(this.operators, operator => operator.getHealth() > 0);
	}

	/**
	 * Get vehicle attack probability
	 * @returns {number} Vehicle attack probability
	 */
	getAttackProbability() {
		return 0.5 * (1 + (this.getHealth())) * gmean(this.getActiveOperators().map(operator => operator.getAttackProbability()));
	}

	/**
	 * Get vehicle damage
	 * @returns {number} Vehicle damage
	 */
	getDamage() {
		return 0.1 + _.sumBy(this.getActiveOperators(), operator => operator.getExperience());
	}

	/**
	 * Receive the damage
	 * @param {number} amount Damage amount
	 */
	receiveDamage(amount) {
		const activeOperators = this.getActiveOperators();
		const randomOperator = _.sample(activeOperators);

		this.setHealth(this.getVehicleHealth() - (amount * 0.6));

		// Random operator should receive 20% of the damage. If that's the only operator, he'll take the rest of the damage
		randomOperator.receiveDamage(amount * (activeOperators.length === 1 ? 0.4 : 0.2));
		_.without(activeOperators, randomOperator).forEach(operator => {
			// The task says evenly and 10% each, which is not always the case. I distributed the rest of the damage evenly to remaining operators
			operator.receiveDamage((amount * 0.2) / (activeOperators.length - 1));
		}, this);

		// console.log(`[DAMAGE] Vehicle from squad ${this.squad.squadIndex} from army '${this.squad.army.name}' received ${amount} damage. Health left ${this.getHealth()}`);

		// Vehicle is destroyed or all operators are killed. Terminate the vehicle or remaining operators.
		if (!this.isActive()) {
			clearTimeout(this.rechargeTimeout);
			this.setHealth(0);
			activeOperators.forEach(operator => {
				operator.setHealth(0);
			});
		}
	}

	/**
	 * Unit ready. When all operators and the vehicle are ready (charged), notify the squad.
	 */
	unitReady() {
		// Count ready units and compare to the operator count plus vehicle
		this.ready++;
		if (this.ready === this.getActiveOperators().length + 1) {
			// console.log(`[RECHARGE] Vehicle from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
			this.emit('ready');
		} else {
			// console.log(`[RECHARGE] Vehicle operator from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
		}
	}

	/**
	 * Level up, propagates to all operators
	 */
	levelUp() {
		this.getActiveOperators().forEach(operator => {
			operator.levelUp();
		});
	}

	/**
	 * Method that is called by the parent to start recharging
	 */
	rechargeUnit() {
		this.ready = 0;
		this.getActiveOperators().forEach(operator => {
			operator.rechargeUnit();
		});
		super.rechargeUnit();
	}
}

module.exports = Vehicle;
