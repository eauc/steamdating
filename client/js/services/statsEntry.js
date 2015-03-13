'use strict';

angular.module('srApp.services')
  .factory('statsPointsEntry', [
    'games',
    function(gamesService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      function ptsForPlayer(entry) { return entry[0]; }
      function ptsAgainstPlayer(entry) { return entry[1]; }
      function ptsNbGames(entry) { return entry[2]; }

      var statsPointsEntry = {
        count: function(state, selection) {
          return {
            colors: [ '#4AE34D',
                      '#E3341D' ],
            values: _.chain(selection)
              .mapWith(function(sel_entry) {
                return [
                  gamesService.pointsForPlayer(selGames(sel_entry), selPlayer(sel_entry)),
                  gamesService.pointsAgainstPlayer(selGames(sel_entry), selPlayer(sel_entry)),
                  selGames(sel_entry).length
                ];
              })
              .reduce(function(mem, pts_entry) {
                return [{
                  tournament: ptsForPlayer(mem).tournament + ptsForPlayer(pts_entry).tournament,
                  control: ptsForPlayer(mem).control + ptsForPlayer(pts_entry).control,
                  army: ptsForPlayer(mem).army + ptsForPlayer(pts_entry).army,
                  assassination: ptsForPlayer(mem).assassination +
                    ptsForPlayer(pts_entry).assassination
                }, {
                  tournament: ptsAgainstPlayer(mem).tournament + ptsAgainstPlayer(pts_entry).tournament,
                  control: ptsAgainstPlayer(mem).control + ptsAgainstPlayer(pts_entry).control,
                  army: ptsAgainstPlayer(mem).army + ptsAgainstPlayer(pts_entry).army,
                  assassination: ptsAgainstPlayer(mem).assassination +
                    ptsAgainstPlayer(pts_entry).assassination
                }, ptsNbGames(pts_entry) + ptsNbGames(mem) ];
              }, [{ tournament: 0, control: 0, army: 0, assassination: 0 },
                  { tournament: 0, control: 0, army: 0, assassination: 0 },
                  0
                 ])
              .apply(function(points) {
                var total = (ptsNbGames(points) === 0) ? 1 : ptsNbGames(points);
                return {
                  'Win/Loss': [ptsForPlayer(points).tournament,
                               ptsAgainstPlayer(points).tournament],
                  'Control': [ptsForPlayer(points).control/total,
                              ptsAgainstPlayer(points).control/total],
                  'Army': [ptsForPlayer(points).army/total,
                           ptsAgainstPlayer(points).army/total],
                  'CasterKill': [ptsForPlayer(points).assassination,
                                  ptsAgainstPlayer(points).assassination],
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
            'CasterKill': [ base.values.CasterKill[0] + other.values.CasterKill[0],
                            base.values.CasterKill[1] + other.values.CasterKill[1] ],
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
    function(factionsService,
             gameService,
             playersService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      function listPlayer(entry) { return entry[0]; }
      function listCaster(entry) { return entry[1]; }
      
      var statsCastersEntry = {
        count: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return _.map(selGames(sel_entry), function(game) {
                return [ selPlayer(sel_entry),
                         gameService.listForPlayer(game, selPlayer(sel_entry))
                       ];
              });
            })
            .flatten(true)
            .filter(function(list_entry) {
              return ( _.exists(listPlayer(list_entry)) &&
                       _.exists(listCaster(list_entry)) );
            })
            .groupBy(function(list_entry) {
              return _.chain(state.players)
                .apply(playersService.player, listPlayer(list_entry))
                .getPath('faction')
                .value();
            })
            .map(function(list_entries, faction) {
              var casters = _.map(list_entries, listCaster);
              return [ faction,
                       _.countBy(casters, _.identity),
                       factionsService.hueFor(faction)
                     ];
            })
            .value();
        },
        sum: function(base, other) {
          return _.addHeaderLists(base, other, _.partial(_.addObjects, _, _, _.add));
        }
      };
      return statsCastersEntry;
    }
  ])
  .factory('statsOppCastersEntry', [
    'factions',
    'game',
    'players',
    function(factionsService,
             gameService,
             playersService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      function listPlayer(entry) { return entry[0]; }
      function listCaster(entry) { return entry[1]; }
      
      var statsCastersEntry = {
        count: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return _.map(selGames(sel_entry), function(game) {
                var opp = gameService.opponentForPlayer(game, selPlayer(sel_entry));
                return [opp, gameService.listForPlayer(game, opp)];
              });
            })
            .flatten(true)
            .filter(function(list_entry) {
              return ( _.exists(listPlayer(list_entry)) &&
                       _.exists(listCaster(list_entry)) );
            })
            .groupBy(function(list_entry) {
              return _.chain(state.players)
                .apply(playersService.player, listPlayer(list_entry))
                .getPath('faction')
                .value();
            })
            .map(function(list_entries,faction) {
              var casters = _.map(list_entries, listCaster);
              return [faction,
                      _.countBy(casters, _.identity),
                     factionsService.hueFor(faction)];
            })
            .value();
        },
        sum: function(base, other) {
          return _.addHeaderLists(base, other, _.partial(_.addObjects, _, _, _.add));
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
    function(listService,
             listsService,
             playersService,
             gameService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      function lstPlayer(entry) { return entry[0]; }
      function lstCasters(entry) { return entry[1]; }

      var statsTiersEntry = {
        count: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return [ playersService.player(state.players, selPlayer(sel_entry)),
                       _.chain(selGames(sel_entry))
                       .mapWith(gameService.listForPlayer, selPlayer(sel_entry))
                       .without(undefined, null)
                       .value() ];
            })
            .filter(function(lst_entry) { return _.exists(lstPlayer(lst_entry)); })
            .mapcat(function(lst_entry) {
              return _.map(lstCasters(lst_entry), function(caster) {
                return listsService.themeForCaster(lstPlayer(lst_entry).lists, caster) || 'None';
              });
            })
            .without(null, undefined)
            .countBy(_.identity)
            .value();
        },
        sum: function(base, other) {
          return _.addObjects(base, other, _.add);
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
    function(listService,
             listsService,
             playersService,
             gameService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      function lstPlayer(entry) { return entry[0]; }
      function lstCasters(entry) { return entry[1]; }

      var statsReferencesEntry = {
        count: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return [ playersService.player(state.players, selPlayer(sel_entry)),
                       _.chain(selGames(sel_entry))
                       .mapWith(gameService.listForPlayer, selPlayer(sel_entry))
                       .without(undefined, null)
                       .uniq()
                       .value() ];
            })
            .mapcat(function(lst_entry) {
              return _.map(lstCasters(lst_entry), function(caster) {
                return listsService.listForCaster(_.getPath(lstPlayer(lst_entry), 'lists'), caster);
              });
            })
            .without(undefined, null)
            .mapWith(listService.references)
            .mapcatWith(_.rest)
            .countBy(_.identity)
            .value();
        },
        sum: function(base, other) {
          return _.addObjects(base, other, _.add);
        }
      };
      return statsReferencesEntry;
    }
  ]);
