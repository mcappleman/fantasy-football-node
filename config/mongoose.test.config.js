'use strict';

const ROOT_DIR = process.env.ROOT_DIR = `${__dirname}/..`;
console.log(ROOT_DIR)
require('dotenv').config({ path: `${ROOT_DIR}/.env` });

const DB_NAME = 'fantasy_football_test';
const MONGO_HOST = process.env.MONGO_HOST_TEST || `mongodb://localhost/${DB_NAME}`;

var mongoose = require('mongoose');
mongoose.Promise = Promise;
var mongooseOptions = {};

connect(MONGO_HOST, mongooseOptions);

mongoose.connection.on('connecting', () => {

    console.log(`:: Establishing connection with mongo database @ ${MONGO_HOST} ::`);

});

mongoose.connection.on('connected', () => {

    console.log(`:: Connected with mongo database @ ${MONGO_HOST} ::`);

});

mongoose.connection.on('error', (err) => {

    console.log(`:: Error with mongo database @ ${MONGO_HOST} ::`);
    console.log(err.stack);

});

mongoose.connection.on('disconnected', () => {

    connect(MONGO_HOST, mongooseOptions);

});

function connect(host, opts) {

	// TODO: define keepAlive, connectTimeoutMS, socketTimeoutMS
	opts = opts || {};
	mongoose.connect(host, opts);

}

module.exports = mongoose.connection;