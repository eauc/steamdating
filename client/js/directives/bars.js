'use strict';

angular.module('srApp.directives')
  .controller('barsCtrl', [
    '$scope',
    function($scope) {
      $scope.$watch('values', function(values) {
        if(!_.exists(values)) {
          $scope.bars = [];
          return;
        }
        var max = Math.max.apply(null, _.values(values));
        // console.log('max', max);
        var s_step = (65-35) / Math.max(1, _.keys(values).length-1);
        // console.log('s_step', s_step);
        $scope.bars = _.chain(values)
          .map(function(v,k) {
            return {
              k: k,
              name: s.capitalize(k),
              width: $scope.width * v / max,
              value: v,
            };
          })
          .apply(function(bs) {
            return bs.sort(function(a,b) {
              if(a.value < b.value) return 1;
              if(b.value < a.value) return -1;
              return a.name.localeCompare(b.name);
              // if(b.name < a.name) return 1;
              // if(a.name < b.name) return -1;
              // return 0;
            });
          })
          .map(function(v,i) {
            // console.log($scope.hues, v);
            if(_.exists(_.getPath($scope.hues, v.k))) {
              v.color = ('hsl('+_.getPath($scope.hues, v.k)[0]+
                         ', '+_.getPath($scope.hues, v.k)[1]+
                         '%, 52%)');
            }
            else {
              v.color = ('hsl('+$scope.hue+
                         ', '+$scope.saturation+
                         '%, '+(35+i*s_step)+'%)');
            }
            return v;
          })
          .value();
        // console.log('bars', $scope);
      });
    }
  ])
  .directive('bars', [
    function() {
      return {
        restrict: 'E',
        templateUrl: 'partials/directives/bars.html',
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
            scope.hue = _.exists(hue) ? hue : '200';
          });
          scope.saturation = '75';
          attrs.$observe('barsSaturation', function(sat) {
            scope.saturation = _.exists(sat) ? sat : '75';
          });
          // console.log('bars', element);
        }
      };
    }
  ]);
