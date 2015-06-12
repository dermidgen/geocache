# Geocache
Quick bootstrap POC to geocode single and batch addresses with caching support.

## Getting Started
Geocache comes as a RETS service and basic set of libraries. You can run the REST service directly or use the libraries to directly geolocate an address in your node application.

### Geocache Library
```
var geocache = require('geocache');
var address = '1 Infinite Loop, Cupertino, CA 95014';
geocache.get(address, function(res){
  console.info(res);
});
```

### Geocache Service
```
var geocache = 'http://localhost/geo';
var address = '1 Infinite Loop, Cupertino, CA 95014';
$.get(geocache + '/' + address, function(res){
  console.info(res);
});
```

## Notes
Geolocation is still locked up in paid services for any kind of real scale. This is actually fine for daily transactional requests, but can be a challenge when attempting to do initial loads and geolocate larger data sets. There are a number of services out there and each has varying degrees of completeness/accurracy.

 * Nominatim
   This service is part of OpenStreetMap and supports batch and transactional requests. This service seems to be the basis for a number of paid services. There are daily limits to Nominatim calls and they explicitly prefer you do batch transations.
 * MapQuest
   MapQuest has their own thing as well as Nominatim based services. They seem to support heavier usage of Nominatim and my guess is the two services have 
   made some sort of arrangement for MapQuest to cover some load and delivery and defer the hit to Nominatim directly.
 * Yahoo
   Paid service. Slightly more coverage Nominatim it seems.
 * Bing
   Roughly comparable coverage to MapQuest. Limited API.
 * Data.gov, Tiger, Census
   You can self serve and build your own stuff, but the data is always old and
   coverage/accuracy is iffy. Street level is good, but rooftop is generally 
   unreliable. This is the primary basis for almost _every_ service - and they 
   do some additional work on top of that.
 * Texas A&M
   They do some good stuff; probably better than most but not as good as Google.
 * Google
   The _best_ service out there. Limited daily requests, but several different models for where the requests come from and many ways work reasonably within their API limitations.
   Google has the _best_ coverage and the _best_ accurracy of any service. They have highly accurate lat/lng rooftop for virtually every possible address in the US.
 * CitySDK
   An effort by the US Census Bureau. Looks like they're using public data sources; likely that Google will still be better, but it's a cool effort. 

### Other Services
There are a _TON_ of geocode services out there. They all seem to suffer from the same general set of problems.

 * Coverage
 * Accurracy
 * Transaction Limits
 * Cost

### Caching
The rules around caching geo results are a little strange. On the one-hand most services have some sort of language about not being allowed to store their geo results; but their own documentation explicitly asks you to cache and not hit their servers a million times for the same address. Somewhat confusing.

This project does not attempt to circumvent any API terms in letter or in spirit. Caching is being done based on consistent documentation from service providers recommending this approach.

## Goals

 * Support multiple backends for getting geo results
 * Simple API to fetch and store geo results by street address
 * Walk-over multiple backends on failure to resolve address 
 * Support geo resulution enhancement via Google
 * Geo cache to couchdb for simple replicable cache

## Future

 * Support additional geocode services
 * Support more cache backends
   - Mongo
   - Redis
   - Firebase
   - Google
 * Request queues to accommodate API limits
