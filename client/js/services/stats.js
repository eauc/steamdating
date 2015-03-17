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
    function(statsFactionSelectorService,
             statsPlayerSelectorService,
             statsCasterSelectorService,
             statsGroupByTotalService,
             statsGroupByOppFactionService,
             statsGroupByOppCasterService,
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
      var statsService = {
        get: function(state, selector, sel_value, group_by, cache) {
          cache[selector] = R.defaultTo({}, cache[selector]);
          cache[selector][sel_value] = R.defaultTo({}, cache[selector][sel_value]);
          
          if(R.isNil(cache[selector][sel_value][group_by])) {
            
            var selection = SELECTORS[selector].select(state, sel_value);
            selection = GROUPS[group_by].group(state, selection);

            cache[selector][sel_value][group_by] = R.map(function(sel_group) {
              return [ sel_group[0], {
                points: statsPointsEntryService.count(state, sel_group[1]),
                casters: statsCastersEntryService.count(state, sel_group[1]),
                opp_casters: statsOppCastersEntryService.count(state, sel_group[1]),
                tiers: statsTiersEntryService.count(state, sel_group[1]),
                references: statsReferencesEntryService.count(state, sel_group[1]),
              } ];
            }, selection);
            console.log('cache', cache);
          }
          return cache[selector][sel_value][group_by];
        }
      };
      R.curryService(statsService);
      return statsService;
    }
  ]);
