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
            .toMatch(/Error :/i);
        });
      });

      when('body is valid', function() {
      }, function() {
        it('should return a crit function', function() {
          expect(ranking.buildPlayerCritFunction('n_rounds', 42, 71))
            .toBeA('Function');
        });

        describe('critFn', function() {
          using([
            [ 'criterion' , 'rankin' ],
            [ 'n_rounds'  , 42       ],
            [ 'n_players' , 71       ],
          ], function(e, d) {
            it('should bind <n_rounds> and <n_players>, '+d, function() {
              var critFn = ranking.buildPlayerCritFunction(e.players, 42, 71);
              expect(critFn()).toBe(e.ranking);
            });
          });

          using([
            [ 'criterion'     , 'ranking' ],
            [ 'player_custom' , 1         ],
            [ 'tp'            , 2         ],
            [ 'sos'           , 3         ],
            [ 'cp'            , 4         ],
            [ 'ap'            , 5         ],
            [ 'ck'            , 6         ],
            [ 'game_custom'   , 7         ],
          ], function(e, d) {
            it('should take argument <'+e.criterion+'> '+d, function() {
              var critFn = ranking.buildPlayerCritFunction(e.criterion, 42, 71);
              expect(critFn(1,2,3,4,5,6,7)).toBe(e.ranking);
            });
          });
        });
      });
    });
  });

});
