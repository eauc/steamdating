'use strict';

angular.module('srApp.filters')
  .filter('listCasters', [
    'lists',
    function(lists) {
      return function(input) {
        // console.log(input);
        return lists.casters(input);
      };
    }
  ]);
