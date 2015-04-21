'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('scenario', function() {

    var scenario;
    var $httpBackend;

    beforeEach(inject([
      'scenario',
      '$httpBackend',
      function(_scenario,
               _$httpBackend) {
        scenario = _scenario;
        $httpBackend = _$httpBackend;
      }
    ]));

    describe('init()', function() {
      it('should download the list of scenarios', function() {
        $httpBackend.expectGET('/data/scenarios.json')
          .respond(200);
        
        scenario.init();

        $httpBackend.flush();
      });

      when('data is downloaded', function() {
        $httpBackend.expectGET('/data/scenarios.json')
          .respond(200, ['scenarios']);

        var ctxt = this;
        scenario.init().then(function(data) {
          ctxt.ret = data;
        });

        $httpBackend.flush();
      }, function() {
        it('should resolve the data', function() {
          expect(this.ret).toEqual(['scenarios']);
        });
      });
    });
  });

});
