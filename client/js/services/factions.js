'use strict';

angular.module('srApp.services')
  .factory('factions', [
    '$window',
    '$http',
    '$q',
    function($window,
             $http,
             $q) {

      var base_factions;
      var base_factions_defers = [];
      function resolveAllDefers() {
        _.each(base_factions_defers, function(defer) {
          defer.resolve(base_factions);
        });
        base_factions_defers = [];
      }
      return {
        init: function() {
          $http.get('/data/factions.json').then(function(response) {
            base_factions = response.data;
            resolveAllDefers();
          }, function(response) {
            console.log('error get factions', response);
          });
        },
        baseFactions: function() {
          if(_.exists(base_factions)) return base_factions;

          var defer = $q.defer();
          base_factions_defers.push(defer);
          return defer.promise;
        },
        iconFor: function(faction_name) {
          return _.chain([base_factions])
            .mapWith(_.getPath, faction_name+'.icon')
            .without(undefined, null)
            .mapWith(function(icon) { return 'data/icons/'+icon; })
            .first()
            .value();
        },
        hueFor: function(faction_name) {
          return _.getPath(base_factions, faction_name+'.hue');
        },
        castersFor: function(faction_name) {
          return _.getPath(base_factions, faction_name+'.casters');
        },
        casterNameFor: function(faction_name, caster_name) {
          return _.getPath(base_factions, faction_name+'.casters.'+caster_name+'.name');
        }
      };
    }
  ]);
