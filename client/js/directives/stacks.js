'use strict';

angular.module('srApp.directives')
  .controller('stacksCtrl', [
    '$scope',
    function($scope) {
      $scope.$watch('values', function(values) {
        if(!_.exists(values)) {
          $scope.stacks = [];
          return;
        }
        // console.log('values', values);
        var totals = _.reduce(values.values, function(mem, s, k) {
          mem[k] = _.reduce(s, function(m,v) { return m+v; }, 0);
          return mem;
        }, {});
        // console.log('totals', totals);
        $scope.stacks = _.map(values.values, function(s, name) {
          var x = 0;
          return {
            name: name,
            layers: _.map(s, function(v, i) {
              var width = (0 < totals[name]) ?
                $scope.width * v / totals[name] :
                $scope.width / s.length;
              var layer = {
                x: x,
                width: width,
                color: values.colors[i],
                value: v
              };
              x += width;
              return layer;
            })
          };
        });
        // console.log('stacks', $scope);
      });
    }
  ])
  .directive('stacks', [
    function() {
      return {
        restrict: 'E',
        templateUrl: 'partials/directives/stacks.html',
        scope: {
          values: '=stacksValues',
        },
        controller: 'stacksCtrl',
        link: function(scope, element, attrs) {
          scope.width = (element[0].querySelector('table').offsetWidth >> 0) * 0.7;
          scope.height = 50;
          // console.log('stacks', element);
        }
      };
    }
  ]);
