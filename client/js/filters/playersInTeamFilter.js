'use strict';

angular.module('srApp.filters')
  .filter('playersInTeam', [
    'players',
    function(players) {
      return function(input, team) {
        return players.inTeam(input, team);
      };
    }
  ]);
