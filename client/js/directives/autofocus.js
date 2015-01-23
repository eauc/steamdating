'use strict';

angular.module('srApp.directives')
  .directive('autofocus', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element[0].focus();
      }
    };
  });
