'use strict';

var request = require('request');

module.exports = {
	promisify
}

function promisify(reqOpts) {
	
	return new Promise((resolve, reject) => {

		request(reqOpts, (err, res, body) => {

			if (err) { return reject(err); }


			if (res.statusCode !== 200) { 
				var error = new Error('Error in request');
				error.status = res.statusCode;
				return reject(error);
			}

			return resolve(body);

		});

	});

}