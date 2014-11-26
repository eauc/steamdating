'use strict';

angular.module('srApp.filters')
  .filter('playerSort', [
    'players',
    function(players) {
      return function(input) {
        return players.sort(input);
      };
    }
  ]);
