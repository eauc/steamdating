'use strict';

angular.module('srApp.services')
  .factory('statsPointsEntry', [
    'games',
    function(gamesService) {
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var ptsForPlayer = R.head;
      var ptsAgainstPlayer = R.nth(1);
      var ptsNbGames = R.nth(2);

      var statsPointsEntryService = {
        count: function(state, selection) {
          return {
            colors: [ '#4AE34D',
                      '#E3341D' ],
            values: R.pipe(
              R.map(function(sel_entry) {
                return [
                  gamesService.pointsForPlayer(selPlayer(sel_entry), null, null,
                                               selGames(sel_entry)),
                  gamesService.pointsAgainstPlayer(selPlayer(sel_entry), null, null,
                                                   selGames(sel_entry)),
                  selGames(sel_entry).length
                ];
              }),
              R.reduce(function(mem, pts_entry) {
                return [
                  {
                    tournament: ptsForPlayer(mem).tournament +
                      ptsForPlayer(pts_entry).tournament,
                    control: ptsForPlayer(mem).control +
                      ptsForPlayer(pts_entry).control,
                    army: ptsForPlayer(mem).army +
                      ptsForPlayer(pts_entry).army,
                    assassination: ptsForPlayer(mem).assassination +
                      ptsForPlayer(pts_entry).assassination
                  },
                  {
                    tournament: ptsAgainstPlayer(mem).tournament +
                      ptsAgainstPlayer(pts_entry).tournament,
                    control: ptsAgainstPlayer(mem).control +
                      ptsAgainstPlayer(pts_entry).control,
                    army: ptsAgainstPlayer(mem).army +
                      ptsAgainstPlayer(pts_entry).army,
                    assassination: ptsAgainstPlayer(mem).assassination +
                      ptsAgainstPlayer(pts_entry).assassination
                  },
                  ptsNbGames(pts_entry) +
                    ptsNbGames(mem)
                ];
              }, [
                { tournament: 0, control: 0, army: 0, assassination: 0 },
                { tournament: 0, control: 0, army: 0, assassination: 0 },
                0
              ]),
              function(points) {
                var total = (ptsNbGames(points) === 0) ? 1 : ptsNbGames(points);
                return {
                  'Win/Loss': [ ptsForPlayer(points).tournament,
                                ptsAgainstPlayer(points).tournament
                              ],
                  'Control': [ ptsForPlayer(points).control/total,
                               ptsAgainstPlayer(points).control/total
                             ],
                  'Army': [ ptsForPlayer(points).army/total,
                            ptsAgainstPlayer(points).army/total
                          ],
                  'CasterKill': [ ptsForPlayer(points).assassination,
                                  ptsAgainstPlayer(points).assassination
                                ],
                };
              }
            )(selection)
          };
        },
        sum: function(base, other) {
          return R.assoc('values', {
            'Win/Loss': [ base.values['Win/Loss'][0] + other.values['Win/Loss'][0],
                          base.values['Win/Loss'][1] + other.values['Win/Loss'][1] ],
            'Control': [ (base.values.Control[0] + other.values.Control[0])/2,
                         (base.values.Control[1] + other.values.Control[1])/2 ],
            'Army': [ (base.values.Army[0] + other.values.Army[0])/2,
                      (base.values.Army[1] + other.values.Army[1])/2 ],
            'CasterKill': [ base.values.CasterKill[0] + other.values.CasterKill[0],
                            base.values.CasterKill[1] + other.values.CasterKill[1] ],
          }, base);
        }
      };
      R.curryService(statsPointsEntryService);
      return statsPointsEntryService;
    }
  ])
  .factory('statsCastersEntry', [
    'factions',
    'game',
    'players',
    function(factionsService,
             gameService,
             playersService) {
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var listPlayer = R.head;
      var listCaster = R.nth(1);
      
      var statsCastersEntryService = {
        count: function(state, selection) {
          var list_entries_by_faction;
          return R.pipe(
            R.chain(function(sel_entry) {
              return R.map(function(game) {
                return [ selPlayer(sel_entry),
                         gameService.listForPlayer(selPlayer(sel_entry), game)
                       ];
              }, selGames(sel_entry));
            }),
            R.spy('blah'),
            R.reject(R.or(R.compose(R.isNil, listPlayer),
                          R.compose(R.isNil, listCaster)
                         )
                    ),
            R.groupBy(function(list_entry) {
              return R.pipe(
                playersService.player$(listPlayer(list_entry)),
                R.prop('faction')
              )(state.players);
            }),
            R.tap(function(l) { list_entries_by_faction = l; }),
            R.keys,
            R.map(function(faction) {
              var casters = R.map(listCaster, list_entries_by_faction[faction]);
              return [ faction,
                       R.countBy(R.identity, casters),
                       factionsService.hueFor(faction)
                     ];
            })
          )(selection);
        },
        sum: function(base, other) {
          return R.addHeaderLists(R.addObjects(R.add), base, other);
        }
      };
      R.curryService(statsCastersEntryService);
      return statsCastersEntryService;
    }
  ])
  .factory('statsOppCastersEntry', [
    'factions',
    'game',
    'players',
    function(factionsService,
             gameService,
             playersService) {
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var listPlayer = R.head;
      var listCaster = R.nth(1);
      
      var statsOppCastersEntryService = {
        count: function(state, selection) {
          var list_entries_by_faction;
          return R.pipe(
            R.chain(function(sel_entry) {
              return R.map(function(game) {
                var opp = gameService.opponentForPlayer(selPlayer(sel_entry), game);
                return [ opp, gameService.listForPlayer(opp, game) ];
              }, selGames(sel_entry));
            }),
            R.reject(R.or(R.compose(R.isNil, listPlayer),
                          R.compose(R.isNil, listCaster)
                         )
                    ),
            R.groupBy(function(list_entry) {
              return R.pipe(
                playersService.player$(listPlayer(list_entry)),
                R.prop('faction')
              )(state.players);
            }),
            R.tap(function(l) { list_entries_by_faction = l; }),
            R.keys,
            R.map(function(faction) {
              var casters = R.map(listCaster, list_entries_by_faction[faction]);
              return [ faction,
                       R.countBy(R.identity, casters),
                       factionsService.hueFor(faction)
                     ];
            })
          )(selection);
        },
        sum: function(base, other) {
          return R.addHeaderLists(R.addObjects(R.add), base, other);
        }
      };
      R.curryService(statsOppCastersEntryService);
      return statsOppCastersEntryService;
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
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var lstPlayer = R.head;
      var lstCasters = R.nth(1);

      var statsTiersEntryService = {
        count: function(state, selection) {
          return R.pipe(
            R.map(function(sel_entry) {
              return [ playersService.player(selPlayer(sel_entry), state.players),
                       R.pipe(
                         R.map(gameService.listForPlayer$(selPlayer(sel_entry))),
                         R.reject(R.isNil)
                       )(selGames(sel_entry))
                     ];
            }),
            R.reject(R.compose(R.isNil, lstPlayer)),
            R.chain(function(lst_entry) {
              return R.map(function(caster) {
                return R.defaultTo('None',
                                   listsService.themeForCaster(caster,
                                                               lstPlayer(lst_entry).lists)
                                  );
              }, lstCasters(lst_entry));
            }),
            R.reject(R.isNil),
            R.countBy(R.identity)
          )(selection);
        },
        sum: function(base, other) {
          return R.addObjects(R.add, base, other);
        }
      };
      R.curryService(statsTiersEntryService);
      return statsTiersEntryService;
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
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var lstPlayer = R.head;
      var lstCasters = R.nth(1);

      var statsReferencesEntryService = {
        count: function(state, selection) {
          return R.pipe(
            R.map(function(sel_entry) {
              return [ playersService.player(selPlayer(sel_entry), state.players),
                       R.pipe(
                         R.map(gameService.listForPlayer$(selPlayer(sel_entry))),
                         R.reject(R.isNil),
                         R.uniq
                       )(selGames(sel_entry))
                     ];
            }),
            R.chain(function(lst_entry) {
              return R.map(function(caster) {
                return listsService.listForCaster(caster,
                                                  R.prop('lists', lstPlayer(lst_entry))
                                                 );
              }, lstCasters(lst_entry));
            }),
            R.reject(R.isNil),
            R.map(listService.references),
            R.chain(R.tail),
            R.countBy(R.identity)
          )(selection);
        },
        sum: function(base, other) {
          return R.addObjects(R.add, base, other);
        }
      };
      R.curryService(statsReferencesEntryService);
      return statsReferencesEntryService;
    }
  ]);
