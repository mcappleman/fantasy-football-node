'use strict';

process.env.NODE_ENV = 'test';

var chai 		= require('chai');
var chaiHttp 	= require('chai-http');
var expect 		= chai.expect;

var ScrapeService = require('../services/ScrapeService');
var RequestService = require('../services/RequestService');

describe('ScrapeService', () => {

	it('should get all the projections from espn', (done) => {

		ScrapeService.getAllProjections()
		.then((projections) => {

			expect(projections).to.be.an('array');
			expect(projections.length).to.be.above(1000);

		})
		.then(done, done);

	});

	it('should get the projections for one page and return keep going being true', (done) => {

		var reqOpts = {
			method: 'GET',
			url: `http://games.espn.com/ffl/tools/projections?leagueId=282421&startIndex=0`,
			json: true
		}

		RequestService.promisify(reqOpts)
		.then((body) => {

			return ScrapeService.scrapeProjections(body);

		})
		.then((result) => {

			expect(result.projections).to.be.an('array');
			expect(result.projections.length).to.equal(40);
			expect(result.keepGoing).to.be.true;

		})
		.then(done, done);

	});

	it('should get the projections for one page and return keep going being false', (done) => {

		var reqOpts = {
			method: 'GET',
			url: `http://games.espn.com/ffl/tools/projections?leagueId=282421&startIndex=1000`,
			json: true
		}

		RequestService.promisify(reqOpts)
		.then((body) => {

			return ScrapeService.scrapeProjections(body);

		})
		.then((result) => {

			expect(result.projections).to.be.an('array');
			expect(result.projections.length).to.not.equal(40);
			expect(result.keepGoing).to.be.false;

		})
		.then(done, done);

	});

});