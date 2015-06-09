var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});

var url = require('url');
var util = require('util');
// var assert = require('assert');
// var vasync = require('vasync');
var request = require('request');
var restify = require('restify');

var nano = require('nano')('http://localhost:5984');
var dbcache = nano.use('geocache');

var listen = 8962;


var app = module.exports = restify.createServer({
	name: 'geocache',
	version: '1.0.0'
});

function nominatim(address, callback) {
	var url = 'https://nominatim.openstreetmap.org/search?q=%s&format=json&polygon=0&addressdetails=1';
	request(util.format(url, address), function(err, result){
		if (err || result.statusCode !== 200) {
			log.error('Error geocoding: %s', address);
			callback(err, result);
			return;
		}

		log.info('Fetched: %s',address);

		try {
			var record = JSON.parse(result.body)[0];
			callback(null, record);
		} catch (e) {
			console.log('Unable to parse JSON response');
			callback(e, null);
		}

	});
}

function google(address, callback) {

}

function mapquest(address, callback) {

}

app.get('/geo/:address',function(req, res, next){

	var address = req.params.address;
	log.info('Checking address: %s', address);

	dbcache.get(address, function(err, body){
		if (err) {
			log.info('Not cached fetching: %s',address);
			log.warn('Temp block, not issuing new requests');
			res.send({statusCode: 429});

			nominatim(address, function(err, result) {
				if (err) {
					res.send(result);
					return;
				}

				dbcache.insert(record, address, function(error, body, header){
					if (error) {
						log.error(error, body, header);
					} else {
						log.info('Cached: %s',address);
					}
				});

				log.info('Sending response: %s',address);
				res.send(record);
			});
			
		} else {
			log.info('Return from cache: %s',address);
			res.send(body);
		}
	});

	return next();
});
