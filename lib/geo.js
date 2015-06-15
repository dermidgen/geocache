module.exports = geo;

var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});

var url = require('url');
var util = require('util');
var addressit = require('addressit');
var vasync = require('vasync');
var nodegeo = require('node-geocoder');

var provider = 'openstreetmap';
var adapter = 'http';

function geo(options) {
  if (!(this instanceof geo)) {
    return new geo(options);
  }

  this.options = options;
  this.coder = nodegeo(provider, adapter, options);

  return this;
}
