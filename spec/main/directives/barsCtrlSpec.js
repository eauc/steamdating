'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.directives');
  });

  describe('barsCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        spyOn(this.scope, '$watch');
        this.scope.width = 200;
        this.scope.height = 200;

        $controller('barsCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();

        var watcher = findCallByArgs(this.scope.$watch, function(args) {
          return args[0] === 'values';
        }).args[1];
        this.scope.hues = {
          value1: [1,10],
          value2: [2,20],
          value3: [3,30],
        };
        watcher({
          value1: 1,
          value2: 2,
          value3: 3,
        });
      }
    ]));

    it('should build bars', function() {
      expect(this.scope.bars).toEqual([
        { k : 'value3', name : 'Value3', width : 200, value : 3, color : 'hsl(3, 30%, 52%)' },
        { k : 'value2', name : 'Value2', width : 133.33333333333334, value : 2,
          color : 'hsl(2, 20%, 52%)' },
        { k : 'value1', name : 'Value1', width : 66.66666666666667, value : 1,
          color : 'hsl(1, 10%, 52%)' }
      ]);
    });
  });

});
