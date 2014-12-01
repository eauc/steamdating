'use strict';

angular.module('srApp.filters')
  .filter('teamSort', [
    'teams',
    function(teams) {
      return function(input) {
        return teams.sort(input);
      };
    }
  ]);
