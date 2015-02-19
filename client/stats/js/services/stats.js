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
        get: function(sts, sl, vl, gr, cache) {
          cache[sl] = cache[sl] || {};
          cache[sl][vl] = cache[sl][vl] || {};
          if(!_.exists(cache[sl][vl][gr])) {
            cache[sl][vl][gr] = _.chain(sts)
              .map(function(st) {
                var sel = SELECTORS[sl].select(st.state, vl);
                sel = GROUPS[gr].group(st.state, sel);
                console.log('sel', sel);
                return _.map(sel, function(s) {
                  return [ s[0], {
                    points: statsPointsEntry.count(st.state, s[1]),
                    casters: statsCastersEntry.count(st.state, s[1]),
                    opp_casters: statsOppCastersEntry.count(st.state, s[1]),
                    tiers: statsTiersEntry.count(st.state, s[1]),
                    references: statsReferencesEntry.count(st.state, s[1]),
                  } ];
                });
              })
              .reduce(function(mem, st) {
                console.log(st);
                _.each(st, function(new_el) {
                  var ele = _.find(mem, function(el) {
                    return el[0] === new_el[0];
                  });
                  if(!_.exists(ele)) {
                    mem.push(_.snapshot(new_el));
                    return;
                  }
                  
                  ele[1].points = statsPointsEntry.sum(ele[1].points,
                                                       new_el[1].points);
                  ele[1].casters = statsCastersEntry.sum(ele[1].casters,
                                                         new_el[1].casters);
                  ele[1].opp_casters = statsOppCastersEntry.sum(ele[1].opp_casters,
                                                                new_el[1].opp_casters);
                  ele[1].tiers = statsTiersEntry.sum(ele[1].tiers,
                                                     new_el[1].tiers);
                  ele[1].references = statsReferencesEntry.sum(ele[1].references,
                                                               new_el[1].references);
                });
                
                return mem;
              }, [])
              .value();
            console.log('cache', cache);
          }
          return cache[sl][vl][gr];
        }
      };
      return stats;
    }
  ]);
