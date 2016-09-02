var fs = require('fs'),
    readline = require('readline');

function readFile(path, year) {
	var rd = readline.createInterface({
	    input: fs.createReadStream(path),
	    output: process.stdout,
	    terminal: false
	});

	rd.on('line', function(line) {
		if(year < currentYear){
			addLine(line, year);
		} else {
			addProjection(line);
		}
	});

	rd.on('close', function() {
		filesDone[year] = true;
		if(year === currentYear){
			getVBDValues();
			rankPlayers('projectedVBDAverage', 'projectedPointsAverage');
			writeFiles();
		}else if(filesDone[currentYear-1] && filesDone[currentYear-2] && filesDone[currentYear-3]) {
			for(var player in playerData) {
				playerData[player] = getAverages(playerData[player]);
			}
			getProjections();
		}
	});
}

function writeFiles() {
	var header_line = 'Taken,Rank,Name,Position,ProjectPointsAverage,ProjectedVBDAverage,PointsAverage,VBDAverage,BestPointsYear,BestVBDYear,' + 
					  'Points_2016,VBD_2016,Team_2016,Points_2015,VBD_2015,Team_2015,Points_2014,VBD_2014,Team_2014,Points_2013,VBD_2013,Team_2013 \n';
	fs.writeFileSync('AllPlayers.csv', header_line, 'utf8', ErrorCallback);
	for(var player in playerData) {
		var writableLine = getCSVLine(playerData[player]) + '\n';
		fs.appendFileSync('AllPlayers.csv', writableLine, 'utf8');
	}
	console.log(playerData['BrowAn04'], playerData['FreeDe00'], playerData['ElliEz00']);
}

function ErrorCallback(err) {
	if(err) throw err;
}

function getCSVLine(player) {
	var str = ',' + player.rank + ',' + player.name + ',' + player.position + ',' + player.projectedPointsAverage + ',' +  player.projectedVBDAverage + ',' +  player.pointsAverage + ',' + player.VBDAverage + ',';
	if(player.bestPointsYear >= furthestYear) {
		str += player.bestPointsYear + ' ' + player[player.bestPointsYear]['team'] + ',';
	} else {
		str += ',';
	}
	if(player.bestVBDYear >= furthestYear) {
		str += player.bestVBDYear + ' ' + player[player.bestVBDYear]['team'] + ',';
	} else {
		str += ',';
	}
	str += getYearStats(currentYear, player);
	str += getYearStats(currentYear-1, player);
	str += getYearStats(currentYear-2, player);
	str += getYearStats(currentYear-3, player);
	return str;
}

function getYearStats(year, player){
	var str = '';
	if(player[year]){
		str += player[year]['points'] + ',' + player[year]['VBD'] + ',' + player[year]['team'];
	} else {
		str += ',,';
	}
	if(year !== currentYear-3){
		str += ',';
	}
	return str;
}

function addLine(line, year) {
	if(line.length > 0) {
		var lineObject = getLineObject(line);
		var playerId = lineObject.id;
		if(playerData[playerId] === undefined){
			playerData[playerId] = {id: playerId, name: lineObject.name, position: lineObject.position};
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
	player.pointsAverage = getAverage(player, 'points');
	player.VBDAverage = getAverage(player, 'VBD');
	player.bestPointsYear = getBestYear(player, 'points');
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

function getProjectedAverage(player, type) {
	var ratios = [.38, .38, .16, .08];
	var average = 0;
	var i = 0;
	for(var year = currentYear; year >= furthestYear; year--){
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

function getProjections() {
	readFile('./Yahoo_Projections' + (currentYear) + '.csv', currentYear);
}


function rankPlayers(rankKey, secondaryRankKey) {
	var rankedList = [];
	for(var player in playerData) {
		rankedList.push(playerData[player]);
	}


	for(var i = 0; i < rankedList.length; i++) {
		for(var j = i+1; j < rankedList.length; j++) {
			var currentPlayer = rankedList[i];
			var comparedPlayer = rankedList[j];
			if(Number(rankedList[j][rankKey]) > Number(rankedList[i][rankKey])) {
				var temp = rankedList[i];
				rankedList[i] = rankedList[j];
				rankedList[j] = temp;
			} else if(Number(rankedList[i][rankKey]) === Number(rankedList[j][rankKey])) {
				if(Number(rankedList[j][secondaryRankKey]) > Number(rankedList[i][secondaryRankKey])) {
					var temp = rankedList[i];
					rankedList[i] = rankedList[j];
					rankedList[j] = temp;
				}
			} 
		}
	}

	rankedList.forEach(function(player, index){
		playerData[player.id].rank = index+1;
	});

}

var nameList = [];
function addProjection(line) {
	var split = line.split(',');
	var nameSplit = split[0].split(' ');
	var name = nameSplit[0] + ' ' + nameSplit[1];
	var team = nameSplit[nameSplit.length-1];

	// Check to see if any names are the same
	// nameList.forEach(function(playerName) {
	// 	if(name === playerName) {
	// 		console.log(name);
	// 	}
	// });
	// nameList.push(name);
	var newName = true;
	for(var player in playerData){
		if(name === playerData[player].name && split[1] === playerData[player].position) {
			playerData[player][currentYear] = {
				points: split[6],
				team: team
			}
			newName = false;
		} 
	}
	if(newName) {
		var id = getPlayerId(name, 0);
		playerData[id] = {
			id: id,
			name: name,
			position: split[1]
		}
		playerData[id][currentYear] = {
			points: split[6],
			team: team
		}
	}
}

function getPlayerId(name, number) {
	var firstName = name.split(' ')[0];
	var lastName = name.split(' ')[1];
	var newId = lastName.slice(0,4) + firstName.slice(0,2) + '0' + number;
	if(playerData[newId] !== undefined){
		var newNumber = number + 1;
		getPlayerId(name, newNumber);
	} else {
		return newId;
	}
}

var baseQBId, baseRBId, baseWRId, baseTEId;

function getVBDValues() {
	baseQBId = getBaseId(12, 'QB');
	baseRBId = getBaseId(24, 'RB');
	baseWRId = getBaseId(30, 'WR');
	baseTEId = getBaseId(12, 'TE');

	for(var player in playerData) {
		if(playerData[player][currentYear] !== undefined) {
			playerData[player][currentYear].VBD = getVBD(playerData[player]).toFixed(3);
		}
		playerData[player].projectedVBDAverage = getProjectedAverage(playerData[player], 'VBD');
		playerData[player].projectedPointsAverage = getProjectedAverage(playerData[player], 'points');
	}
}

function getVBD(player) {
	var basePlayer;
	if(player.position === 'QB') {
		basePlayer = baseQBId;
	} else if(player.position === 'RB') {
		basePlayer = baseRBId;
	} else if(player.position === 'WR') {
		basePlayer = baseWRId;
	} else if(player.position === 'TE') {
		basePlayer = baseTEId;
	}
	var value = player[currentYear].points - playerData[basePlayer][currentYear].points;
	if(value <= 0){
		value = 0;
	}
	return value;
}

function getBaseId(rank, pos) {
	var rankedList = [];

	// Populate the list with position players
	for(var player in playerData){
		if(playerData[player].position === pos && playerData[player][currentYear] !== undefined) {
			rankedList.push(playerData[player]);
		}
	}

	// Sort players based off of projected points
	for(var i = 0; i < rankedList.length; i++) {
		for(var j = i+1; j < rankedList.length; j++) {

			if(Number(rankedList[j][currentYear]['points']) > Number(rankedList[i][currentYear]['points'])) {
				// console.log(rankedList[i], rankedList[j]);
				var temp = rankedList[i];
				rankedList[i] = rankedList[j];
				rankedList[j] = temp;
			}

		}
	}

	return rankedList[rank-1].id;
}