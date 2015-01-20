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
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.state_players = [ 'titi' ];
        this.scope.edit = { };
        this.scope.state = { players: this.state_players };
        this.scope.goToState = jasmine.createSpy('goToState');

        this.state = jasmine.createSpyObj('state', ['store', 'sortPlayers']);
        this.dummy_sorted_players = [];
        this.state.sortPlayers.and.returnValue(this.dummy_sorted_players);
        this.players = jasmine.createSpyObj('players', ['drop', 'sort']);

        this.player = jasmine.createSpyObj('player', ['create']);
        this.window = jasmine.createSpyObj('$window', ['confirm']);

        this.dummy_players = [];
        this.players.drop.and.returnValue(this.dummy_players);

        this.dummy_player = {};
        this.player.create.and.returnValue(this.dummy_player);

        $controller('playersCtrl', { 
          '$scope': this.scope,
          '$window': this.window,
          'state': this.state,
          'players': this.players,
          'player': this.player
        });
      }
    ]));

    it('should init sorted players list', function() {
      expect(this.scope.sorted_players).toBe(this.dummy_sorted_players);
      expect(this.state.sortPlayers).toHaveBeenCalledWith(this.scope.state);
    });

    describe('doAddPlayer', function () {
      it('should init edit parameters', function() {
        this.scope.doAddPlayer(5);

        expect(this.player.create).toHaveBeenCalled();
        expect(this.scope.edit.player).toBe(this.dummy_player);
        expect(this.scope.edit.group).toBe(5);
      });

      it('should go to player edit state', function() {
        this.scope.doAddPlayer(5);

        expect(this.scope.goToState).toHaveBeenCalledWith('player_edit');
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
        this.state.sortPlayers.calls.reset();
        this.window.confirm.and.returnValue(true);

        this.scope.doDropPlayer(this.player, this.event);
      }, function() {
        it('should drop player from state', function() {
          expect(this.players.drop).toHaveBeenCalledWith(this.state_players, this.player);
          expect(this.scope.state.players).toBe(this.dummy_players);
        });

        it('should store new state', function() {
          expect(this.state.store).toHaveBeenCalledWith(this.scope.state);
        });

        it('should refresh sorted players list', function() {
          expect(this.state.sortPlayers).toHaveBeenCalledWith(this.scope.state);
          expect(this.scope.sorted_players).toBe(this.dummy_sorted_players);
        });
      });
    });

  });

});
