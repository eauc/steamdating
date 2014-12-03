'use strict';

angular.module('srApp.filters')
  .filter('roundListsFor', [
    'rounds',
    function(rounds) {
      return function(input, p) {
        return rounds.listsFor(input, p);
      };
    }
  ]);
