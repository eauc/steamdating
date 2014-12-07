'use strict';

angular.module('srApp.filters')
  .filter('playersInTeam', [
    'players',
    function(players) {
      return function(input, team) {
        return players.inTeam(input, team);
      };
    }
  ])
  .filter('playerSort', [
    'players',
    function(players) {
      return function(input, bracket, criterium, rounds) {
        return players.sort(input, bracket, criterium, rounds.length);
      };
    }
  ]);
