'use strict';

angular.module('srApp.filters')
  .filter('factions', [
    'factions',
    function(factions) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return factions[method].apply(null, R.append(input, args));
      };
    }
  ]);
