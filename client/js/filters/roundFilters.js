'use strict';

angular.module('srApp.filters')
  .filter('game', [
    'game',
    function(game) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return game[method].apply(null, _.cons(input, args));
      };
    }
  ])
  .filter('rounds', [
    'rounds',
    function(rounds) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return rounds[method].apply(null, _.cons(input, args));
      };
    }
  ])
  .filter('round', [
    'round',
    function(round) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return round[method].apply(null, _.cons(input, args));
      };
    }
  ]);
