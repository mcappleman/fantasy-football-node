'use strict';

process.env.NODE_ENV = 'test';

var chai 		= require('chai');
var chaiHttp 	= require('chai-http');
var expect 		= chai.expect;

var PlayerService = require('../services/PlayerService');

describe('PlayerService', () => {

	it('should return with player id BrowAn00', () => {

		var id = PlayerService.getPlayerId('Antonio Brown', 0, []);

		expect(id).to.equal('BrowAn00');

	});

});