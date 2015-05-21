'use strict';

angular.module('srAppStats.services')
  .factory('stats', [
    'players',
    'statsFactionSelector',
    'statsPlayerSelector',
    'statsCasterSelector',
    'statsGroupByTotal',
    'statsGroupByOppFaction',
    'statsGroupByOppCaster',
    'statsPlayersPerFactionEntry',
    'statsPointsEntry',
    'statsCastersEntry',
    'statsOppCastersEntry',
    'statsTiersEntry',
    'statsReferencesEntry',
    function(playersService,
             statsFactionSelectorService,
             statsPlayerSelectorService,
             statsCasterSelectorService,
             statsGroupByTotalService,
             statsGroupByOppFactionService,
             statsGroupByOppCasterService,
             statsPlayersPerFactionEntryService,
             statsPointsEntryService,
             statsCastersEntryService,
             statsOppCastersEntryService,
             statsTiersEntryService,
             statsReferencesEntryService) {
      var SELECTORS = {
        'faction': statsFactionSelectorService,
        'player': statsPlayerSelectorService,
        'caster': statsCasterSelectorService,
      };
      var GROUPS = {
        'total': statsGroupByTotalService,
        'opp_faction': statsGroupByOppFactionService,
        'opp_caster': statsGroupByOppCasterService,
      };
      var stats = {
        getGeneral: function(states_list) {
          return {
            factions: R.pipe(
              R.map(R.path(['state', 'players'])),
              R.map(playersService.countByFaction),
              R.reduce(statsPlayersPerFactionEntryService.sum, {}),
              statsPlayersPerFactionEntryService.count
            )(states_list)
          };
        },
        get: function(states_list, selector, sel_value, group_by, cache) {
          cache[selector] = R.defaultTo({}, cache[selector]);
          cache[selector][sel_value] = R.defaultTo({}, cache[selector][sel_value]);
          
          if(R.isNil(cache[selector][sel_value][group_by])) {
            cache[selector][sel_value][group_by] = R.pipe(
              R.map(function(state_info) {
                var selection = SELECTORS[selector].select(state_info.state, sel_value);
                selection = GROUPS[group_by].group(state_info.state, selection);
                
                return R.map(function(sel_group) {
                  return [ sel_group[0], {
                    points: statsPointsEntryService.count(state_info.state, sel_group[1]),
                    casters: statsCastersEntryService.count(state_info.state, sel_group[1]),
                    opp_casters: statsOppCastersEntryService.count(state_info.state, sel_group[1]),
                    tiers: statsTiersEntryService.count(state_info.state, sel_group[1]),
                    references: statsReferencesEntryService.count(state_info.state, sel_group[1]),
                  } ];
                }, selection);
              }),
              R.reduce(function(mem, state_stats) {
                return R.addHeaderLists(addStats, mem, state_stats);
              }, [])
            )(states_list);
          }
          return cache[selector][sel_value][group_by];
        }
      };
      var statGroup = R.head;
      var statValues = R.nth(1);

      function addStats(base, other) {
        return {
          points: statsPointsEntryService.sum(base.points,
                                              other.points),
          casters: statsCastersEntryService.sum(base.casters,
                                                other.casters),
          opp_casters: statsOppCastersEntryService.sum(base.opp_casters,
                                                       other.opp_casters),
          tiers: statsTiersEntryService.sum(base.tiers,
                                            other.tiers),
          references: statsReferencesEntryService.sum(base.references,
                                                      other.references)
        };
      }
      
      return stats;
    }
  ]);
