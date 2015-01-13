'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('ranking', function() {

    var ranking;

    beforeEach(inject([ 'ranking', function(_ranking) {
      ranking = _ranking;
    }]));
    
    describe('buildPlayerCritFunction(<body>, <n_rounds>, <n_players>)', function() {
      when('body is invalid', function() {
      }, function() {
        it('should return error message', function() {
          expect(ranking.buildPlayerCritFunction('toto=', 42, 71))
            .toMatch(/Error : .*error.*/i);
        });
      });

      when('body is valid', function() {
      }, function() {
        it('should return a crit function', function() {
          expect(ranking.buildPlayerCritFunction('n_rounds', 42, 71))
            .toBeA('Function');
        });

        describe('critFn', function() {
          it('should bind <n_rounds> and <n_players>', function() {
            var critFn = ranking.buildPlayerCritFunction('n_rounds', 42, 71);
            expect(critFn()).toBe(42);

            critFn = ranking.buildPlayerCritFunction('n_players', 42, 71);
            expect(critFn()).toBe(71);
          });

          it('should take arguments <tp>,<sos>,<cp>,<ap>', function() {
            var critFn = ranking.buildPlayerCritFunction('tp', 42, 71);
            expect(critFn(1,2,3,4)).toBe(1);

            critFn = ranking.buildPlayerCritFunction('sos', 42, 71);
            expect(critFn(1,2,3,4)).toBe(2);

            critFn = ranking.buildPlayerCritFunction('cp', 42, 71);
            expect(critFn(1,2,3,4)).toBe(3);

            critFn = ranking.buildPlayerCritFunction('ap', 42, 71);
            expect(critFn(1,2,3,4)).toBe(4);
          });
        });
      });
    });
  });

});
