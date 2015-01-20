'use strict';

angular.module('srApp.directives')
  .directive('eaFile', function() {
    return {
      restrict: 'A',
      scope: {
        eaFile: '&',
      },
      controller: [
        '$scope',
        function($scope) {
        }
      ],
      link: function(scope, element, attrs) {
        element[0].onchange = function() {
          // console.log('ea-file', element, element[0].files[0]);
          scope.eaFile({ file: element[0].files[0] });
        };
      }
    };
  });
