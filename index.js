const config = require('config');
const Simulator = require('./lib/simulator');

const simulatorInstance = new Simulator(config.get('armies'));
