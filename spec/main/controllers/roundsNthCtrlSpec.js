'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('roundsNthCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        this.roundsService = spyOnService('rounds');
        this.fileExportService = spyOnService('fileExport');
        this.stateService = spyOnService('state');

        initCtrlWith = function(ctxt, pane, rounds) {
          ctxt.pane = pane || '0';
          ctxt.state_rounds = rounds || [ 'round0' ];

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
        expect(this.scope.round.current).toBe(parseFloat(e.pane));
        expect(this.scope.r).toBe(e.r);
      });
    });

    when('<pane> params is invalid', function() {
      initCtrlWith(this, 'toto', [ 'rounds0', 'rounds1' ]);
    }, function() {
      it('should redirect to summary pane', function() {
        expect(this.scope.goToState)
          .toHaveBeenCalledWith('rounds.sum');
      });
    });

    it('should init exports', function() {
      initCtrlWith(this, '1', [ 'rounds0', 'rounds1' ]);

      expect(this.scope.exports).toBeAn('Object');

      expect(this.stateService.roundTables)
        .toHaveBeenCalledWith(this.scope.state, 1);

      expect(this.scope.exports.csv)
        .toEqual({
          name: 'round_2.csv',
          url: 'fileExport.generate.returnValue',
          label: 'CSV Round'
        });
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('csv', 'state.roundTables.returnValue');

      expect(this.scope.exports.bb)
        .toEqual({
          name: 'round_2.txt',
          url: 'fileExport.generate.returnValue',
          label: 'BBCode Round'
        });
      expect(this.fileExportService.generate)
        .toHaveBeenCalledWith('bb', 'state.roundTables.returnValue');
    });
    
    describe('doDeleteRound(<index>)', function() {
      it('should ask user confirmation', function() {
        this.scope.doDeleteRound(1);

        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('confirm', jasmine.any(String));
      });

      when('user confirms', function() {
        this.scope.state.rounds = [ 'rounds' ];

        this.scope.doDeleteRound(4);
        this.promptService.prompt.resolve();
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
