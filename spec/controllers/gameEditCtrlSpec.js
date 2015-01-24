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
        initCtrlWith = function(ctxt, game) {
          ctxt.scope = $rootScope.$new();
          ctxt.scope.edit = { game: game };
          ctxt.scope.state = {
            players: [ { name: 'toto', lists: [ { caster: 'caster1' }, { caster: 'caster2' } ] },
                       { name: 'titi', lists: [ { caster: 'caster3' }, { caster: 'caster4' } ] } ]
          };
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.updatePoints = jasmine.createSpy('updatePoints');
          ctxt.scope.storeState = jasmine.createSpy('storeState');

          $controller('gameEditCtrl', { 
            '$scope': ctxt.scope
          });
        };
        this.edit_game = game.create(4, 'toto', 'titi');
        initCtrlWith(this, this.edit_game);
      }
    ]));

    it('should copy the game to edit', function() {
      expect(this.scope.game).not.toBe(this.scope.edit.game);
      expect(this.scope.game).toEqual(this.scope.edit.game);
    });

    it('should init casters lists', function() {
      expect(this.scope.casters).toEqual({
        'toto': [ 'caster1', 'caster2' ],
        'titi': [ 'caster3', 'caster4' ]
      });
    });

    describe('setWinLoss(<game>, <winner>, <loser>)', function() {
      it('should update tournament points', function() {
        var game = { p1: { tournament: null }, p2: { tournament: null } };
        this.scope.setWinLoss(game, 'p2', 'p1');
        expect(game.p1.tournament).toBe(0);
        expect(game.p2.tournament).toBe(1);
      });
    });

    describe('close(<validate>)', function() {
      when('<validate>', function() {
        this.scope.game = {
          p1: { name: 'toto', tournament: 1, control: 3, army: 45 },
          p2: { name: 'titi', tournament: 0, control: 1, army: 25 }
        };
        this.scope.close(true);
      }, function() {
        it('should update game', function() {
          expect(this.scope.edit.game).toEqual({
            table: 4,
            p1: { name: 'toto', tournament: 1, control: 3, army: 45 },
            p2: { name: 'titi', tournament: 0, control: 1, army: 25 },
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

        expect(this.scope.goToState).toHaveBeenCalledWith('rounds.titi',
                                                          { pane: 'toto' });
      });
    });
  });

});
