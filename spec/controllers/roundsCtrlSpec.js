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

        this.round = jasmine.createSpyObj('round', [ 'gameForPlayer' ]);

        $controller('roundsCtrl', { 
          '$scope': this.scope,
          'round': this.round,
        });
      }
    ]));
    
    it('should setup round object', function() {
      expect(this.scope.round).toEqual({});
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
