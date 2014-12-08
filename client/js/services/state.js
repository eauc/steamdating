'use strict';

angular.module('srApp.services')
  .factory('tourney', [
    function() {
      return {
        nPlayers: function(state) {
          return _.flatten(state.players).length;
        }
      };
    }
  ]);
