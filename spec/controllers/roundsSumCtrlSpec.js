'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsSumCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.scope.state = {
          players: this.state_players,
          rounds: this.state_rounds
        };

        this.playersService = spyOnService('players');

        $controller('roundsSumCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should refresh players\' played lists', function() {
      expect(this.playersService.updateListsPlayed)
        .toHaveBeenCalledWith(this.state_players, this.state_rounds);
      expect(this.scope.state.players)
        .toBe('players.updateListsPlayed.returnValue');
    });
  });

});
