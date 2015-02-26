'use strict';

angular.module('srAppStats.services')
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
        get: function(states_list, selector, sel_value, group_by, cache) {
          cache[selector] = cache[selector] || {};
          cache[selector][sel_value] = cache[selector][sel_value] || {};
          
          if(!_.exists(cache[selector][sel_value][group_by])) {
            cache[selector][sel_value][group_by] = _.chain(states_list)
              .map(function(state_info) {
                var selection = SELECTORS[selector].select(state_info.state, sel_value);
                selection = GROUPS[group_by].group(state_info.state, selection);
                console.log('selection', selection);
                
                return _.map(selection, function(sel_group) {
                  return [ sel_group[0], {
                    points: statsPointsEntry.count(state_info.state, sel_group[1]),
                    casters: statsCastersEntry.count(state_info.state, sel_group[1]),
                    opp_casters: statsOppCastersEntry.count(state_info.state, sel_group[1]),
                    tiers: statsTiersEntry.count(state_info.state, sel_group[1]),
                    references: statsReferencesEntry.count(state_info.state, sel_group[1]),
                  } ];
                });
              })
              .reduce(function(mem, state_stats) {
                return _.addHeaderLists(mem, state_stats, addStats);
              }, [])
              .value();
            console.log('cache', cache);
          }
          return cache[selector][sel_value][group_by];
        }
      };
      function statGroup(entry) { return entry[0]; }
      function statValues(entry) { return entry[1]; }

      function addStats(base, other) {
        return {
          points: statsPointsEntry.sum(base.points,
                                       other.points),
          casters: statsCastersEntry.sum(base.casters,
                                         other.casters),
          opp_casters: statsOppCastersEntry.sum(base.opp_casters,
                                                other.opp_casters),
          tiers: statsTiersEntry.sum(base.tiers,
                                     other.tiers),
          references: statsReferencesEntry.sum(base.references,
                                               other.references)
        };
      }
      
      return stats;
    }
  ]);
