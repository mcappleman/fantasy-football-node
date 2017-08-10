'use strict';

var fs = require('fs');
var readline = require('readline');

var PlayerService = require('./PlayerService');
var SeasonService = require('./SeasonService');
var ESPNProjectionService = require('./ESPNProjectionService');

module.exports = {
	readFile,
	writeHeader,
	writePlayers
}

function readFile(path, season) {

	var splits = [];
	var index = 0;

	return new Promise((resolve, reject) => {

		var rd = readline.createInterface({
			input: fs.createReadStream(path),
			output: process.stdout,
			terminal: false
		});

		rd.on('line', function(line) {

			var split = line.split(',');
			if (split.length > 1) {
				splits.push(split);
			}
			index++;

		});

		rd.on('close', function() {

			storePlayers(splits, season)
			.then(() => {
				return resolve();
			})
			.catch((err) => {
				console.log(err);
				return reject(err);
			})

		});

	});

}

function writeHeader(year) {

	var headerLine = `,,,,Projected,Projected,Previous,Previous,${year},${year},${year-1},${year-1},${year-2},${year-2},${year-3},${year-3}\nTaken,Rank,Name,Position,Average,VBDAverage,Average,VBDAverage,Points,VBD,Points,VBD,Points,VBD,Points,VBD`;
	
	return new Promise((resolve, reject) => {

		fs.writeFile(`./csv/AllPlayers${year}.csv`, headerLine, 'utf8', (err) => {

			if (err) { return reject(err); }

			return resolve();

		});
		
	});

}

function writeLine(line, year) {

	return new Promise((resolve, reject) => {

		fs.appendFile(`./csv/AllPlayers${year}.csv`, line, 'utf8', (err) => {

			if (err) { return reject(err); }

			return resolve();

		});

	})

}

function writePlayers(year) {

	var index = 0;

	return ESPNProjectionService.getProjections(year)
	.then((projections) => {

		return new Promise((resolve, reject) => {

			iter();

			function iter() {

				if (index >= projections.length) {
					return resolve();
				}

				getLine(projections[index], index)
				.then((line) => {

					return writeLine(line, year);

				})
				.then(() => {
					index++;
					iter();
				})
				.catch((err) => {
					console.log(`ERROR WRITING THE PROJECTIONS`);
					return reject(err);
				})

			}

		})

	});

}

function getLine(projection, index) {

	var player;

	return PlayerService.findOne(projection.player)
	.then((result) => {

		player = result;
		return SeasonService.getPreviousSeasons(player._id);

	})
	.then((seasons) => {

		return `\n,${index+1},${player.name},${player.position},${0},${0},${0},${0},${projection.points},${projection.VBD},${seasons[2016] ? seasons[2016].points : 0},${seasons[2016] ? seasons[2016].VBD : 0},${seasons[2015] ? seasons[2015].points : 0},${seasons[2015] ? seasons[2015].VBD : 0},${seasons[2014] ? seasons[2014].points : 0},${seasons[2014] ? seasons[2014].VBD : 0}`;

	});

}

function storePlayers(splits, season) {

	var index = 0;

	return new Promise((resolve, reject) => {

		iter();

		function iter() {

			if (index >= splits.length) {
				console.log(`Completed for season ${season}`);
				return resolve();
			}

			storePlayer(splits[index], season)
			.then(() => {
				index++;
				iter();
			})
			.catch((err) => {
				console.log(`ERROR HERE STOREPLAYER ${splits[index]}`);
				return reject(err);
			})

		}

	})

}

function storePlayer(line, season) {

	var p = getLineObject(line);

	return PlayerService.findOneOrCreate(p)
	.then((player) => {

		return SeasonService.findOneOrCreate(player, p, season)

	})
	.catch((err) => {
		console.log(`ERROR STORING PLAYER IN STORE PLAYER ${line} ${season}`);
		throw err;
	});

}

function getLineObject(splitArray) {
	var realName = splitArray[1].split('\\')[0].split('*')[0].split('+')[0];
	var playerId = splitArray[1].split('\\')[1];
	return {
		name: realName, 
		pfrId: playerId, 
		position: splitArray[3],
		gamesPlayed: splitArray[5],
		completions: splitArray[7],
		passAttempts: splitArray[8],
		passYards: splitArray[9],
		passTDs: splitArray[10],
		passINTs: splitArray[11],
		rushAttempts: splitArray[12],
		rushYards: splitArray[13],
		rushTDs: splitArray[15],
		receivingTargets: splitArray[16],
		receivingReceptions: splitArray[17],
		receivingYards: splitArray[18],
		receivingTDs: splitArray[20],
		team: splitArray[2],
		points: splitArray[21]
	};
}