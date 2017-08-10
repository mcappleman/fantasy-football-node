'use strict';

var mongoose = require('mongoose');

var schema = new mongoose.Schema({
	'season': { 'type': Number },
	'player': { 'type': mongoose.Schema.Types.ObjectId, 'ref': 'Player', 'required': true },
	'completions': { 'type': Number, 'default': 0 },
	'passAttempts': { 'type': Number, 'default': 0 },
	'passYards': { 'type': Number, 'default': 0 },
	'passTDs': { 'type': Number, 'default': 0 },
	'passINTs': { 'type': Number, 'default': 0 },
	'rushAttempts': { 'type': Number, 'default': 0 },
	'rushYards': { 'type': Number, 'default': 0 },
	'rushTDs': { 'type': Number, 'default': 0 },
	'receivingReceptions': { 'type': Number, 'default': 0 },
	'receivingYards': { 'type': Number, 'default': 0 },
	'receivingTDs': { 'type': Number, 'default': 0 },
	'points': { 'type': Number, 'default': 0 },
	// 'team': { 'type': String, 'default': null },
}, { timestamps: true, versionKey: false });

var ESPNProjection = mongoose.model('ESPNProjection', schema);
module.exports = ESPNProjection;
