'use strict';

var ScrapeService = require('./services/ScrapeService');

if (process.env.COMMAND === 'scrape-espn') {

	gatherESPNProjections();

} else if (process.env.COMMAND === 'write-csv') {

	writeCSVFile();

}

function gatherESPNProjections() {

	ScrapeService.getAllProjections()
	.then((projections) => {
		console.log(projections);
		process.exit(0);
	})
	.catch((err) => {
		console.log('ERROR\n', err);
		process.exit(1);
	});

}

function writeCSVFile() {
	
}