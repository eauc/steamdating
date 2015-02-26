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
        get: function(state, selector, sel_value, group_by, cache) {
          cache[selector] = cache[selector] || {};
          cache[selector][sel_value] = cache[selector][sel_value] || {};
          
          if(!_.exists(cache[selector][sel_value][group_by])) {
            var selection = SELECTORS[selector].select(state, sel_value);
            selection = GROUPS[group_by].group(state, selection);
            console.log('selection', selection);

            cache[selector][sel_value][group_by] = _.map(selection, function(sel_group) {
              return [ sel_group[0], {
                points: statsPointsEntry.count(state, sel_group[1]),
                casters: statsCastersEntry.count(state, sel_group[1]),
                opp_casters: statsOppCastersEntry.count(state, sel_group[1]),
                tiers: statsTiersEntry.count(state, sel_group[1]),
                references: statsReferencesEntry.count(state, sel_group[1]),
              } ];
            });
            console.log('cache', cache);
          }
          return cache[selector][sel_value][group_by];
        }
      };
      return stats;
    }
  ]);
