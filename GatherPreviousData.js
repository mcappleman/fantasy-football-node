var fs = require('fs'),
    readline = require('readline');

function readFile(path, year) {
	var rd = readline.createInterface({
	    input: fs.createReadStream(path),
	    output: process.stdout,
	    terminal: false
	});

	rd.on('line', function(line) {
	    addLine(line, year);
	});

	rd.on('close', function() {
		filesDone[year] = true;
		if(filesDone[currentYear-1] && filesDone[currentYear-2] && filesDone[currentYear-3]){
			writeFiles();
		}
	});
}

function writeFiles() {
	fs.writeFileSync('AllPlayers.csv', 'Name,Position,PointsAverage,VBDAverage,BestPointsYear,BestVBDYear \n', 'utf8', ErrorCallback);
	for(var player in playerData){
		if(playerData[player].name )
		playerData[player] = getAverages(playerData[player]);
		var writableLine = getCSVLine(playerData[player]) + '\n';
		fs.appendFileSync('AllPlayers.csv', writableLine, 'utf8');
	}
	console.log(playerData['BrowAn04']);
}

function ErrorCallback(err) {
	if(err) throw err;
}

function getCSVLine(player) {
	var str = player.name + ',' + player.position + ',' + player.fantasyAverage + ',' + player.VBDAverage + ',';
	if(player.bestFantasyYear >= furthestYear) {
		str += player.bestFantasyYear + ' ' + player[player.bestFantasyYear]['team'] + ',';
	} else {
		str += ',';
	}
	if(player.bestVBDYear >= furthestYear) {
		str += player.bestVBDYear + ' ' + player[player.bestVBDYear]['team'];
	}
	return str;
}

function addLine(line, year) {
	if(line.length > 0) {
		var lineObject = getLineObject(line);
		var playerId = lineObject.id;
		if(playerData[playerId] === undefined){
			playerData[playerId] = {name: lineObject.name, position: lineObject.position};
		}
		playerData[playerId][year] = {points: lineObject.points, VBD: lineObject.VBD, team: lineObject.team}
	}
}

function getLineObject(line) {
	var splitArray = line.split(',');
	var realName = splitArray[1].split('\\')[0].split('*')[0].split('+')[0];
	var playerId = splitArray[1].split('\\')[1];
	return {
		name: realName, 
		id: playerId, 
		position: splitArray[3],
		team: splitArray[2],
		points: splitArray[21],
		VBD: splitArray[24]
	};
}

function getAverages(player) {
	player.fantasyAverage = getAverage(player, 'points');
	player.VBDAverage = getAverage(player, 'VBD');
	player.bestFantasyYear = getBestYear(player, 'points');
	player.bestVBDYear = getBestYear(player, 'VBD');
	return player;
}

function getAverage(player, type) {
	var ratios = [.6, .3, .1];
	var average = 0;
	var i = 0;
	for(var year = currentYear-1; year >= furthestYear; year--){
		if(player[year]){
			if(player[year][type]){
				average += ratios[i] * player[year][type];
			}
		}
		i++;
	}
	return average.toFixed(3);
}

function getBestYear(player, type) {
	var bestYear;

	for(var year = currentYear-1; year >= furthestYear; year--) {
		if(player[year]) {
			if(!bestYear) {
				bestYear = year;
			}
			if(Number(player[year][type]) > Number(player[bestYear][type])) {
				bestYear = year;
			}
		}
	}

	return bestYear;
}

var now = new Date();
var currentYear = now.getFullYear();
var playerData = {};
var furthestYear = currentYear-3;
var filesDone = {};
readFile('./PlayerStats' + (currentYear - 1) + '.csv', currentYear - 1);
readFile('./PlayerStats' + (currentYear - 2) + '.csv', currentYear - 2);
readFile('./PlayerStats' + (currentYear - 3) + '.csv', currentYear - 3);
