'use strict';

var Season = require('../models/Season');

var PlayerService = require('./PlayerService');

module.exports = {
	findOneOrCreate,
	getPreviousSeasons
}

function findOneOrCreate(player, lineObj, season) {

	if (season === 0) {
		console.log(player.name);
	}

	Season.findOne({ player: player._id, season: season })
	.then((result) => {

		if (!result) {

			return Season.create({
				player: player._id,
				season: season,
				gamesPlayed: lineObj.gamesPlayed,
				completions: lineObj.completions,
				passAttempts: lineObj.passAttempts,
				passYards: lineObj.passYards,
				passTDs: lineObj.passTDs,
				passINTs: lineObj.passINTs,
				rushAttempts: lineObj.rushAttempts,
				rushYards: lineObj.rushYards,
				rushTDs: lineObj.rushTDs,
				receivingTargets: lineObj.receivingTargets,
				receivingReceptions: lineObj.receivingReceptions,
				receivingYards: lineObj.receivingYards,
				receivingTDs: lineObj.receivingTDs,
				points: lineObj.points,
				team: lineObj.team
			});

		}

		return result;

	})
	.catch((err) => {
		console.log(`ERROR FINDONEORCREATE SEASONSERVICE ${player} ${lineObj} ${season}`);
		throw err;
	})
	
}

function getPreviousSeasons(playerId) {

	var seasons = {};

	return getSeason(playerId, 2016)
	.then((season) => {

		seasons[2016] = season;
		return getSeason(playerId, 2015);

	})
	.then((season) => {

		seasons[2015] = season;
		return getSeason(playerId, 2014);
		
	})
	.then((season) => {

		seasons[2014] = season;
		return getSeason(playerId, 2013);
		
	})
	.then((season) => {

		seasons[2013] = season;
		return seasons;
		
	})

}

function getSeason(playerId, year) {

	var seasonValues;

	return Season.findOne({ player: playerId, season: year })
	.populate('player')
	.then((season) => {

		if (!season) {
			return;
		}

		seasonValues = season;

		return PlayerService.getBaseline(season.player.position, year)
		.then((baseline) => {

			console.log(`season.points: ${seasonValues.points}, baseline points: ${baseline.stats.points}`);
			seasonValues.VBD = seasonValues.points - baseline.stats.points;
			return seasonValues;

		})

	});

}