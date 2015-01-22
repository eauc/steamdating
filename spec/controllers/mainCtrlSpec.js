'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('mainCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        this.router_state = { 
          current: { name: 'current_state' },
          go: jasmine.createSpy('stateGo')
        };

        this.dummy_state = {};
        this.state = jasmine.createSpyObj('state', [
          'init',
          'test',
          'create',
          'updatePlayersPoints',
          'store'
        ]);
        this.state.init.and.returnValue(this.dummy_state);
        this.state.test.and.returnValue(this.dummy_state);
        this.state.create.and.returnValue(this.dummy_state);

        this.factions = jasmine.createSpyObj('factions', ['init']);
        this.players = jasmine.createSpyObj('players', ['updatePoints']);

        $controller('mainCtrl', { 
          '$scope': this.scope,
          '$state': this.router_state,
          'factions': this.factions,
          'state': this.state,
          'players': this.players
        });
      }
    ]));

    it('should init factions', function() {
      expect(this.factions.init).toHaveBeenCalled();
    });

    it('should init state', function() {
      expect(this.state.init).toHaveBeenCalled();
      expect(this.scope.state).toBe(this.dummy_state);
    });

    it('should bind Router $state', function() {
      expect(this.scope.currentState()).toBe('current_state');
      this.scope.goToState('argument');
      expect(this.router_state.go).toHaveBeenCalledWith('argument');
    });

    describe('resetState(<data>)', function() {
      it('should create a new state from <data>', function() {
        this.scope.state = undefined;
        var data = [ 'data' ];
        this.scope.resetState(data);
        expect(this.scope.state).toBe(this.dummy_state);
        expect(this.state.create).toHaveBeenCalledWith(data);
      });
    });

    describe('doEditPlayer(<p>)', function() {
      it('should enter "player_edit" state', function() {
        this.scope.doEditPlayer({ name: 'player' });

        expect(this.scope.edit).toEqual({ player: { name: 'player' } });
        expect(this.router_state.go).toHaveBeenCalledWith('player_edit');
      });
    });

    describe('updatePoints()', function() {
      beforeEach(function() {
        this.state_players = [ 'players' ];
        this.state_rounds = [ 'rounds' ];
        this.scope.state.players = this.state_players;
        this.scope.state.rounds = this.state_rounds;

        this.dummy_players = [ 'new_players' ];
        this.state.updatePlayersPoints.and.returnValue(this.dummy_players);
      });

      it('should update all players points', function() {
        this.scope.updatePoints();

        expect(this.scope.state.players).toEqual(this.dummy_players);
        expect(this.state.updatePlayersPoints)
          .toHaveBeenCalledWith(this.scope.state);
      });
    });

    describe('storeState()', function() {
      it('should store state', function() {
        this.scope.storeState();

        expect(this.state.store).toHaveBeenCalledWith(this.scope.state);
      });
    });
  });

});
