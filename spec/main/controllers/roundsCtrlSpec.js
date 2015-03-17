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
        this.scope = $rootScope.$new();
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.edit = {};

        this.state = { current: { name: 'current_state' } };

        this.roundService = spyOnService('round');

        $controller('roundsCtrl', { 
          '$scope': this.scope,
          '$state': this.state,
        });
      }
    ]));
    
    it('should setup round object', function() {
      expect(this.scope.round).toEqual({});
    });

    describe('doGameEdit(<game>)', function() {
      beforeEach(function() {
        this.dummy_round = [ 'titi' ];
        this.dummy_player = 'toto';
        this.scope.doGameEdit(this.dummy_round, this.dummy_player, 'current_pane');
      });

      it('should setup edit object', function() {
        expect(this.roundService.gameForPlayer)
          .toHaveBeenCalledWith(this.dummy_player, this.dummy_round);
        expect(this.scope.edit).toEqual({
          game: 'round.gameForPlayer.returnValue',
          back: 'current_state',
          pane: 'current_pane'
        });
      });

      it('should go to game dit page', function() {
        expect(this.scope.goToState)
          .toHaveBeenCalledWith('game_edit');
      });
    });
  });

});
