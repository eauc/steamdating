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

        this.roundService = spyOnService('round');

        $controller('roundsCtrl', { 
          '$scope': this.scope,
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
        this.scope.doGameEdit(this.dummy_round, this.dummy_player);
      });

      it('should setup edit object', function() {
        expect(this.roundService.gameForPlayer)
          .toHaveBeenCalledWith(this.dummy_round, this.dummy_player);
        expect(this.scope.edit.game)
          .toBe('round.gameForPlayer.returnValue');
        expect(this.scope.edit.rounds_pane).toBe(this.scope.pane);
      });

      it('should go to game dit page', function() {
        expect(this.scope.goToState)
          .toHaveBeenCalledWith('game_edit');
      });
    });
  });

});
