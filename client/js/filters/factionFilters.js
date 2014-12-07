'use strict';

angular.module('srApp.filters')
  .filter('factions', [
    'factions',
    function(factions) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return factions[method].apply(null, _.cons(input, args));
      };
    }
  ]);
