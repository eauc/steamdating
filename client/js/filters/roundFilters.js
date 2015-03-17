'use strict';

angular.module('srApp.filters')
  .filter('game', [
    'game',
    function(game) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return game[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('rounds', [
    'rounds',
    function(rounds) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return rounds[method].apply(null, R.append(input, args));
      };
    }
  ])
  .filter('round', [
    'round',
    function(round) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return round[method].apply(null, R.append(input, args));
      };
    }
  ]);
