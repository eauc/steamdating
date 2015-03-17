'use strict';

angular.module('srApp.directives')
  .controller('stacksCtrl', [
    '$scope',
    function($scope) {
      $scope.$watch('values', function(values) {
        if(R.isNil(values)) {
          $scope.stacks = [];
          return;
        }

        var totals = R.reduce(function(mem, k) {
          mem[k] = R.reduce(R.add, 0, values.values[k]);
          return mem;
        }, {}, R.keys(values.values));

        $scope.stacks = R.map(function(name) {
          var x = 0;
          return {
            name: name,
            layers: R.mapIndexed(function(v, i) {
              var width = (0 < totals[name]) ?
                $scope.width * v / totals[name] :
                $scope.width / values.values[name].length;
              var layer = {
                x: x,
                width: width,
                color: values.colors[i],
                value: s.numberFormat(v,2)
              };
              x += width;
              return layer;
            }, values.values[name])
          };
        }, R.keys(values.values));
      });
    }
  ])
  .directive('stacks', [
    function() {
      return {
        restrict: 'E',
        templateUrl: '/partials/directives/stacks.html',
        scope: {
          values: '=stacksValues',
        },
        controller: 'stacksCtrl',
        link: function(scope, element, attrs) {
          scope.width = (element[0].querySelector('table').offsetWidth >> 0) * 0.7;
          scope.height = 50;
        }
      };
    }
  ]);
