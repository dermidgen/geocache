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

var nominatim = 'https://nominatim.openstreetmap.org/search?q=%s&format=json&polygon=0&addressdetails=1';

var app = restify.createServer({
	name: 'geocache',
	version: '1.0.0'
});

app.get('/geo/:address',function(req, res, next){

	var address = req.params.address;
	log.info('Checking address: %s', address);

	dbcache.get(address, function(err, body){
		if (err) {
			log.info('Not cached fetching: %s',address);
			log.warn('Temp block, not issuing new requests');
			res.send({statusCode: 429});
			return;
			request(util.format(nominatim, address), function(err, result){
				if (result.statusCode !== 200) {
					log.error('Error geocoding: %s', address);
					res.send(result);
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

app.listen(listen, function(err){
	if (err) { log.trace(err); return; }
	log.info('listening on port %s', listen);
});
