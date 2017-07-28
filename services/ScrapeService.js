'use strict';

var cheerio = require('cheerio');

var RequestService = require('./RequestService');

const ROWS_PER_PAGE = 40;
const BASE_URL = 'http://games.espn.com/ffl/tools/projections?leagueId=282421&startIndex='

var skip = 0;

var reqOpts = {
	method: 'GET',
	url: `${BASE_URL}${skip}`,
	json: true
}

module.exports = {
	getAllProjections,
	scrapeProjections
}

function getAllProjections() {

	var projectionList = [];

	return new Promise((resolve, reject) => {

		iter();

		function iter() {

			RequestService.promisify(reqOpts)
			.then((body) => {

				return scrapeProjections(body);

			})
			.then((result) => {

				projectionList = projectionList.concat(result.projections);

				skip += ROWS_PER_PAGE;
				reqOpts.url = `${BASE_URL}${skip}`;

				if (result.keepGoing) {
					return iter();
				}

				return resolve(projectionList);

			})
			.catch((err) => {
				return reject(err);
			})

		}

	});

}

function scrapeProjections(html) {

	var $ = cheerio.load(html);

	var projections = [];
	var keepGoing = false;

	var playerRows = $('table.playerTableTable').find('tr.pncPlayerRow');
	var index = 0;

	for (var key in playerRows) {

		if (typeof(playerRows[key]) === 'object' && index < ROWS_PER_PAGE){

			var projection = {};

			projection.playerName = $(playerRows[key]).find('td.playertablePlayerName a.flexpop').text();
			var stats = $(playerRows[key]).find('td.playertableStat');
			projection.completetions = $(stats['0']).text().split('/')[0];
			projection.passingAttempts = $(stats['0']).text().split('/')[1];
			projection.passingYards = $(stats['1']).text();
			projection.passingTDs = $(stats['2']).text();
			projection.interceptions = $(stats['3']).text();
			projection.rushAttempts = $(stats['4']).text();
			projection.rushYards = $(stats['5']).text();
			projection.rushTDs = $(stats['6']).text();
			projection.receptions = $(stats['7']).text();
			projection.receivingYards = $(stats['8']).text();
			projection.receivingTDs = $(stats['9']).text();
			projection.points = $(stats['10']).text();

			projections.push(projection);

			index++;

		}

		// console.log(stats);

	}

	if (projections.length === 40) {
		keepGoing = true;
	}

	return {
		projections,
		keepGoing
	};

}