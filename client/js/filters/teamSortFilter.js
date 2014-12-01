'use strict';

angular.module('srApp.filters')
  .filter('teamSort', [
    'teams',
    function(teams) {
      return function(input, criterium, players, rounds) {
        return teams.sort(input, criterium, players, rounds.length);
      };
    }
  ]);
