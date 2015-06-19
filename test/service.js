var hippie = require('hippie');
var geocache = require('../lib/service');

var good_address = '18 Mallard Irvine, CA 92604';
var bad_address = '1 Infinite Loop, Cupertino, CA 95014';

var fixtures = {
    address: require('./fixtures/address.json')
};

module.exports = describe('Geocache', function(){
    describe('Transactional requests', function(){
        it('Can GET geocoded data for a single address', function(done){
            this.timeout(7000);
            hippie(geocache)
            .json()
            .get('/geo/cache/' + good_address)
            .expectStatus(200)
            .end(function(err, res, body){
                if (err) throw err;
                done();
            });
        });
        it('Can PUT geocoded data for a single address', function(done){
            hippie(geocache)
            .json()
            .put('/geo/' + good_address)
            .send(fixtures.address)
            .expectStatus(200)
            .end(function(err, res, body){
                if (err) throw err;
                done();
            });
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
