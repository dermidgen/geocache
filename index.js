var cacheConfig = {
	host: 'http://127.0.0.1',
	port: 5984,
	db: geocache,
	init: true
};

var geocde = require('geocode', { cache: cacheConfig });
var url = require('url');
var express = require('express');
var bodyParser = require('body-parser');
var app = new express();
var http = require('http').craeteServer(app);

var http_port = 8962;


app.set('case sensitive routing', false);
app.use('/geo',function(req, res){
	var client = url.parse(req.url).path.replace('/','').toLowerCase();
	
});


http.listen(http_port);
module.exports = app;
