'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.directives');
  });

  describe('pieChartCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.scope = $rootScope.$new();
        spyOn(this.scope, '$watch');
        this.scope.width = 200;
        this.scope.height = 200;

        $controller('pieChartCtrl', { 
          '$scope': this.scope,
        });
        $rootScope.$digest();

        var watcher = findCallByArgs(this.scope.$watch, function(args) {
          return args[0] === 'values';
        }).args[1];
        watcher({
          legends: [ 'l1', 'l2', 'l3', 'l4', ],
          values: [ 32, 42, 69, 71, ],
          colors: [ 'c1', 'c2', 'c3', 'c4', ],
        });
      }
    ]));

    it('should build pieChart', function() {
      expect(this.scope.paths).toEqual([
        { large : 0,
          start : { x : 100, y : 5 },
          end : { x : 176.6923345762828, y : 43.934985800059806 },
          color : 'c1' },
        { large : 0,
          start : { x : 176.6923345762828, y : 43.934985800059806 },
          end : { x : 178.3051510489393, y : 153.7894350147201 },
          color : 'c2' },
        { large : 0,
          start : { x : 178.3051510489393, y : 153.7894350147201 },
          end : { x : 17.266656773234004, y : 146.69254671274777 },
          color : 'c3' },
        { large : 0,
          start : { x : 17.266656773234004, y : 146.69254671274777 },
          end : { x : 99.99999999999997, y : 5 }, color : 'c4' }
      ]);
    });
  });

});
