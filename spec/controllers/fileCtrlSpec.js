'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('fileCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      '$window',
      'state',
      function($rootScope,
               $controller,
               $window,
               state) {
        this.scope = $rootScope.$new();
        this.scope.resetState = jasmine.createSpy('resetState');

        this.state = state;
        spyOn(state, 'isEmpty');

        this.window = $window;
        spyOn($window, 'confirm');

        $controller('fileCtrl', { 
          '$scope': this.scope,
        });
      }
    ]));

    describe('doReset', function() {
      when('state is not empty', function() {
        this.state.isEmpty.and.returnValue(false);
      }, function() {
        it('should ask user for confirmation', function() {
          this.scope.doReset();

          expect(this.window.confirm).toHaveBeenCalled();
        });

        when('user confirms', function() {
          this.window.confirm.and.returnValue(true);
        }, function() {
          it('should reset state', function() {
            this.scope.doReset();

            expect(this.scope.resetState).toHaveBeenCalled();
          });
        });
      });

      when('state is not empty', function() {
        this.state.isEmpty.and.returnValue(true);
      }, function() {
        it('should reset state', function() {
          this.scope.doReset();

          expect(this.scope.resetState).toHaveBeenCalled();
        });
      });
    });
  });

});
