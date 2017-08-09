'use strict';

process.env.NODE_ENV = 'test';

require('../config/mongoose.test.config');

var chai 		= require('chai');
var chaiHttp 	= require('chai-http');
var expect 		= chai.expect;

var PlayerService = require('../services/PlayerService');
var Player = require('../models/Player');

describe('PlayerService', () => {

	before((done) => {

		Player.create({
			pfrId: 'ElliEz00',
			name: 'Ezekiel Elliott',
			position: 'RB'
		})
		.then(() => {

			return;

		}).then(done,done);

	});

	after((done) => {

		Player.collection.drop()
		.then(() => {
			return;
		}).then(done,done);

	});

	it('should return with player id BrowAn00', (done) => {

		PlayerService.getPlayerId('Antonio Brown', 0, [])
		.then((id) => {
			
			expect(id).to.equal('BrowAn00');

		}).then(done,done);


	});

	it('should return with player id ElliEz01', (done) => {

		PlayerService.getPlayerId('Ezekiel Elliott', 0, [])
		.then((id) => {
			
			expect(id).to.equal('ElliEz01');

		}).then(done,done);


	});

	it('should create a player with a pfrId', (done) => {

		PlayerService.findOneOrCreate({
			pfrId: 'BrowAn00',
			name: 'Antonio Brown',
			position: 'WR'
		})
		.then((result) => {

			expect(result.pfrId).to.equal('BrowAn00');
			expect(result.name).to.equal('Antonio Brown');
			expect(result.position).to.equal('WR');

		}).then(done,done);

	});

	it('should create a player without a pfrId', (done) => {

		PlayerService.findOneOrCreate({
			name: 'Leonard Fournette',
			position: 'RB'
		})
		.then((result) => {

			expect(result.pfrId).to.equal('FourLe00');
			expect(result.name).to.equal('Leonard Fournette');
			expect(result.position).to.equal('RB');

		}).then(done,done);

	});

	it('should create a player without a pfrId and same name but different position', (done) => {

		PlayerService.findOneOrCreate({
			name: 'Ezekiel Elliott',
			position: 'TE'
		})
		.then((result) => {

			expect(result.pfrId).to.equal('ElliEz01');
			expect(result.name).to.equal('Ezekiel Elliott');
			expect(result.position).to.equal('TE');

		}).then(done,done);

	});

	it('should find a player based on its pfrId', (done) => {

		PlayerService.findOneOrCreate({
			pfrId: 'ElliEz00'
		})
		.then((result) => {

			expect(result.pfrId).to.equal('ElliEz00');
			expect(result.name).to.equal('Ezekiel Elliott');
			expect(result.position).to.equal('RB');

		}).then(done,done);

	});

	it('should find a player based on its name and position', (done) => {

		PlayerService.findOneOrCreate({
			name: 'Ezekiel Elliott',
			position: 'RB'
		})
		.then((result) => {

			expect(result.pfrId).to.equal('ElliEz00');
			expect(result.name).to.equal('Ezekiel Elliott');
			expect(result.position).to.equal('RB');

		}).then(done,done);

	});

});