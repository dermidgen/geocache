var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});

var url = require('url');
var util = require('util');
// var assert = require('assert');
var addressit = require('addressit');
var vasync = require('vasync');
var request = require('request');
var restify = require('restify');

var nano = require('nano')('http://localhost:5984');
var dbcache = nano.use('geocache');

var listen = 8962;

var nominatim = 'https://nominatim.openstreetmap.org/search?q=%s&format=json&polygon=0&addressdetails=1';

var app = module.exports = restify.createServer({
	name: 'geocache',
	version: '0.1.0'
});

app.get('/geo/:address',function(req, res, next){

	var address = addressit(req.params.address).clean().toString();
	log.info('Checking address: %s', address);

	vasync.waterfall([
			function hitcache(callback) {
				dbcache.get(address, function(err, body){
					if (err) {
						log.info('Not cached fetching: %s',address);
						// log.warn('Temp block, not issuing new requests');
						// res.send({statusCode: 429});
						callback(null, null);
					} else {
						callback(null,body);
						res.send(body);
					}
				});
			},
			function geocode(res, callback) {
				if (res) {
					return callback(null,res);
				}

				request(util.format(nominatim, address), function(err, result){
					if (err || result.statusCode !== 200) {
						log.error('Error geocoding: %s', address);
						callback(null,result);
						return;
					}

					log.info('Fetched: %s',address);

					var record = JSON.parse(result.body)[0];
					callback(null,record);
				});

			},
			function cache(res, callback) {
				if (res.statusCode && res.statusCode !== 200) {
					callback(true, res);
					return;
				}

				log.info('Fetched: %s',address);

				var record = JSON.parse(result.body)[0];
				dbcache.insert(record, address, function(error, body, header){
					if (error) {
						log.error(error, body, header);
					} else {
						log.info('Cached: %s',address);
					}
				});

				callback(null, record);
			}
		], function() {
				log.info('Done');
				log.info('Sending response: %s',address);
				res.send(res);
	});

	return next();
});

app.put('/geo/:address', function(req, res, next){
	var address = addressit(req.params.address).clean().toString();
	var record = req.record;
	log.info('Checking address: %s', address);

	dbcache.insert(record, address, function(error, body, header){
		if (error) {
			log.error(error, body, header);
		} else {
			log.info('Cached: %s',address);
		}
	});

	log.info('Sending response: %s',address);
	res.send(record);

	return next();
});

app.get('/geo/batch', function(req, res, next){
	return next();
});

app.put('/geo/batch', function(req, res, next){
	return next();
});
