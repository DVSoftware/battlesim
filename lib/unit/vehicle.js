const _ = require('lodash');
const Unit = require('../unit');
const Soldier = require('./soldier');
const gmean = require('compute-gmean');

class Vehicle extends Unit {
	constructor(squad) {
		super(squad);
		this.recharge = _.random(1000, 2000);
		this.army = squad.army;
		this.squadIndex = squad.squadIndex;
		this.operators = [];

		const operators = _.random(1, 3);
		console.log(`[INIT] Creating vehicle with ${operators} operators`);
		for (let i = 0; i < operators; i++) {
			console.log('[INIT] Creating vehicle operator');
			this.operators.push(new Soldier(this));
		}

		this.ready = 0;
		this.startRecharging();
	}

	getHealth() {
		return _.mean([...this.getActiveOperators().map(operator => operator.getHealth()), this.health]);
	}

	getActiveOperators() {
		return this.operators.filter(operator => operator.isActive());
	}

	isActive() {
		return this.getHealth() > 0 || _.some(this.operators, operator => operator.getHealth() > 0);
	}

	getAttackProbability() {
		return 0.5 * (1 + (this.getHealth())) * gmean(this.getActiveOperators().map(operator => operator.getAttackProbability()));
	}

	getDamage() {
		return 0.1 + _.sumBy(this.getActiveOperators(), operator => operator.getExperience());
	}

	receiveDamage(amount) {
		const activeOperators = this.getActiveOperators();
		const randomOperator = _.sample(activeOperators);

		this.setHealth(this.health - (amount * 0.6));

		randomOperator.receiveDamage(amount * (activeOperators.length === 1 ? 0.4 : 0.2));
		_.without(activeOperators, randomOperator).forEach(operator => {
			// The task says evenly and 10% each, which is not always the case. I distributed the rest of the damage evently to remaining operators
			operator.receiveDamage((amount * 0.2) / (activeOperators.length - 1));
		}, this);

		// console.log(`[DAMAGE] Vehicle from squad ${this.squad.squadIndex} from army '${this.squad.army.name}' received ${amount} damage. Health left ${this.getHealth()}`);

		if (!this.isActive()) {
			clearTimeout(this.rechargeTimeout);
			this.setHealth(0);
			activeOperators.forEach(operator => {
				operator.setHealth(0);
			});
		}
	}

	unitReady() {
		this.ready++;
		if (this.ready === this.getActiveOperators().length + 1) {
			// console.log(`[RECHARGE] Vehicle from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
			this.squad.unitReady();
		} else {
			// console.log(`[RECHARGE] Vehicle operator from squad ${this.squad.squadIndex} and army '${this.squad.army.name}' is ready`);
		}
	}

	levelUp() {
		this.getActiveOperators().forEach(operator => {
			operator.levelUp();
		});
	}

	rechargeUnit() {
		this.ready = 0;
		this.getActiveOperators().forEach(operator => {
			operator.startRecharging();
		});
		this.startRecharging();
	}
}

module.exports = Vehicle;
