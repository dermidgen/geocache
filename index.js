var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'geocache'});
var geocache = require('./geocache');

var port = process.env.HTTP_LISTEN || 8962;

geocache.listen(port, function(err){
	if (err) { log.trace(err); return; }
	log.info('listening on port %s', port);
});
