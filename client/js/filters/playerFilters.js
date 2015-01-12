'use strict';

angular.module('srApp.filters')
  .filter('player', [
    'player',
    function(player) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return player[method].apply(null, _.cons(input, args));
      };
    }
  ])
  .filter('players', [
    'players',
    function(players) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return players[method].apply(null, _.cons(input, args));
      };
    }
  ]);
