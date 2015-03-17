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
        R.forEach(function(defer) {
          defer.resolve(base_factions);
        }, base_factions_defers);
        base_factions_defers = [];
      }
      
      var factionsService = {
        init: function() {
          $http.get('/data/factions.json').then(function(response) {
            base_factions = response.data;
            resolveAllDefers();
          }, function(response) {
            console.log('error get factions', response);
          });
        },
        baseFactions: function() {
          if(!R.isNil(base_factions)) return base_factions;

          var defer = $q.defer();
          base_factions_defers.push(defer);
          return defer.promise;
        },
        iconFor: function(faction_name) {
          return R.pipe(
            R.defaultTo({}),
            R.map(R.path([faction_name, 'icon'])),
            R.reject(R.isNil),
            R.map(function(icon) { return 'data/icons/'+icon; }),
            R.head
          )([base_factions]);
        },
        hueFor: function(faction_name) {
          return R.path([faction_name, 'hue'],
                        R.defaultTo({}, base_factions));
        },
        castersFor: function(faction_name) {
          return R.path([faction_name, 'casters'],
                        R.defaultTo({}, base_factions));
        },
        casterNameFor: function(faction_name, caster_name) {
          return R.path([faction_name,'casters',caster_name,'name'],
                        R.defaultTo({}, base_factions));
        }
      };
      R.curryService(factionsService);
      return factionsService;
    }
  ]);
