var hippie = require('hippie');
var geocache = require('../geocache');

module.exports = describe('Geocache', function(){
    describe('Transactional requests', function(){
        it('Can GET geocoded data for a single address', function(done){
            hippie(geocache)
            .json()
            .get('/geo/1 Infinite Loop, Cupertino, CA 95014')
            .expectStatus(200)
            .end(function(err, res, body){
                if (err) throw err;
                done();
            });
        });
        it.skip('Can PUT geocoded data for a single address', function(done){
            hippie(geocache)
            .json()
            .put('/geo/1 Infinite Loop, Cupertino, CA 95014')
            .expectStatus(200)
            .end(function(err, res, body){
                if (err) throw err;
                done();
            })
        });
    });
    describe('Batch requests', function(){
        it.skip('Can GET geocoded data for a batch of addresses', function(done){
            done();
        });
        it.skip('Can PUT geocoded data for a batch of addresses', function(done){
            done();
        });
    });
});
