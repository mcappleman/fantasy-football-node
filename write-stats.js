'use strict';

const ROOT_DIR = process.env.ROOT_DIR = __dirname;

require('dotenv').config({ path: `${ROOT_DIR}/.env` });
require('./config/mongoose.config');

var CSVService = require('./services/CSVService');

const YEAR = 2017

CSVService.writeHeader(YEAR)
.then(() => {
	return CSVService.writePlayers(YEAR);
})
.then(() => {
	process.exit(0);
})
.catch((err) => {
	console.log(err);
	process.exit(1);
})