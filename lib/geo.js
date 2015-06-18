module.exports = geo;

var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});

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
