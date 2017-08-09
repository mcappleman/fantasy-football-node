'use strict';

var PlayerService = require('./PlayerService');
var ESPNProjection = require('../models/ESPNProjection');

module.exports = {
	createOrUpdate,
	getProjections
}

function createOrUpdate(player, season) {

	return PlayerService.findOneOrCreate(player)
	.then((result) => {

		if (!result) {
			console.log('NO PLAYER FOUND OR RETURNED!!!');
			console.log(player);
		}

		return ESPNProjection.findOne({ player: result._id, season: season })
		.then((projection) => {

			if (!projection) {

				return ESPNProjection.create({
					season: season,
					player: result._id,
					completions: isNaN(player.completions) ? 0 : player.completions,
					passAttempts: isNaN(player.passingAttempts) ? 0 : player.passingAttempts,
					passYards: isNaN(player.passingYards) ? 0 : player.passingYards,
					passTDs: isNaN(player.passingTDs) ? 0 : player.passingTDs,
					passINTs: isNaN(player.interceptions) ? 0 : player.interceptions,
					rushAttempts: isNaN(player.rushAttempts) ? 0 : player.rushAttempts,
					rushYards: isNaN(player.rushYards) ? 0 : player.rushYards,
					rushTDs: isNaN(player.rushTDs) ? 0 : player.rushTDs,
					receivingReceptions: isNaN(player.receptions) ? 0 : player.receptions,
					receivingYards: isNaN(player.receivingYards) ? 0 : player.receivingYards,
					receivingTDs: isNaN(player.receivingTDs) ? 0 : player.receivingTDs,
					points: isNaN(player.points) ? 0 : player.points
				});

			}

			return ESPNProjection.update({ _id: projection._id },
				{ 
					$set: {
						completions: isNaN(player.completions) ? 0 : player.completions,
						passAttempts: isNaN(player.passingAttempts) ? 0 : player.passingAttempts,
						passYards: isNaN(player.passingYards) ? 0 : player.passingYards,
						passTDs: isNaN(player.passingTDs) ? 0 : player.passingTDs,
						passINTs: isNaN(player.interceptions) ? 0 : player.interceptions,
						rushAttempts: isNaN(player.rushAttempts) ? 0 : player.rushAttempts,
						rushYards: isNaN(player.rushYards) ? 0 : player.rushYards,
						rushTDs: isNaN(player.rushTDs) ? 0 : player.rushTDs,
						receivingReceptions: isNaN(player.receptions) ? 0 : player.receptions,
						receivingYards: isNaN(player.receivingYards) ? 0 : player.receivingYards,
						receivingTDs: isNaN(player.receivingTDs) ? 0 : player.receivingTDs,
						points: isNaN(player.points) ? 0 : player.points
					}
				}
			);

		})
		.catch((err) => {
			console.log('ERROR CREATING OR UPDATING PROJECTIONS');
			console.log(err);
			throw err;
		})

	})
	
}

function getProjections(year) {

	var returnProjections;

	return ESPNProjection.find({ season: year })
	.sort({ points: -1 })
	.then((projections) => {

		returnProjections = projections;
		return getVBDPlayers(year);

	})

}

function getVBDPlayers(year) {
	
}