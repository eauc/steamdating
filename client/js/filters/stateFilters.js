'use strict';

angular.module('srApp.filters')
  .filter('state', [
    'state',
    function(state) {
      return function(input, method) {
        var args = R.tail(R.tail(arguments));
        return state[method].apply(null, R.append(input, args));
      };
    }
  ]);
