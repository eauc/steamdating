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

    describe('clear(<length>)', function() {
      it('should clear all scenarios', function() {
        expect(scenario.clear(3, [ 1, 2]))
          .toEqual([null, null, null]);
      });
    });

    describe('setLength(<length>)', function() {
      when('scenario is longer than <length>', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should return scenario', function() {
          expect(scenario.setLength(1, this.coll))
            .toEqual(this.coll);
          expect(scenario.setLength(2, this.coll))
            .toEqual(this.coll);
          expect(scenario.setLength(3, this.coll))
            .toEqual(this.coll);
        });
      });

      when('scenario is shorter than <length>', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should append null', function() {
          expect(scenario.setLength(4, this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', null ]);
          expect(scenario.setLength(6, this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', null, null, null ]);
        });
      });
    });

    describe('set(<round_index>, <name>)', function() {
      when('scenario is shorter than <length>', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should append null and set scenario[<index>]', function() {
          expect(scenario.set(3, 'scenar2', this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', 'scenar2' ]);
          expect(scenario.set(5, 'scenar2', this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', null, null, 'scenar2' ]);
        });
      });

      when('scenario is not set', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should set scenario[<index>]', function() {
          expect(scenario.set(0, 'scenar2', this.coll))
            .toEqual([ 'scenar2', 'scenar4', 'scenar5' ]);
        });
      });

      when('scenario is set', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should overwrite scenario[<index>]', function() {
          expect(scenario.set(1, 'scenar2', this.coll))
            .toEqual([ null, 'scenar2', 'scenar5' ]);
          expect(scenario.set(2, 'scenar2', this.coll))
            .toEqual([ null, 'scenar4', 'scenar2' ]);
        });
      });
    });

    describe('reset(<index>)', function() {
      when('scenario is shorter than <length>', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should append null', function() {
          expect(scenario.reset(3, this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', null ]);
          expect(scenario.reset(5, this.coll))
            .toEqual([ null, 'scenar4', 'scenar5', null, null, null ]);
        });
      });

      when('scenario is not set', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should not modify scenario', function() {
          expect(scenario.reset(0, this.coll))
            .toEqual([ null, 'scenar4', 'scenar5' ]);
        });
      });

      when('scenario is set', function() {
        this.coll = [ null, 'scenar4', 'scenar5' ];
      }, function() {
        it('should not modify scenario[<index>]', function() {
          expect(scenario.reset(1, this.coll))
            .toEqual([ null, null, 'scenar5' ]);
          expect(scenario.reset(2, this.coll))
            .toEqual([ null, 'scenar4', null ]);
        });
      });
    });

    describe('hasScenario(<index>)', function() {
      it('should test whether round <index> has a scenario defined', function() {
        this.coll = [ null, '', 'scenar5' ];
        // null
        expect(scenario.hasScenario(0, this.coll)).toBe(false);
        // empty string
        expect(scenario.hasScenario(1, this.coll)).toBe(false);
        // ok
        expect(scenario.hasScenario(2, this.coll)).toBe(true);
      });
    });
  });

});
