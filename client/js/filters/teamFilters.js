'use strict';

angular.module('srApp.filters')
  .filter('teamSort', [
    'teams',
    function(teams) {
      return function(input, bracket, criterium, players, rounds) {
        return teams.sort(input, bracket, criterium, players, rounds.length);
      };
    }
  ]);
