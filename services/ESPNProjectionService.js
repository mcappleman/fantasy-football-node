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
	.populate('player')
	.then((projections) => {

		returnProjections = projections;
		return getBaselinePlayers(year);

	})
	.then((baselines) => {

		returnProjections.forEach((player) => {

			player.VBD = player.points - baselines[player.player.position].stats.points;

		});

		return returnProjections;

	});

}

function getBaselinePlayers(year) {

	var baselinePlayers = {};
	var sort = {
		points: -1
	}

	return PlayerService.getProjectedBaseline('QB', year)
	.then((players) => {

		baselinePlayers.QB = players[0];
		return PlayerService.getProjectedBaseline('RB', year);

	})
	.then((players) => {

		baselinePlayers.RB = players[0];
		return PlayerService.getProjectedBaseline('WR', year);

	})
	.then((players) => {

		baselinePlayers.WR = players[0];
		return PlayerService.getProjectedBaseline('TE', year);

	})
	.then((players) => {

		baselinePlayers.TE = players[0];
		return PlayerService.getProjectedBaseline('K', year);

	})
	.then((players) => {

		baselinePlayers.K = players[0];
		return PlayerService.getProjectedBaseline('D/ST', year);

	})
	.then((players) => {

		baselinePlayers['D/ST'] = players[0];
		return baselinePlayers

	});
	
}
