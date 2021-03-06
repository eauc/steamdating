'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('settingsEditCtrl', function(c) {

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
            player: 'player_ranking',
            team: 'team_ranking'
          }
        };

        this.rankingService = spyOnService('ranking');
        this.playerService = spyOnService('player');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        $controller('settingsEditCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should init pane', function() {
      expect(this.scope.pane).toBe('custom_fields');
    });

    it('should init criterions', function() {
      expect(this.scope.criterions).toBeAn('Object');
    });

    it('should init player_test object', function() {
      expect(this.scope.player_test.ranking).toBe('player_ranking');
    });

    it('should init team_test object', function() {
      expect(this.scope.team_test.ranking).toBe('team_ranking');
    });

    it('should watch player_test object', function() {
      expect(this.scope.$watch)
        .toHaveBeenCalledWith('player_test', jasmine.any(Function), true);
    });

    describe('computePlayerTestRankings()', function() {
      var computePlayerTestRankings;

      beforeEach(function() {
        computePlayerTestRankings = findCallByArgs(this.scope.$watch, function(args) {
          return (args[0] === 'player_test');
        }).args[1];

        expect(computePlayerTestRankings).toBeA('Function');
      });

      beforeEach(function() {
        this.scope.player_test.n_rounds = 4;
        this.scope.player_test.n_players = 32;
        this.scope.player_test.ranking = 'ranking';
      });

      it('should try to build crit function', function() {
        computePlayerTestRankings();

        expect(this.rankingService.buildPlayerCritFunction)
          .toHaveBeenCalledWith('ranking', 4, 32, 1);
      });

      when('critFun build fails', function() {
        this.rankingService.buildPlayerCritFunction.and.returnValue('error');
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
        this.rankingService.buildPlayerCritFunction.and.returnValue(this.critFun);
      }, function() {
        it('should try to rank both test players', function() {
          computePlayerTestRankings();

          expect(this.playerService.rank)
            .toHaveBeenCalledWith(this.critFun,
                                  this.scope.player_test.player1);
          expect(this.playerService.rank)
            .toHaveBeenCalledWith(this.critFun,
                                  this.scope.player_test.player2);
        });

        when('player1 ranking fails', function() {
          var ctxt = this;
          this.playerService.rank.and.callFake(function(f, p) {
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
          this.playerService.rank.and.callFake(function(f, p) {
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
          this.playerService.rank.and.callFake(function(f, p) {
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
    
    describe('computeTeamTestRankings()', function() {
      var computeTeamTestRankings;

      beforeEach(function() {
        computeTeamTestRankings = findCallByArgs(this.scope.$watch, function(args) {
          return (args[0] === 'team_test');
        }).args[1];

        expect(computeTeamTestRankings).toBeA('Function');
      });

      beforeEach(function() {
        this.scope.team_test.n_rounds = 4;
        this.scope.team_test.n_teams = 32;
        this.scope.team_test.team_size = 3;
        this.scope.team_test.ranking = 'ranking';
      });

      it('should try to build crit function', function() {
        computeTeamTestRankings();

        expect(this.rankingService.buildPlayerCritFunction)
          .toHaveBeenCalledWith('ranking', 4, 32, 3);
      });

      when('critFun build fails', function() {
        this.rankingService.buildPlayerCritFunction.and.returnValue('error');
      }, function() {
        it('should set team_test error state', function() {
          computeTeamTestRankings();

          expect(this.scope.team_test.team1.rank).toBe('error');
          expect(this.scope.team_test.team2.rank).toBe('error');

          expect(this.scope.team_ranking_valid).toBe(false);
        });
      });

      when('critFun build succeeds', function() {
        this.critFun = jasmine.createSpy('critFun');
        this.rankingService.buildPlayerCritFunction.and.returnValue(this.critFun);
      }, function() {
        it('should try to rank both test teams', function() {
          computeTeamTestRankings();

          expect(this.playerService.rank)
            .toHaveBeenCalledWith(this.critFun,
                                  this.scope.team_test.team1);
          expect(this.playerService.rank)
            .toHaveBeenCalledWith(this.critFun,
                                  this.scope.team_test.team2);
        });

        when('team1 ranking fails', function() {
          var ctxt = this;
          this.playerService.rank.and.callFake(function(f, p) {
            return (p.name === 'p1') ? 'Error' : 4;
          });
        }, function() {
          it('should set team1 rank error', function() {
            computeTeamTestRankings();

            expect(this.scope.team_test.team1.rank).toBe('Error');
            expect(this.scope.team_test.team2.rank).toBe(4);

            expect(this.scope.team_ranking_valid).toBe(false);
          });
        });

        when('team2 ranking fails', function() {
          var ctxt = this;
          this.playerService.rank.and.callFake(function(f, p) {
            return (p.name === 'p2') ? 'Error' : 4;
          });
        }, function() {
          it('should set team1 rank error', function() {
            computeTeamTestRankings();

            expect(this.scope.team_test.team2.rank).toBe('Error');
            expect(this.scope.team_test.team1.rank).toBe(4);

            expect(this.scope.team_ranking_valid).toBe(false);
          });
        });

        when('both rankings succeed', function() {
          var ctxt = this;
          this.playerService.rank.and.callFake(function(f, p) {
            return (p.name === 'p1') ? 1 : 4;
          });
        }, function() {
          it('should set ranking as valid', function() {
            computeTeamTestRankings();

            expect(this.scope.team_test.team1.rank).toBe(1);
            expect(this.scope.team_test.team2.rank).toBe(4);

            expect(this.scope.team_ranking_valid).toBe(true);
          });
        });
      });
    });
    
    describe('doClose(<validate>)', function() {
      when('<validate>', function() {
      }, function() {
        when('player ranking is invalid', function() {
          this.scope.player_ranking_valid = false;
          this.scope.team_ranking_valid = true;
          this.scope.pane = 'toto';

          this.scope.doClose(true);
        }, function() {
          it('should warn user', function() {
            expect(this.promptService.prompt)
              .toHaveBeenCalledWith('alert', jasmine.any(String));
          });

          it('should display player ranking pane', function() {
            expect(this.scope.pane).toBe('player_ranking');
          });
        });

        when('team ranking is invalid', function() {
          this.scope.player_ranking_valid = true;
          this.scope.team_ranking_valid = false;
          this.scope.pane = 'toto';

          this.scope.doClose(true);
        }, function() {
          it('should warn user', function() {
            expect(this.promptService.prompt)
              .toHaveBeenCalledWith('alert', jasmine.any(String));
          });

          it('should display team ranking pane', function() {
            expect(this.scope.pane).toBe('team_ranking');
          });
        });

        when('ranking crits are valid', function() {
          this.scope.player_ranking_valid = true;
          this.scope.team_ranking_valid = true;

          this.scope.player_test.ranking = 'new_player_ranking';
          this.scope.team_test.ranking = 'new_team_ranking';

          this.scope.doClose(true);
        }, function() {
          it('should update state\'s rankings', function() {
            expect(this.scope.state.ranking.player).toBe('new_player_ranking');
            expect(this.scope.state.ranking.team).toBe('new_team_ranking');
          });

          it('should store state', function() {
            expect(this.scope.storeState).toHaveBeenCalled();
          });
        });
      });

      it('should go back to player list', function() {
        this.scope.doClose(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('players_ranking');
      });
    });
  });

});
