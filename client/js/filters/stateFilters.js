'use strict';

angular.module('srApp.filters')
  .filter('state', [
    'state',
    function(state) {
      return function(input, method) {
        var args = _.rest(_.rest(arguments));
        return state[method].apply(null, _.cons(input, args));
      };
    }
  ]);
