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
          go: jasmine.createSpy('stateGo'),
          is: jasmine.createSpy('stateIs')
        };

        this.stateService = spyOnService('state');
        this.factionsService = spyOnService('factions');
        this.resultSheetsHtmlService = spyOnService('resultSheetsHtml');

        $controller('mainCtrl', { 
          '$scope': this.scope,
          '$state': this.router_state,
        });
      }
    ]));

    it('should init factions', function() {
      expect(this.factionsService.init).toHaveBeenCalled();
    });

    it('should init resultSheetsHtml', function() {
      expect(this.resultSheetsHtmlService.init).toHaveBeenCalled();
    });

    it('should init state', function() {
      expect(this.stateService.init).toHaveBeenCalled();
      expect(this.scope.state).toBe('state.init.returnValue');
    });

    it('should bind Router $state', function() {
      expect(this.scope.currentState()).toBe('current_state');

      this.scope.goToState('argument');
      expect(this.router_state.go).toHaveBeenCalledWith('argument');

      this.scope.stateIs('state?');
      expect(this.router_state.is).toHaveBeenCalledWith('state?');
    });

    describe('resetState(<data>)', function() {
      it('should create a new state from <data>', function() {
        this.scope.state = undefined;
        var data = [ 'data' ];
        this.scope.resetState(data);
        expect(this.scope.state).toBe('state.create.returnValue');
        expect(this.stateService.create).toHaveBeenCalledWith(data);
      });
    });

    describe('doEditPlayer(<p>)', function() {
      it('should enter "player_edit" state', function() {
        this.scope.doEditPlayer({ name: 'player' });

        expect(this.scope.edit).toEqual({
          player: { name: 'player' },
          back: 'current_state'
        });
        expect(this.router_state.go).toHaveBeenCalledWith('player_edit');
      });
    });

    describe('updatePoints()', function() {
      beforeEach(function() {
        this.state_players = [ 'players' ];
        this.state_rounds = [ 'rounds' ];
        this.scope.state = {
          players: this.state_players,
          rounds: this.state_rounds
        };
      });

      it('should update all players points', function() {
        this.scope.updatePoints();

        expect(this.stateService.updatePlayersPoints)
          .toHaveBeenCalledWith({
          players: this.state_players,
          rounds: this.state_rounds
        });
      });

      it('should update bests players', function() {
        this.scope.updatePoints();

        expect(this.stateService.updateBestsPlayers)
          .toHaveBeenCalledWith('state.updatePlayersPoints.returnValue');
        expect(this.scope.state)
          .toBe('state.updateBestsPlayers.returnValue');
      });
    });

    describe('storeState()', function() {
      it('should store state', function() {
        this.scope.storeState();

        expect(this.stateService.store)
          .toHaveBeenCalledWith(this.scope.state);
      });
    });
  });

});
