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

        this.players = jasmine.createSpyObj('players', [ 'updateListsPlayed' ]);
        this.dummy_players = ['tata'];
        this.players.updateListsPlayed.and.returnValue(this.dummy_players);

        $controller('roundsSumCtrl', { 
          '$scope': this.scope,
          'players': this.players,
        });
      }
    ]));

    it('should refresh players\' played lists', function() {
      expect(this.players.updateListsPlayed).toHaveBeenCalledWith(this.state_players,
                                                                  this.state_rounds);
      expect(this.scope.state.players).toBe(this.dummy_players);
    });
  });

});
