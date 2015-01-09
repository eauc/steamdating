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
        this.state = jasmine.createSpyObj('state', ['init', 'test']);
        this.router_state = { 
          current: { name: 'current_state' },
          go: jasmine.createSpy('stateGo')
        };

        this.dummy_state = {};
        this.state.init.and.returnValue(this.dummy_state);
        this.state.test.and.returnValue(this.dummy_state);

        this.factions = jasmine.createSpyObj('factions', ['init']);

        $controller('mainCtrl', { 
          '$scope': this.scope,
          '$state': this.router_state,
          'factions': this.factions,
          'state': this.state
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

    describe('doEditPlayer(<p>)', function() {
      it('should enter "player_edit" state', function() {
        this.scope.doEditPlayer({ name: 'player' });

        expect(this.scope.edit).toEqual({ player: { name: 'player' } });
        expect(this.router_state.go).toHaveBeenCalledWith('player_edit');
      });
    });

  });

});
