'use strict';

angular.module('srApp.directives')
  .directive('closeAllDropdown', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          element.on('click', function() {
            // console.log('close DD click');
            scope.$broadcast('close-dropdown');
          });
        }
      };
    }
  ])
  .directive('openDropdown', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var target_id = attrs.openDropdown;
          var target = angular.element(document.getElementById(target_id));
          if(!_.exists(target)) {
            console.log('openDropdown : cannot find target', target_id);
            return;
          }
          element.on('click', function(event) {
            // console.log('open DD click', event);
            target.toggleClass('open');
            event.stopPropagation();
          });
          scope.$on('close-dropdown', function() {
            // console.log('on close DD');
            target.removeClass('open');
          });
        }
      };
    }
  ]);
