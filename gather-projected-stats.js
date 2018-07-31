'use strict';

const ROOT_DIR = process.env.ROOT_DIR = __dirname;
const SEASON = new Date().getFullYear();

require('dotenv').config({ path: `${ROOT_DIR}/.env` });
require('./config/mongoose.config');

var ScrapeService = require('./services/ScrapeService');
var ESPNProjectionService = require('./services/ESPNProjectionService');

ScrapeService.getAllProjections()
.then((projections) => {

	var index = 0;

	return new Promise((resolve, reject) => {

		iter();

		function iter() {

			if (index >= projections.length) {
				return resolve();
			}

			ESPNProjectionService.createOrUpdate(projections[index], SEASON)
			.then(() => {

				index++;
				iter();

			})
			.catch((err) => {
				return reject(err);
			})

		}

	})

})
.then(() => {
	process.exit(0);
})
.catch((err) => {
	console.log('ERROR\n', err);
	process.exit(1);
});