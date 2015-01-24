'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('playersCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      '$window',
      function($rootScope,
               $controller,
               $window) {
        this.scope = $rootScope.$new();
        this.state_players = [ 'titi' ];
        this.scope.edit = { };
        this.scope.state = { players: this.state_players };
        this.scope.goToState = jasmine.createSpy('goToState');

        this.stateService = spyOnService('state');
        this.playerService = spyOnService('player');
        this.playersService = spyOnService('players');

        this.window = $window;
        spyOn($window, 'confirm');

        $controller('playersCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    it('should init sorted players list', function() {
      expect(this.scope.sorted_players)
        .toBe('state.sortPlayers.returnValue');
      expect(this.stateService.sortPlayers)
        .toHaveBeenCalledWith(this.scope.state);
    });

    describe('doAddPlayer', function () {
      it('should init edit parameters', function() {
        this.scope.doAddPlayer(5);

        expect(this.playerService.create)
          .toHaveBeenCalled();
        expect(this.scope.edit.player)
          .toBe('player.create.returnValue');
        expect(this.scope.edit.group).toBe(5);
      });

      it('should go to player edit state', function() {
        this.scope.doAddPlayer(5);

        expect(this.scope.goToState)
          .toHaveBeenCalledWith('player_edit');
      });
    });

    describe('doDropPlayer', function () {
      beforeEach(function() {
        this.event = jasmine.createSpyObj('event', ['stopPropagation']);
        this.player = { name: 'toto' };
      });

      it('should prevent player edition', function() {
        this.scope.doDropPlayer(this.player, this.event);

        expect(this.event.stopPropagation).toHaveBeenCalled();
      });

      it('should ask confirmation', function() {
        this.scope.doDropPlayer(this.player, this.event);

        expect(this.window.confirm).toHaveBeenCalled();
      });

      when('user confirms', function() {
        this.scope.sorted_players = undefined;
        this.stateService.sortPlayers.calls.reset();
        this.window.confirm.and.returnValue(true);

        this.scope.doDropPlayer(this.player, this.event);
      }, function() {
        it('should drop player from state', function() {
          expect(this.playersService.drop)
            .toHaveBeenCalledWith(this.state_players, this.player);
          expect(this.scope.state.players)
            .toBe('players.drop.returnValue');
        });

        it('should store new state', function() {
          expect(this.stateService.store)
            .toHaveBeenCalledWith(this.scope.state);
        });

        it('should refresh sorted players list', function() {
          expect(this.stateService.sortPlayers)
            .toHaveBeenCalledWith(this.scope.state);
          expect(this.scope.sorted_players)
            .toBe('state.sortPlayers.returnValue');
        });
      });
    });

  });

});
