'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('rankingEditCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        spyOn(this.scope, '$watch');
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.storeState = jasmine.createSpy('storeState');

        this.scope.state = {
          ranking: {
            player: 'player_ranking'
          }
        };

        this.ranking = jasmine.createSpyObj('ranking', [
          'buildPlayerCritFunction',
          'srPlayerCrit'
        ]);
        this.player = jasmine.createSpyObj('player', ['rank']);

        this.window = jasmine.createSpyObj('$window', [ 'alert' ]);

        $controller('rankingEditCtrl', { 
          '$scope': this.scope,
          '$window': this.window,
          'ranking': this.ranking,
          'player': this.player
        });
      }
    ]));

    it('should init pane', function() {
      expect(this.scope.pane).toBe('player');
    });

    it('should init player_test object', function() {
      expect(this.scope.player_test.ranking).toBe('player_ranking');
    });

    it('should watch player_test object', function() {
      expect(this.scope.$watch)
        .toHaveBeenCalledWith('player_test', jasmine.any(Function), true);
    });

    describe('computePlayerTestRankings()', function() {
      var computePlayerTestRankings;

      beforeEach(function() {
        _.each(this.scope.$watch.calls.all(), function(c) {
          if(c.args[0] === 'player_test') {
            computePlayerTestRankings = c.args[1];
          }
        });
        expect(computePlayerTestRankings).toBeA('Function');
      });

      beforeEach(function() {
        this.scope.player_test.n_rounds = 4;
        this.scope.player_test.n_players = 32;
        this.scope.player_test.ranking = 'ranking';
      });

      it('should try to build crit function', function() {
        computePlayerTestRankings();

        expect(this.ranking.buildPlayerCritFunction)
          .toHaveBeenCalledWith('ranking', 4, 32);
      });

      when('critFun build fails', function() {
        this.ranking.buildPlayerCritFunction.and.returnValue('error');
      }, function() {
        it('should set player_test error state', function() {
          computePlayerTestRankings();

          expect(this.scope.player_test.player1.rank).toBe('error');
          expect(this.scope.player_test.player2.rank).toBe('error');

          expect(this.scope.player_ranking_valid).toBe(false);
        });
      });

      when('critFun build succeeds', function() {
        this.critFun = jasmine.createSpy('critFun');
        this.ranking.buildPlayerCritFunction.and.returnValue(this.critFun);
      }, function() {
        it('should try to rank both test players', function() {
          computePlayerTestRankings();

          expect(this.player.rank)
            .toHaveBeenCalledWith(this.scope.player_test.player1,
                                  this.critFun);
          expect(this.player.rank)
            .toHaveBeenCalledWith(this.scope.player_test.player2,
                                  this.critFun);
        });

        when('player1 ranking fails', function() {
          var ctxt = this;
          this.player.rank.and.callFake(function(p) {
            return (p.name === 'p1') ? 'Error' : 4;
          });
        }, function() {
          it('should set player1 rank error', function() {
            computePlayerTestRankings();

            expect(this.scope.player_test.player1.rank).toBe('Error');
            expect(this.scope.player_test.player2.rank).toBe(4);

            expect(this.scope.player_ranking_valid).toBe(false);
          });
        });

        when('player2 ranking fails', function() {
          var ctxt = this;
          this.player.rank.and.callFake(function(p) {
            return (p.name === 'p2') ? 'Error' : 4;
          });
        }, function() {
          it('should set player1 rank error', function() {
            computePlayerTestRankings();

            expect(this.scope.player_test.player2.rank).toBe('Error');
            expect(this.scope.player_test.player1.rank).toBe(4);

            expect(this.scope.player_ranking_valid).toBe(false);
          });
        });

        when('both rankings succeed', function() {
          var ctxt = this;
          this.player.rank.and.callFake(function(p) {
            return (p.name === 'p1') ? 1 : 4;
          });
        }, function() {
          it('should set ranking as valid', function() {
            computePlayerTestRankings();

            expect(this.scope.player_test.player1.rank).toBe(1);
            expect(this.scope.player_test.player2.rank).toBe(4);

            expect(this.scope.player_ranking_valid).toBe(true);
          });
        });
      });
    });

    describe('doReset(<type>)', function() {
      when('<type> is "player"', function() {
        this.ranking.srPlayerCrit.and.returnValue('toto');
      }, function() {
        it('should reset player ranking crit to SR default', function() {
          this.scope.player_test.ranking = 'toto';
          this.scope.doReset('player');
          expect(this.scope.player_test.ranking).toBe('toto');
        });
      });
    });
    
    describe('doClose(<validate>)', function() {
      when('<validate>', function() {
      }, function() {
        when('player ranking is invalid', function() {
          this.scope.player_ranking_valid = false;
          this.scope.pane = 'toto';

          this.scope.doClose(true);
        }, function() {
          it('should warn user', function() {
            expect(this.window.alert).toHaveBeenCalled();
          });

          it('should display player ranking pane', function() {
            expect(this.scope.pane).toBe('player');
          });
        });

        when('ranking crits are valid', function() {
          this.scope.player_ranking_valid = true;

          this.scope.player_test.ranking = 'new_ranking';


          this.scope.doClose(true);
        }, function() {
          it('should update state\'s rankings', function() {
            expect(this.scope.state.ranking.player).toBe('new_ranking');
          });

          it('should store state', function() {
            expect(this.scope.storeState).toHaveBeenCalled();
          });
        });
      });

      it('should go back to player list', function() {
        this.scope.doClose(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('players');
      });
    });
  });

});
