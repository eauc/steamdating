'use strict';

angular.module('srApp.services')
  .factory('factions', [
    '$window',
    '$http',
    function($window,
             $http) {

      var base_factions;

      $http.get('data/factions.json').then(function(response) {
        base_factions = response.data;
      }, function(response) {
        console.log('error get factions', response);
      });

      return {
        listFrom: function(players) {
          return _.chain(players)
            .mapWith(_.getPath, 'faction')
            .cat(_.keys(base_factions))
            .uniq()
            .without(undefined)
            .sort()
            .value();
        },
        iconFor: function(f) {
          return _.chain(f)
            .apply(function(f) {
              return _.exists(base_factions, f) ? base_factions[f].icon : undefined;
            })
            .apply(function(f) {
              return _.exists(f) ? 'data/icons/'+f : '';
            })
            .value();              
        }
      };
    }
  ]);
