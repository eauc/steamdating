'use strict';

angular.module('srApp.filters')
  .filter('player', [
    'player',
    function(player) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return player[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('players', [
    'players',
    function(players) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return players[method].apply(null, R.append(input, args));
      };
    }
  ]);
