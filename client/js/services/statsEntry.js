'use strict';

angular.module('srApp.services')
  .factory('statsPointsEntry', [
    'games',
    function(games) {
      var statsPointsEntry = {
        count: function(st, sel) {
          return {
            colors: [ '#4AE34D',
                      '#E3341D' ],
            values: _.chain(sel)
              .mapWith(function(gs) {
                return [
                  games.pointsForPlayer(gs[1], gs[0]),
                  games.pointsAgainstPlayer(gs[1], gs[0]),
                  gs[1].length
                ];
              })
            // .spy('against')
              .reduce(function(mem, pts) {
                return [{
                  tournament: mem[0].tournament + pts[0].tournament,
                  control: mem[0].control + pts[0].control,
                  army: mem[0].army + pts[0].army
                }, {
                  tournament: mem[1].tournament + pts[1].tournament,
                  control: mem[1].control + pts[1].control,
                  army: mem[1].army + pts[1].army
                }, pts[2] + mem[2] ];
              }, [{ tournament: 0, control: 0, army: 0 },
                  { tournament: 0, control: 0, army: 0 },
                  0
                 ])
            // .spy('redu')
              .apply(function(pts) {
                var total = (pts[2] === 0) ? 1 : pts[2];
                return {
                  'Win/Loss': [pts[0].tournament,
                               pts[1].tournament],
                  'Control': [pts[0].control/total,
                              pts[1].control/total],
                  'Army': [pts[0].army/total,
                           pts[1].army/total],
                };
              })
              .value()
          };
        },
        sum: function(base, other) {
          var ret = _.clone(base);
          ret.values = {
            'Win/Loss': [ base.values['Win/Loss'][0] + other.values['Win/Loss'][0],
                          base.values['Win/Loss'][1] + other.values['Win/Loss'][1] ],
            'Control': [ (base.values.Control[0] + other.values.Control[0])/2,
                         (base.values.Control[1] + other.values.Control[1])/2 ],
            'Army': [ (base.values.Army[0] + other.values.Army[0])/2,
                      (base.values.Army[1] + other.values.Army[1])/2 ],
          };
          return ret;
        }
      };
      return statsPointsEntry;
    }
  ])
  .factory('statsCastersEntry', [
    'factions',
    'game',
    'players',
    function(factions,
             game,
             players) {
      var statsCastersEntry = {
        count: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return _.map(gs[1], function(g) {
                return [gs[0], game.listForPlayer(g, gs[0])];
              });
            })
            .flatten(true)
            .filter(function(p) {
              return _.exists(p[0]) && _.exists(p[1]);
            })
            .groupBy(function(p) {
              return _.getPath(players.player(st.players, p[0]), 'faction');
            })
            .map(function(ps,f) {
              var values = _.map(ps, function(p) { return p[1]; });
              return [f,
                      _.countBy(values, _.identity),
                     factions.hueFor(f)];
            })
            .value();
        },
        sum: function(base, other) {
          return _.reduce(other, function(mem, f) {
            var mem_f = _.find(mem, function(mf) { return mf[0] === f[0]; });
            if(!_.exists(mem_f)) {
              mem.push(f);
              return mem;
            }
            _.reduce(f[1], function(m, count, c) {
              if(_.exists(m[c])) m[c] += count;
              else m[c] = count;
              return m;
            }, mem_f[1]);
            return mem;
          }, _.snapshot(base));
        }
      };
      return statsCastersEntry;
    }
  ])
  .factory('statsOppCastersEntry', [
    'factions',
    'game',
    'players',
    function(factions,
             game,
             players) {
      var statsCastersEntry = {
        count: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return _.map(gs[1], function(g) {
                var opp = game.opponentForPlayer(g, gs[0]);
                return [opp, game.listForPlayer(g, opp)];
              });
            })
            .flatten(true)
            .filter(function(p) {
              return _.exists(p[0]) && _.exists(p[1]);
            })
            .groupBy(function(p) {
              return _.getPath(players.player(st.players, p[0]), 'faction');
            })
            .map(function(ps,f) {
              var values = _.map(ps, function(p) { return p[1]; });
              return [f,
                      _.countBy(values, _.identity),
                     factions.hueFor(f)];
            })
            .value();
        },
        sum: function(base, other) {
          return _.reduce(other, function(mem, f) {
            var mem_f = _.find(mem, function(mf) { return mf[0] === f[0]; });
            if(!_.exists(mem_f)) {
              mem.push(f);
              return mem;
            }
            _.reduce(f[1], function(m, count, c) {
              if(_.exists(m[c])) m[c] += count;
              else m[c] = count;
              return m;
            }, mem_f[1]);
            return mem;
          }, _.snapshot(base));
        }
      };
      return statsCastersEntry;
    }
  ])
  .factory('statsTiersEntry', [
    'list',
    'lists',
    'players',
    'game',
    function(list,
             lists,
             players,
             game) {
      var statsTiersEntry = {
        count: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return [ players.player(st.players, gs[0]), _.chain(gs[1])
                       .mapWith(game.listForPlayer, gs[0])
                       .without(undefined, null)
                       .value() ];
            })
            // .spy('lists1')
            .filter(function(gs) { return _.exists(gs[0]); })
            .map(function(gs) {
              return _.map(gs[1], function(c) {
                return lists.themeForCaster(gs[0].lists, c) || 'None';
              });
            })
            // .spy('lists2')
            .flatten()
            .without(null, undefined)
            .countBy(_.identity)
            .value();
        },
        sum: function(base, other) {
          return _.reduce(other, function(mem, count, t) {
            if(_.exists(mem[t])) mem[t] += count;
            else mem[t] = count;
            return mem;
          }, _.snapshot(base));
        }
      };
      return statsTiersEntry;
    }
  ])
  .factory('statsReferencesEntry', [
    'list',
    'lists',
    'players',
    'game',
    function(list,
             lists,
             players,
             game) {
      var statsReferencesEntry = {
        count: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return [ players.player(st.players, gs[0]), _.chain(gs[1])
                       .mapWith(game.listForPlayer, gs[0])
                       .without(undefined, null)
                       .uniq()
                       .value() ];
            })
            // .spy('lists1')
            .map(function(gs) {
              return _.map(gs[1], function(c) {
                return lists.listForCaster(gs[0].lists, c);
              });
            })
            // .spy('lists1')
            .flatten()
            .without(undefined, null)
            .mapWith(list.references)
            .mapWith(_.rest)
            .flatten()
            .countBy(_.identity)
            .value();
        },
        sum: function(base, other) {
          return _.reduce(other, function(mem, count, t) {
            if(_.exists(mem[t])) mem[t] += count;
            else mem[t] = count;
            return mem;
          }, _.snapshot(base));
        }
      };
      return statsReferencesEntry;
    }
  ]);
