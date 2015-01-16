'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('roundsNthCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        initCtrlWith = function(ctxt, pane, rounds) {
          ctxt.pane = pane || 'sum';
          ctxt.state_rounds = rounds || [];

          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.updatePoints = jasmine.createSpy('updatePoints');
          ctxt.scope.storeState = jasmine.createSpy('storeState');
          ctxt.scope.state = {
            rounds: ctxt.state_rounds
          };
          ctxt.scope.round = {};
          ctxt.$stateParams = {
            pane: ctxt.pane
          };
          ctxt.window = jasmine.createSpyObj('$window', [ 'confirm' ]);

          ctxt.rounds = jasmine.createSpyObj('rounds', [ 'drop' ]);

          $controller('roundsNthCtrl', { 
            '$scope': ctxt.scope,
            '$stateParams': ctxt.$stateParams,
            '$window': ctxt.window,
            'rounds': ctxt.rounds,
          });
        };
        initCtrlWith(this);
      }
    ]));

    it('should init pane & r from stateParams', function() {
      initCtrlWith(this, '0', [ 'rounds0', 'rounds1' ]);
      expect(this.scope.round.current).toBe('0');
      expect(this.scope.r).toBe('rounds0');

      initCtrlWith(this, '1', [ 'rounds0', 'rounds1' ]);
      expect(this.scope.round.current).toBe('1');
      expect(this.scope.r).toBe('rounds1');
    });

    describe('doDeleteRound(<index>)', function() {
      it('should ask user confirmation', function() {
        this.scope.doDeleteRound(1);

        expect(this.window.confirm).toHaveBeenCalled();
      });

      when('user confirms', function() {
        this.scope.state.rounds = [ 'rounds' ];
        this.window.confirm.and.returnValue(true);
        this.dummy_rounds = [ 'dummy' ];
        this.rounds.drop.and.returnValue(this.dummy_rounds);

        this.scope.doDeleteRound(4);
      }, function() {
        it('should drop round <index>', function() {
          expect(this.rounds.drop).toHaveBeenCalledWith([ 'rounds' ], 4);
          expect(this.scope.state.rounds).toBe(this.dummy_rounds);
        });

        it('should update points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });

        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });

        it('should return to rounds summary page', function() {
          expect(this.scope.goToState).toHaveBeenCalledWith('rounds.sum');
        });
      });
    });
  });

});
