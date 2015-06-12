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

var nominatim = 'https://nominatim.openstreetmap.org/search?q=%s&format=json&polygon=1&addressdetails=1';

var app = module.exports = restify.createServer({
  name: 'geocache',
  version: '0.1.0'
});

app.get('/geo/:address',function(req, res, next){

  var address = addressit(req.params.address).clean();
  address = address.text;

  vasync.waterfall([
      function hitcache(callback) {
        log.info('Checking cache for: %s', address);
        dbcache.get(address, function(err, body) {
          if (err) {
            log.debug('Not cached: %s', address);
            callback(null, null);
          } else {
            log.debug('Cached: %s', address);
            callback(null,body);
            res.send(body);
          }
        });
      },
      function geocode(res, callback) {
        if (res !== null) {
          log.info('Skip geocoding; cached: %s', address);
          return callback(null,res);
        }

        log.info('Geocoding address: %s', address);
        request(util.format(nominatim, address), function(err, result) {
          if (err || result.statusCode !== 200) {
            log.error('Error geocoding: %s', address);
            callback(err,null);
            return;
          }

          log.info('Fetched: %s', address);
          var record = [];
          try {
            record = JSON.parse(result.body);
            log.info('parsed response: %s', address);
          } catch (_err){
            log.info(_err);
            log.info('failed parsing response: %s', address);
            return callback(_err,null);
          }

          if (record.length === 0) {
            log.info('No result: %s', address);
            return callback({message:'No result'},null);
          } else {
            return callback(null, record[0]);
          }

        });

      },
      function cache(res, callback) {
        log.info('Caching: %s',address);
        dbcache.insert(res, address, function(error, body, header) {
          if (error) {
            log.error(error, body, header);
            callback(error, body);
          } else {
            log.info('Cached: %s',address);
            callback(null, res);
          }
        });
      }
    ], function(err,payload) {
      log.info('Done');
      log.info('Sending response: %s',address);

      if (err) {
        res.send(500,payload);
      } else {
        res.send(200,payload);
      }
  });

  return next();
});

app.put('/geo/:address', function(req, res, next){
  var address = addressit(req.params.address).clean().toString();
  var record = req.record;
  log.info('Checking address: %s', address);

  dbcache.insert(record, address, function(error, body, header) {
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

app.get('/geo/batch', function(req, res, next) {
  return next();
});

app.put('/geo/batch', function(req, res, next) {
  return next();
});
