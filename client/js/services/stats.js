'use strict';

angular.module('srApp.services')
  .factory('stats', [
    'statsFactionSelector',
    'statsPlayerSelector',
    'statsCasterSelector',
    'statsGroupByTotal',
    'statsGroupByOppFaction',
    'statsGroupByOppCaster',
    'statsPointsEntry',
    'statsCastersEntry',
    'statsOppCastersEntry',
    'statsTiersEntry',
    'statsReferencesEntry',
    function(statsFactionSelector,
             statsPlayerSelector,
             statsCasterSelector,
             statsGroupByTotal,
             statsGroupByOppFaction,
             statsGroupByOppCaster,
             statsPointsEntry,
             statsCastersEntry,
             statsOppCastersEntry,
             statsTiersEntry,
             statsReferencesEntry) {
      var SELECTORS = {
        'faction': statsFactionSelector,
        'player': statsPlayerSelector,
        'caster': statsCasterSelector,
      };
      var GROUPS = {
        'total': statsGroupByTotal,
        'opp_faction': statsGroupByOppFaction,
        'opp_caster': statsGroupByOppCaster,
      };
      var stats = {
        get: function(st, sl, vl, gr, cache) {
          cache[sl] = cache[sl] || {};
          cache[sl][vl] = cache[sl][vl] || {};
          if(!_.exists(cache[sl][vl][gr])) {
            var sel = SELECTORS[sl].select(st, vl);
            sel = GROUPS[gr].group(st, sel);
            console.log('sel', sel);
            cache[sl][vl][gr] = _.map(sel, function(s) {
              return [ s[0], {
                points: statsPointsEntry.count(st, s[1]),
                casters: statsCastersEntry.count(st, s[1]),
                opp_casters: statsOppCastersEntry.count(st, s[1]),
                tiers: statsTiersEntry.count(st, s[1]),
                references: statsReferencesEntry.count(st, s[1]),
              } ];
            });
            console.log('cache', cache);
          }
          return cache[sl][vl][gr];
        }
      };
      return stats;
    }
  ]);
