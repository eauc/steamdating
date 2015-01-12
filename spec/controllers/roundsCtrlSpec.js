'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        initCtrlWith = function(ctxt, pane, rounds) {
          ctxt.pane = pane || 'sum';
          ctxt.state_rounds = rounds || [];
          ctxt.state_players = ['toto'];

          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.edit = {};
          ctxt.scope.state = {
            players: ctxt.state_players,
            rounds: ctxt.state_rounds
          };
          ctxt.$stateParams = {
            pane: ctxt.pane
          };
          
          ctxt.players = jasmine.createSpyObj('players', [ 'updateListsPlayed' ]);
          ctxt.dummy_players = ['tata'];
          ctxt.players.updateListsPlayed.and.returnValue(ctxt.dummy_players);

          ctxt.round = jasmine.createSpyObj('round', [ 'gameForPlayer' ]);

          $controller('roundsCtrl', { 
            '$scope': ctxt.scope,
            '$stateParams': ctxt.$stateParams,
            'players': ctxt.players,
            'round': ctxt.round
          });
        };
        initCtrlWith(this);
      }
    ]));

    it('should init pane from stateParams', function() {
      initCtrlWith(this, 'sum');
      expect(this.scope.pane).toBe('sum');

      initCtrlWith(this, 'next');
      expect(this.scope.pane).toBe('next');
    });

    it('should refresh players\' played lists', function() {
      expect(this.players.updateListsPlayed).toHaveBeenCalledWith(this.state_players,
                                                                  this.state_rounds);
      expect(this.scope.state.players).toBe(this.dummy_players);
    });

    describe('doGameEdit(<game>)', function() {
      beforeEach(function() {
        this.dummy_game = {};
        this.round.gameForPlayer.and.returnValue(this.dummy_game);

        this.dummy_round = [ 'titi' ];
        this.dummy_player = 'toto';
        this.scope.doGameEdit(this.dummy_round, this.dummy_player);
      });

      it('should setup edit object', function() {
        expect(this.round.gameForPlayer).toHaveBeenCalledWith(this.dummy_round,
                                                              this.dummy_player);
        expect(this.scope.edit.game).toBe(this.dummy_game);
        expect(this.scope.edit.rounds_pane).toBe(this.scope.pane);
      });

      it('should go to game dit page', function() {
        expect(this.scope.goToState).toHaveBeenCalledWith('game_edit');
      });
    });
  });

});
