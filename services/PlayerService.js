'use strict';

var Player = require('../models/Player');

const BASELINES = {
	QB: process.env.BASELINE_QB || 12,
	RB: process.env.BASELINE_RB || 24,
	WR: process.env.BASELINE_WR || 24,
	TE: process.env.BASELINE_TE || 12,
	K: process.env.BASELINE_K || 12,
	'D/ST': process.env.BASELINE_DEF || 12,
}
const NAME_ENDINGS = ['Jr.', 'Sr.', 'III', 'V', 'II'];

module.exports = {
	findOne,
	findOneOrCreate,
	getBaseline,
	getProjectedBaseline,
	getPlayerId
}

function findOne(playerId) {

	return Player.findOne({ _id: playerId });

}

function findOneOrCreate(player) {

	if (player.pfrId) {

		return Player.findOne({ pfrId: player.pfrId })
		.then((result) => {

			if (!result) {

				return Player.create({
					pfrId: player.pfrId,
					name: player.name,
					position: player.position
				});

			}

			return result;

		})
		.catch((err) => {
			console.log(`ERROR IN PLAYERSERVICE FINDORCREATE WITH PFRID ${player}`);
			throw err;
		});

	}

	var searchAbleName = getSearchAbleName(player.name);

	return Player.find({ name: searchAbleName, position: player.position })
	.then((results) => {

		if (results.length === 0) {

			if (!player.name) {
				console.log(player);
			}

			return getPlayerId(player.name, 0)
			.then((id) => {

				return Player.create({
					pfrId: id,
					name: player.name,
					position: player.position
				});

			});

		}

		return results[0];

	})
	.catch((err) => {
		console.log(`ERROR IN PLAYERSERVICE FINDORCREATE WITHOUT PFRID ${JSON.stringify(player)}`);
		console.log(err);
		throw err;
	});

}

function getPlayerId(name, number) {

	var firstName = name.split(' ')[0];
	var lastName = name.split(' ')[1];
	var newId = lastName.slice(0,4) + firstName.slice(0,2) + '0' + number;

	return Player.find({ pfrId: newId })
	.then((results) => {

		if (results.length > 0) {
			var newNumber = number + 1;
			return getPlayerId(name, newNumber);
		}

		return newId;

	});

}

function getBaseline(position, year) {

	return Player.aggregate([
		{
			$match: {
				position: position
			}
		},
		{
			$lookup: {
				from: 'seasons',
				localField: '_id',
				foreignField: 'player',
				as: 'stats'
			}
		},
		{
			$addFields: {
	            stats: {
	                "$arrayElemAt": [
	                    {
	                        "$filter": {
	                            "input": "$stats",
	                            "as": "stat",
	                            "cond": {
	                                "$eq": [ "$$stat.season", year ]
	                            }
	                        }
	                    }, 0
	                ]
	            }
			}
		},
		{
			$sort: { 'stats.points': -1 }
		},
		{
			$skip: BASELINES[position]-1
		},
		{
			$limit: 1
		}
	])
	.then((results) => {
		return results[0];
	});

}

function getProjectedBaseline(position, year) {

	return Player.aggregate([
		{
			$match: {
				position: position
			}
		},
		{
			$lookup: {
				from: 'espnprojections',
				localField: '_id',
				foreignField: 'player',
				as: 'stats'
			}
		},
		{
			$addFields: {
	            stats: {
	                "$arrayElemAt": [
	                    {
	                        "$filter": {
	                            "input": "$stats",
	                            "as": "stat",
	                            "cond": {
	                                "$eq": [ "$$stat.season", year ]
	                            }
	                        }
	                    }, 0
	                ]
	            }
			}
		},
		{
			$sort: { 'stats.points': -1 }
		},
		{
			$skip: BASELINES[position]-1
		},
		{
			$limit: 1
		}
	]);

}

function getSearchAbleName(name) {

	var split = name.split(' ');

	if (split.length === 2) {
		return name;
	}

	var endingIndex = 0;
	var returnValue = split[0];

	for (var i = split.length-1; i > 1; i--) {

		NAME_ENDINGS.forEach((ending) => {

			if (split[i].indexOf(ending) > -1) {
				endingIndex = i;
			}

		});

	}

	for (var i = 1; i < endingIndex; i++) {

		returnValue += ' ' + split[i];

	}

	return returnValue;

}