'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module({
      $window: {
        localStorage: jasmine.createSpyObj('localStorage', [
          'getItem',
          'setItem'
        ])
      }
    });
    module('srApp.services');
    module('srAppStats.services');
    module('srAppStats.controllers');
  });

  describe('statsMainCtrl', function(c) {

    var initCtrl;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      '$window',
      function($rootScope,
               $controller,
               $window) {
        this.scope = $rootScope.$new();
        this.router_state = { 
          current: { name: 'current_state' },
          go: jasmine.createSpy('stateGo'),
          is: jasmine.createSpy('stateIs')
        };

        this.factionsService = spyOnService('factions');
        this.windowService = $window;

        var ctxt = this;
        initCtrl = function() {
          $controller('mainCtrl', { 
            '$scope': ctxt.scope,
            '$state': ctxt.router_state,
          });
          $rootScope.$digest();
        };
        initCtrl();
      }
    ]));

    it('should init factions', function() {
      expect(this.factionsService.init).toHaveBeenCalled();
    });

    describe('on load', function() {
      it('should try to read storage', function() {
        expect(this.windowService.localStorage.getItem)
          .toHaveBeenCalledWith('srApp_stats');
      });
      
      when('storage is empty', function() {
        this.windowService.localStorage.getItem.and.returnValue('');
        initCtrl();
      }, function() {
        it('should set EmptyState', function() {
          expect(this.scope.state).toEqual([]);
        });
      });
      
      when('storage is invalid', function() {
        this.windowService.localStorage.getItem.and.returnValue('toto');
        initCtrl();
      }, function() {
        it('should set EmptyState', function() {
          expect(this.scope.state).toEqual([]);
        });
      });
      
      when('storage is valid', function() {
        this.windowService.localStorage.getItem.and.returnValue('["stored_state"]');
        initCtrl();
      }, function() {
        it('should setup stored state', function() {
          expect(this.scope.state).toEqual(['stored_state']);
        });
      });
    });

    it('should bind Router $state', function() {
      expect(this.scope.currentState()).toBe('current_state');

      this.scope.goToState('argument');
      expect(this.router_state.go).toHaveBeenCalledWith('argument');

      this.scope.stateIs('state?');
      expect(this.router_state.is).toHaveBeenCalledWith('state?');
    });

    describe('setState(<state>)', function() {
      beforeEach(function() {
        this.windowService.localStorage.setItem.calls.reset();
      });

      it('should set state to <state>', function() {
        this.scope.setState(['state']);
        expect(this.scope.state).toEqual(['state']);
      });

      it('should store new state', function() {
        this.scope.setState(['state']);
        expect(this.windowService.localStorage.setItem)
          .toHaveBeenCalledWith('srApp_stats', '["state"]');
      });
    });

    describe('resetState()', function() {
      beforeEach(function() {
        spyOn(this.scope, 'setState');
      });

      it('should clean state', function() {
        this.scope.resetState();
        expect(this.scope.setState).toHaveBeenCalledWith([]);
      });
    });

    describe('pushState(<data>)', function() {
      beforeEach(function() {
        spyOn(this.scope, 'setState');
      });

      it('should push <data> into state', function() {
        this.scope.state = [ ['old'] ];
        this.scope.pushState(['data']);
        expect(this.scope.setState).toHaveBeenCalledWith([['old'],['data']]);
      });
    });

    describe('dropState(<index>)', function() {
      beforeEach(function() {
        spyOn(this.scope, 'setState');
      });

      it('should drop <index> from state', function() {
        this.scope.state = [ ['old1'],['old2'],['old3'] ];
        this.scope.dropState(1);
        expect(this.scope.setState).toHaveBeenCalledWith([['old1'],['old3']]);
      });
    });
  });

});
