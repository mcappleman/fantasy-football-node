'use strict';

var ScrapeService = require('./services/ScrapeService');

ScrapeService.getAllProjections()
.then((projections) => {
	console.log(projections);
	process.exit(0);
})
.catch((err) => {
	console.log('ERROR\n', err);
	process.exit(1);
})