var hippie = require('hippie');
var geocache = require('../geocache');

module.exports = describe('Geocache', function(){
    describe('/geo endpoint', function(){
        it('returns a response from nominatim', function(done){
            hippie(geocache)
            .json()
            .get('/geo/28172 Via Del Cerro, San Juan Capistrano, CA 92675')
            .expectStatus(200)
            .end(function(err, res, body){
                if (err) throw err;
                done();
            })
        });
    });
});
