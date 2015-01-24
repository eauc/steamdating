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
      '$window',
      function($rootScope,
               $controller,
               $window) {
        this.window = $window;
        spyOn($window, 'confirm');

        this.roundsService = spyOnService('rounds');

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

          $controller('roundsNthCtrl', { 
            '$scope': ctxt.scope,
            '$stateParams': ctxt.$stateParams,
            '$window': ctxt.window,
          });
        };
        initCtrlWith(this);
      }
    ]));

    using([
      [ 'pane' , 'r'       ],
      [ '0'    , 'rounds0' ],
      [ '1'    , 'rounds1' ],
    ], function(e, d) {
      it('should init pane & r from stateParams, '+d, function() {
        initCtrlWith(this, e.pane, [ 'rounds0', 'rounds1' ]);
        expect(this.scope.round.current).toBe(e.pane);
        expect(this.scope.r).toBe(e.r);
      });
    });

    describe('doDeleteRound(<index>)', function() {
      it('should ask user confirmation', function() {
        this.scope.doDeleteRound(1);

        expect(this.window.confirm).toHaveBeenCalled();
      });

      when('user confirms', function() {
        this.scope.state.rounds = [ 'rounds' ];
        this.window.confirm.and.returnValue(true);

        this.scope.doDeleteRound(4);
      }, function() {
        it('should drop round <index>', function() {
          expect(this.roundsService.drop)
            .toHaveBeenCalledWith([ 'rounds' ], 4);
          expect(this.scope.state.rounds)
            .toBe('rounds.drop.returnValue');
        });

        it('should update points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });

        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });

        it('should return to rounds summary page', function() {
          expect(this.scope.goToState)
            .toHaveBeenCalledWith('rounds.sum');
        });
      });
    });
  });

});
