'use strict';

angular.module('srApp.directives')
  .controller('barsCtrl', [
    '$scope',
    function($scope) {
      $scope.$watch('values', function(values) {
        if(R.isNil(values)) {
          $scope.bars = [];
          return;
        }
        var max = R.max(R.values(values));
        // console.log('max', max);
        var s_step = (65-35) / Math.max(1, R.keys(values).length-1);
        // console.log('s_step', s_step);
        $scope.bars = R.pipe(
          R.keys,
          R.map(function(k) {
            return {
              k: k,
              name: s.capitalize(k),
              width: $scope.width * values[k] / max,
              value: values[k],
            };
          }),
          function(bs) {
            return R.sort(function(a,b) {
              if(a.value < b.value) return 1;
              if(b.value < a.value) return -1;
              return a.name.localeCompare(b.name);
            }, bs);
          },
          R.mapIndexed(function(v,i) {
            if(R.exists(R.prop(v.k, R.defaultTo({}, $scope.hues)))) {
              v.color = ('hsl('+R.prop(v.k, $scope.hues)[0]+
                         ', '+R.prop(v.k, $scope.hues)[1]+
                         '%, 52%)');
            }
            else {
              v.color = ('hsl('+$scope.hue+
                         ', '+$scope.saturation+
                         '%, '+(35+i*s_step)+'%)');
            }
            return v;
          })
        )(values);
        // console.log('bars', $scope);
      });
    }
  ])
  .directive('bars', [
    function() {
      return {
        restrict: 'E',
        templateUrl: '/partials/directives/bars.html',
        scope: {
          values: '=barsValues',
          hues: '=barsHues',
        },
        controller: 'barsCtrl',
        link: function(scope, element, attrs) {
          scope.width = (element[0].querySelector('table').offsetWidth >> 0) * 0.7;
          scope.height = 50;
          scope.hue = '200';
          attrs.$observe('barsHue', function(hue) {
            scope.hue = R.exists(hue) ? hue : '200';
          });
          scope.saturation = '75';
          attrs.$observe('barsSaturation', function(sat) {
            scope.saturation = R.exists(sat) ? sat : '75';
          });
          // console.log('bars', element);
        }
      };
    }
  ]);
