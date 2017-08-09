'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	'name': { 'type': String, 'required': true },
	'pfrId': { 'type': String, 'default': null },
	'position': { 'type': String, 'default': null },
}, { timestamps: true, versionKey: false });

var Player = mongoose.model('Player', schema);
module.exports = Player;