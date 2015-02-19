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

      return {
        init: function() {
          $http.get('/data/factions.json').then(function(response) {
            base_factions = response.data;
            _.each(base_factions_defers, function(d) {
              d.resolve(base_factions);
            });
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
              return _.exists(base[f]) ? base[f].icon : undefined;
            })
            .apply(function(f) {
              return _.exists(f) ? 'data/icons/'+f : '';
            })
            .value();              
        },
        hueFor: function(f) {
          return _.chain(f)
            .apply(function(f) {
              var base = base_factions || {};
              return _.exists(base[f]) ? base[f].hue : undefined;
            })
            .value();              
        },
        castersFor: function(f) {
          return _.chain(f)
            .apply(function(f) {
              var base = base_factions || {};
              return _.exists(base[f]) ? base[f].casters : undefined;
            })
            .value();              
        },
        casterNameFor: function(f, c) {
          return _.chain(f)
            .apply(function(f) {
              var base = base_factions || {};
              return _.exists(base[f]) ? base[f].casters : undefined;
            })
            .apply(_.getPath, c+'.name')
            .value();
        }
      };
    }
  ]);
