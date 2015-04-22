var cacheConfig = {
	host: 'http://127.0.0.1',
	port: 5984,
	db: 'geocache',
	init: true
};

var geocode = require('geocode', { cache: cacheConfig });
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var app = new express();
var http = require('http').createServer(app);
var request = require('request');
var debug = require('debug')('geocache');

var nano = require('nano')('http://localhost:5984');
var geocache = nano.use('geocache');

var http_port = 8962;


app.set('case sensitive routing', false);
app.use('/geo',function(req, res){
	var address = unescape(url.parse(req.url).path).replace('/','');
	debug(address);

	var uri = 'https://nominatim.openstreetmap.org/search?q='+address+'&format=json&polygon=1&addressdetails=1';

	geocache.get(address, function(err, body){
		if (err) {
			debug('Not cached fetching %s',address);
			request(uri, function(err, result){
				if (result.statusCode !== 200) {
					debug('Error geocoding %s', address);
					res.status(200).set('Content-Type', 'application/json').send(result);
					return;
				}

				debug('Fetched %s',address);

				var record = JSON.parse(result.body)[0];
				geocache.insert(record, address, function(error, body, header){
					if (error) {
						debug(error, body, header);
					} else {
						debug('Cached %s',address);
					}
				});

				debug('Sending response %s',address);
				res.status(200).set('Content-Type', 'application/json').send(record);
			});
		} else {
			debug('Return from cache %s',address);
			res.status(200).set('Content-Type', 'application/json').send(body);
		}
	});

});


http.listen(http_port);
module.exports = app;
