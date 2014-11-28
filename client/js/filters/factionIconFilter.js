'use strict';

angular.module('srApp.filters')
  .filter('factionIcon', [
    'factions',
    function(factions) {
      return function(input) {
        return factions.iconFor(input);
      };
    }
  ]);
