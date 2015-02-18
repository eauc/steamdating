'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.directives');
  });

  describe('stacksCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        spyOn(this.scope, '$watch');
        this.scope.width = 200;
        this.scope.height = 200;

        $controller('stacksCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();

        var watcher = findCallByArgs(this.scope.$watch, function(args) {
          return args[0] === 'values';
        }).args[1];
        watcher({
          colors: ['color1','color2'],
          values: {
            value1: [1,2],
            value2: [3,4],
            value3: [5,6],
          }
        });
      }
    ]));

    it('should build stacks', function() {
      expect(this.scope.stacks).toEqual([
        { name : 'value1',
          layers : [ { x : 0, width : 66.66666666666667, color : 'color1', value : 1 },
                     { x : 66.66666666666667, width : 133.33333333333334, color : 'color2', value : 2 }
                   ] },
        { name : 'value2',
          layers : [ { x : 0, width : 85.71428571428571, color : 'color1', value : 3 },
                     { x : 85.71428571428571, width : 114.28571428571429, color : 'color2', value : 4 }
                   ] },
        { name : 'value3',
          layers : [ { x : 0, width : 90.9090909090909, color : 'color1', value : 5 },
                     { x : 90.9090909090909, width : 109.0909090909091, color : 'color2', value : 6 }
                   ] }
      ]);
    });
  });

});
