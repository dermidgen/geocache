var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});

var url = require('url');
var util = require('util');
var addressit = require('addressit');
var vasync = require('vasync');
var request = require('request');
var restify = require('restify');
var geo = require('./geo');

var nano = require('nano')('http://localhost:5984');
var dbcache = nano.use('geocache');

var listen = 8962;

var app = module.exports = restify.createServer({
  name: 'geocache',
  version: '0.1.0'
});

app.use(restify.bodyParser());

app.get('/geo/:address',function(req, res, next){

  var address = addressit(req.params.address).clean().text;

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
          }
        });
      },
      function geocode(res, callback) {
        if (res !== null) {
          log.info('Skip geocoding; cached: %s', address);
          return callback(null,res);
        }

        log.info('Geocoding address: %s', address);

        geo().coder.geocode(address)
        .then(function(res){
          log.info('Fetched: %s', address);
          
          if (res.length === 0) {
            log.info('No result: %s', address);
            callback({message:'No result'},null);
          } else {
            log.info(res);
            callback(null, res.shift());
          }

        })
        .catch(function(err){
          log.error('Error geocoding: %s', address);
          callback(err,null);
        });

      },
      function cache(res, callback) {
        log.info('Caching: %s',address);

        if (res._id && res._rev) {
          log.info('Skipping cache: %s',address);
          return callback(null, res);
        }

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

      next();
  });
});

app.get('/geo/cache/:address',function(req, res, next){

  var address = addressit(req.params.address).clean().text;

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

      next();
  });
});

app.put('/geo/:address', function(req, res, next){
  var address = addressit(req.params.address).clean().text;
  log.info('Checking POST address: %s', address);

  vasync.waterfall([
      function hitcache(callback) {
        log.info('Checking cache for: %s', address);
        dbcache.get(address, function(err, body) {
          if (err) {
            log.info('Not cached: %s', address);
            callback(null, null);
          } else {
            log.info('Cached: %s', address);
            callback(null,body);
          }
        });
      },
      function insert(res, callback){
        if (res === null) {
          log.info('Caching: %s', address);
          log.info(req.body);
          dbcache.insert(req.body, address, function(error, body, header) {
            if (error) {
              log.error(error, body, header);
              callback(error, null);
            } else {
              log.info('Cached: %s',address);
              callback(null, true);
            }
          });
        } else {
          callback(null, true);
        }
      }
    ], function(err,payload) {
      log.info('Done');
      log.info('Sending response: %s',address);

      if (err) {
        res.send(500,false);
      } else {
        res.send(200,true);
      }

      next();
  });


});

app.get('/geo/batch', function(req, res, next) {
  return next();
});

app.put('/geo/batch', function(req, res, next) {
  return next();
});
