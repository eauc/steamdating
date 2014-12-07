'use strict';

angular.module('srApp.filters')
  .filter('teams', [
    'teams',
    function(teams) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return teams[method].apply(null, _.cons(input, args));
      };
    }
  ]);
