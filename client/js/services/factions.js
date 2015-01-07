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

      $http.get('data/factions.json').then(function(response) {
        base_factions = response.data;
        _.each(base_factions_defers, function(d) {
          d.resolve(base_factions);
        });
      }, function(response) {
        console.log('error get factions', response);
      });

      return {
        baseFactions: function() {
          if(_.exists(base_factions)) return base_factions;

          var defer = $q.defer();
          base_factions_defers.push(defer);
          return defer.promise;
        },
        // info: function(f) {
        //   return _.chain(base_factions)
        //     .getPath(f)
        //     .apply(function(fc) { return fc || { name:f, color:'#CCC' }; })
        //     .pick('name', 'color')
        //     .value();
        // },
        iconFor: function(f) {
          return _.chain(f)
            .apply(function(f) {
              var base = base_factions || {};
              return _.exists(base[f]) ? base_factions[f].icon : undefined;
            })
            .apply(function(f) {
              return _.exists(f) ? 'data/icons/'+f : '';
            })
            .value();              
        },
        // castersFor: function(f) {
        //   return _.chain(f)
        //     .apply(function(f) {
        //       var base = base_factions || {};
        //       return _.exists(base[f]) ? base[f].casters : undefined;
        //     })
        //     .value();              
        // }
      };
    }
  ]);
