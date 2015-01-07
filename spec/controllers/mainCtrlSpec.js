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
        this.state = jasmine.createSpyObj('state', ['init']);

        this.dummy_state = {};
        this.state.init.and.returnValue(this.dummy_state);

        $controller('mainCtrl', { 
          '$scope': this.scope,
          'state': this.state
        });
      }
    ]));

    it('should init state', function() {
      expect(this.state.init).toHaveBeenCalled();
      expect(this.scope.state).toBe(this.dummy_state);
    });

  });

});
