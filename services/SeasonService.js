'use strict';

var Season = require('../models/Season');

module.exports = {
	findOneOrCreate
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