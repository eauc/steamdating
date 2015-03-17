'use strict';

angular.module('srApp.filters')
  .filter('teams', [
    'teams',
    function(teams) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return teams[method].apply(null, R.append(input, args));
      };
    }
  ]);
