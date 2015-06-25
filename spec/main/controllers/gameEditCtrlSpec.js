'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('gameEditCtrl', function(c) {

    var initCtrlWith;
    
    beforeEach(inject([
      '$rootScope',
      '$controller',
      'game',
      function($rootScope,
               $controller,
               game) {
        this.stateService = spyOnService('state');
        
        initCtrlWith = function(ctxt, game) {
          ctxt.scope = $rootScope.$new();
          ctxt.scope.edit = { game: game };
          ctxt.scope.state = {
            players: [
              { name: 'toto', lists: [], members: [
                { name: 'toto1', lists: [ { caster: 'caster11' }, { caster: 'caster12' } ] },
                { name: 'toto2', lists: [ { caster: 'caster21' }, { caster: 'caster22' } ] },
              ] },
              { name: 'titi', lists: [ { caster: 'caster3' }, { caster: 'caster4' } ] },
              { name: 'tata', lists: [], members: [
                { name: 'tata1', lists: [ { caster: 'caster15' }, { caster: 'caster16' } ] },
                { name: 'tata2', lists: [ { caster: 'caster25' }, { caster: 'caster26' } ] }
              ] }
            ]
          };
          ctxt.stateService.playersNotDropedInLastRound._retVal = ctxt.scope.state.players;

          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.updatePoints = jasmine.createSpy('updatePoints');
          ctxt.scope.storeState = jasmine.createSpy('storeState');

          $controller('gameEditCtrl', { 
            '$scope': ctxt.scope
          });
        };
        this.edit_game = game.create({ table: 4,
                                       p1: { name: 'toto' },
                                       p2: { name: 'titi' } });
        initCtrlWith(this, this.edit_game);
      }
    ]));

    it('should copy the game to edit', function() {
      expect(this.scope.game).not.toBe(this.scope.edit.game);
      expect(this.scope.game).toEqual(this.scope.edit.game);
    });

    it('should init players options', function() {
      expect(this.scope.players_options).toEqual([ 'tata', 'titi', 'toto' ]);
      expect(this.scope.p1_members_options).toEqual([ 'toto1', 'toto2' ]);
      expect(this.scope.p2_members_options).toEqual([]);
    });

    it('should init casters lists', function() {
      expect(this.scope.casters).toEqual({
        'toto': [ ],
        'toto1': [ 'caster11', 'caster12' ],
        'toto2': [ 'caster21', 'caster22' ],
        'titi': [ 'caster3', 'caster4' ]
      });
    });

    when('player1 is unknown', function() {
      this.edit_game.p1.name = 'unknown';
      initCtrlWith(this, this.edit_game);
    }, function() {
      it('should init casters lists', function() {
        expect(this.scope.casters).toEqual({
          'unknown': [ ],
          'titi': [ 'caster3', 'caster4' ]
        });
      });
    });
    
    when('player2 is unknown', function() {
      this.edit_game.p2.name = 'unknown';
      initCtrlWith(this, this.edit_game);
    }, function() {
      it('should init casters lists', function() {
        expect(this.scope.casters).toEqual({
          'toto': [ ],
          'toto1': [ 'caster11', 'caster12' ],
          'toto2': [ 'caster21', 'caster22' ],
          'unknown': [ ]
        });
      });
    });

    when('updatePlayersOptions()', function() {
      this.scope.updatePlayersOptions();
    }, function() {
      when('a new player has been set', function() {
        this.scope.game.p1.name = 'tata';
      }, function() {
        it('should init players options', function() {
          expect(this.scope.players_options).toEqual([ 'tata', 'titi', 'toto' ]);
          expect(this.scope.p1_members_options).toEqual([ 'tata1', 'tata2' ]);
          expect(this.scope.p2_members_options).toEqual([]);
        });

        it('should init casters lists', function() {
          expect(this.scope.casters).toEqual({
            'toto': [ ],
            'toto1': [ 'caster11', 'caster12' ],
            'toto2': [ 'caster21', 'caster22' ],
            'titi': [ 'caster3', 'caster4' ],
            // new player's list added to casters
            'tata': [ ],
            'tata1': [ 'caster15', 'caster16' ],
            'tata2': [ 'caster25', 'caster26' ],
          });
        });
      });
    });

    when('setWinLoss(<game>, <clicked>, <other>)', function() {
      this.scope.setWinLoss(this.game, 'p2', 'p1');
    }, function() {
      beforeEach(function() {
        this.gameService = spyOnService('game');
        this.game = { p1: { tournament: null }, p2: { tournament: 1 } };
      });
      
      using([
        [ 'clicked' ],
        [ null      ],
        [ 0         ],
      ], function(e, d) {
        when('<clicked> is not the current winner', function() {
          this.game = { p1: { tournament: null }, p2: { tournament: e.clicked } };
        }, function() {
          it('should set <clicked> as winner and <other> as loser, '+d, function() {
            expect(this.game.p1.tournament).toBe(0);
            expect(this.game.p2.tournament).toBe(1);
          });
        });
      });

      when('<clicked> is the current winner', function() {
        this.game = { p1: { tournament: null }, p2: { tournament: 1 } };
      }, function() {
        it('should set both as losers', function() {
          expect(this.game.p1.tournament).toBe(0);
          expect(this.game.p2.tournament).toBe(0);
        });
      });

      when('editing a subgame', function() {
      }, function() {
        it('should update main game\'s points', function() {
          expect(this.gameService.updatePointsFromSubGames)
            .toHaveBeenCalled();
          expect(this.scope.game)
            .toBe('game.updatePointsFromSubGames.returnValue');
        });
      });
    });

    when('close(<validate>)', function() {
      this.scope.close(this.validate);
    }, function() {
      beforeEach(function() {
        this.gameService = spyOnService('game');
        this.gameService.updatePoints.and.callFake(R.identity);

        this.validate = false;
        this.scope.game = {
          victory: 'assassination',
          p1: { name: 'toto', team_tournament: 1, tournament: 1, control: 3, army: 45 },
          p2: { name: 'titi', team_tournament: 0, tournament: 0, control: 1, army: 25 }
        };
      });
      
      when('<validate>', function() {
        this.validate = true;
      }, function() {
        it('should update main game\'s points', function() {
          expect(this.gameService.updatePoints)
            .toHaveBeenCalled();
        });

        it('should update game', function() {
          expect(this.scope.edit.game).toEqual({
            table: 4,
            victory: 'assassination',
            p1: { name: 'toto', list: null,
                  team_tournament: 1, tournament: 1, control: 3, army: 45, custom_field: null },
            p2: { name: 'titi', list: null,
                  team_tournament: 0, tournament: 0, control: 1, army: 25, custom_field: null },
            games: []
          });
        });
        
        it('should refresh points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });
        
        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });
      });

      it('should go back to previous page', function() {
        this.scope.edit.back = 'titi';
        this.scope.edit.pane = 'toto';

        this.scope.close(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('titi',
                                                          { pane: 'toto' });
      });
    });
  });

});
