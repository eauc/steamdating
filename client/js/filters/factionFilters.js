'use strict';

angular.module('srApp.filters')
  .filter('factionCasters', [
    'factions',
    function(factions) {
      return function(input) {
        // console.log(input);
        return factions.castersFor(input);
      };
    }
  ])
  .filter('factionIcon', [
    'factions',
    function(factions) {
      return function(input) {
        return factions.iconFor(input);
      };
    }
  ]);
