const _ = require('lodash');
const gmean = require('compute-gmean');
const Soldier = require('./unit/soldier');
const Vehicle = require('./unit/vehicle');

const Units = [Soldier, Vehicle]; // Could be made programatically

class Squad {
	static createSquads(squads, army, simulator) {
		const instances = [];
		this.simulator = simulator;

		if (squads.length < 2) {
			throw new Error('Army has to contain at least 2 squads');
		}

		squads.forEach((squad, squadIndex) => {
			instances.push(new Squad(squad, army, squadIndex, simulator));
		});

		return instances;
	}

	constructor(squad, army, squadIndex, simulator) {
		this.squad = squad;
		this.squadIndex = squadIndex;
		this.army = army;
		this.ready = 0;
		this.simulator = simulator;

		console.log(`[INIT] Initializing squad ${squadIndex}`);
		if (squad.units < 5) {
			throw new Error('Squad must have at least 5 units');
		}

		if (squad.units > 10) {
			throw new Error('Squad can have maximum 10 units');
		}

		if (['weakest', 'strongest', 'random'].indexOf(squad.strategy) < 0) {
			throw new Error('Unsupported strategy specified');
		}

		this.units = [];

		for (let i = 0; i < squad.units; i++) {
			const Unit = _.sample(Units);
			this.units.push(new (Unit)(this));
		}
	}

	getHealth() {
		return _.sumBy(this.getActiveUnits(), unit => unit.getHealth());
	}

	getAttackProbability() {
		return gmean(this.getActiveUnits().map(unit => unit.getAttackProbability()));
	}

	getDamage() {
		return _.sumBy(this.getActiveUnits(), unit => unit.getDamage());
	}

	getActiveUnits() {
		return this.units.filter(unit => unit.isActive());
	}

	isActive() {
		return _.some(this.units, unit => unit.isActive());
	}

	levelUp() {
		this.getActiveUnits().forEach(unit => {
			unit.levelUp();
		});
	}

	unitReady() {
		if (this.ready === 0) {
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army.name}' is recharging`);
		}
		this.ready++;
		if (this.ready === this.getActiveUnits().length) {
			this.ready = 0;
			console.log(`[RECHARGE] Squad ${this.squadIndex} from army '${this.army.name}' is ready`);
			this.attack();
		}
	}

	attack() {
		let squadToAttack;

		switch (this.squad.strategy) {
		case 'weakest':
			squadToAttack = this.simulator.getWeakestSquad(this);
			break;
		case 'strongest':
			squadToAttack = this.simulator.getStrongestSquad(this);
			break;
		case 'random':
			squadToAttack = this.simulator.getRandomSquad(this);
			break;
		default:
		}

		const attackerProbability = this.getAttackProbability();
		const defenderProbability = squadToAttack.getAttackProbability();

		console.log(`[ATTACK] Squad ${this.squadIndex} from army '${this.army.name}' attacking squad ${squadToAttack.squadIndex} from army '${squadToAttack.army.name}' with strategy ${this.squad.strategy}`);
		console.log(`         Probability: ${attackerProbability} > ${defenderProbability}`);
		if (attackerProbability > defenderProbability) {
			console.log('[ATTACK] Attack successful');
			squadToAttack.receiveDamage(this.getDamage());
			this.levelUp();
		} else {
			console.log('[ATTACK] Attack failed');
		}

		const activeArmies = this.simulator.getActiveArmies();
		if (activeArmies.length === 1) {
			console.log(`[END] Army '${activeArmies[0].name}' won the battle!`);
		} else {
			this.getActiveUnits().forEach(unit => {
				unit.rechargeUnit();
			});
		}
	}

	receiveDamage(damage) {
		const activeUnits = this.getActiveUnits();
		activeUnits.forEach(unit => {
			unit.receiveDamage(damage / activeUnits.length);
		});
		console.log(`[DAMAGE] Squad ${this.squadIndex} from army '${this.army.name}' received ${damage} damage. Health remaining ${this.getHealth()}`);

	}
}

module.exports = Squad;
