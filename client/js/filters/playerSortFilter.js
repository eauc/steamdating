'use strict';

angular.module('srApp.filters')
  .filter('playerSort', [
    'players',
    function(players) {
      return function(input, criterium, rounds) {
        return players.sort(input, criterium, rounds.length);
      };
    }
  ]);
