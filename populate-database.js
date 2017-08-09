'use strict';

const ROOT_DIR = process.env.ROOT_DIR = __dirname;

require('dotenv').config({ path: `${ROOT_DIR}/.env` });
require('./config/mongoose.config');

var CSVService = require('./services/CSVService');

ReadPreviousCSVFiles()
.then(() => {
	process.exit(0);
})
.catch((err) => {
	console.log('ERROR\n', err);
	process.exit(1);
});

function ReadPreviousCSVFiles() {

	var now = new Date();
	var currentYear = now.getFullYear()-1;
	
	return new Promise((resolve, reject) => {

		iter();

		function iter() {

			if (currentYear < 2013) {
				return resolve();
			}

			var path = `${ROOT_DIR}/csv/PlayerStats${currentYear}.csv`;

			CSVService.readFile(path, currentYear)
			.then(() => {
				currentYear--;
				iter();
			})
			.catch((err) => {
				return reject(err);
			});

		}

	});

}