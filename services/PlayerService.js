'use strict';

module.exports = {
	getPlayerId
}

function getPlayerId(name, number, playerList) {

	var firstName = name.split(' ')[0];
	var lastName = name.split(' ')[1];
	var newId = lastName.slice(0,4) + firstName.slice(0,2) + '0' + number;

	if(playerList[newId] !== undefined) {
		var newNumber = number + 1;
		getPlayerId(name, newNumber, playerList);
	} else {
		return newId;
	}

}