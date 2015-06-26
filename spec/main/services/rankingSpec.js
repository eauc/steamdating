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
          expect(ranking.buildPlayerCritFunction('toto=', 42, 71, 9))
            .toMatch(/Error :/i);
        });
      });

      when('body is valid', function() {
      }, function() {
        it('should return a crit function', function() {
          expect(ranking.buildPlayerCritFunction('n_rounds', 42, 71, 9))
            .toBeA('Function');
        });

        describe('critFn', function() {
          using([
            [ 'criterion' , 'ranking' ],
            [ 'n_rounds'  , 42       ],
            [ 'n_players' , 71       ],
            [ 'team_size' , 9        ],
          ], function(e, d) {
            it('should bind <'+e.criterion+'>', function() {
              var critFn = ranking.buildPlayerCritFunction(e.criterion, 42, 71, 9);
              expect(critFn()).toBe(e.ranking);
            });
          });

          using([
            [ 'criterion'     , 'ranking' ],
            [ 'player_custom' , 1         ],
            [ 'ttp'           , 2         ],
            [ 'tp'            , 3         ],
            [ 'sos'           , 4         ],
            [ 'cp'            , 5         ],
            [ 'ap'            , 6         ],
            [ 'ck'            , 7         ],
            [ 'game_custom'   , 8         ],
          ], function(e, d) {
            it('should take argument <'+e.criterion+'> '+d, function() {
              var critFn = ranking.buildPlayerCritFunction(e.criterion, 42, 71, 9);
              expect(critFn(1,2,3,4,5,6,7,8)).toBe(e.ranking);
            });
          });
        });
      });
    });
  });

});
