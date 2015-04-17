'use strict';

angular.module('srApp.services')
  .factory('basePairing', [
    'rounds',
    'players',
    function(roundsService,
             playersService) {
      var basePairingService = {
        suggestTableFor: function(rounds, available_tables, p1, p2, tables_groups_size) {
          available_tables = R.shuffle(available_tables);
          tables_groups_size = R.defaultTo(R.max(available_tables)+1, tables_groups_size);

          var available_tables_groups = roundsService.tablesGroups(tables_groups_size,
                                                                        available_tables);
          var available_tables_by_group = R.groupBy(roundsService.tableGroup$(tables_groups_size),
                                                    available_tables);
          
          var p1_tables = roundsService.tablesForPlayer(p1, rounds);
          var p1_tables_groups = roundsService.tablesGroups(tables_groups_size,
                                                                 p1_tables);

          var p2_tables = roundsService.tablesForPlayer(p2, rounds);
          var p2_tables_groups = roundsService.tablesGroups(tables_groups_size,
                                                                 p2_tables);

          var possible_tables = R.difference(available_tables,
                                             R.concat(p1_tables, p2_tables));
          var possible_groups = R.difference(available_tables_groups,
                                             R.concat(p1_tables_groups, p2_tables_groups));
          return ( !R.isEmpty(possible_groups) ?
                   available_tables_by_group[possible_groups[0]][0] :
                   ( !R.isEmpty(possible_tables) ?
                     possible_tables[0] :
                     available_tables[0]
                   )
                 );
        }
      };
      R.curryService(basePairingService);
      return basePairingService;
    }
  ])
  .factory('bracketPairing', [
    'basePairing',
    'players',
    'game',
    'round',
    'state',
    function(basePairingService,
             playersService,
             gameService,
             roundService,
             stateService) {
      var bracketPairingService = {
        indices: function(size) {
          if(2 === size) return [[1, 2]];
          return R.pipe(
            R.map(function(val) {
              return [[val[0], size+1-val[0]], [size+1-val[1], val[1]]];
            }),
            R.reduce(function(mem, val) {
              return R.concat(mem, val);
            }, [])
          )(bracketPairingService.indices(size/2));
        },
        suggestFirstSingleRound: function(state, group_index) {
          var players_not_droped = stateService.playersNotDropedInLastRound(state);
          var tables = playersService.tableRangeForGroup(group_index, players_not_droped);

          var players = R.pipe(
            R.nth(group_index),
            playersService.sortGroup$(state, false),
            R.chain(R.prop('players'))
          )(players_not_droped);

          return R.pipe(
            R.length,
            bracketPairingService.indices,
            R.map(function(index) {
              var p1 = players[index[0]-1].name;
              var p2 = players[index[1]-1].name;
              var table = basePairingService.suggestTableFor(state.rounds, tables, p1, p2,
                                                             R.prop('tables_groups_size', state));
              tables = R.reject(R.eq(table), tables);
              return gameService.create({ table: table,
                                          p1: { name: p1 },
                                          p2: { name: p2 }
                                        });
            })
          )(players);
        },
        suggestNextSingleRound: function(state, group_index) {
          var players_not_droped = stateService.playersNotDropedInLastRound(state);
          var tables = playersService.tableRangeForGroup(group_index, players_not_droped);
          var nb_bracket_rounds = stateService.bracketNbRounds(group_index, state);
          var games_groups_bracket_size = players_not_droped[group_index].length /
              (1 << nb_bracket_rounds);
          
          return R.pipe(
            R.prop('rounds'),
            R.last,
            roundService.gamesForGroup$(players_not_droped, group_index),
            R.chunkAll(games_groups_bracket_size, null),
            R.reduce(function(mem, round) {
              var winners = roundService.winners(round);
              var losers = roundService.losers(round);
              var pairs = R.chunkAll(2, null, R.concat(winners, losers));

              var new_pairings = R.map(function(p) {
                var table = basePairingService.suggestTableFor(state.rounds,
                                                               tables,
                                                               p[0], p[1],
                                                               R.prop('tables_groups_size', state));
                tables = R.reject(R.eq(table), tables);
                return gameService.create({ table: table,
                                            p1: { name: p[0] },
                                            p2: { name: p[1] }
                                          });
              }, pairs);
              return R.concat(mem, new_pairings);
            }, [])
          )(state);
        },
        suggestFirstRound: function(state, group_index) {
          return bracketPairingService.suggestFirstSingleRound(state, group_index);
        },
        suggestNextRound: function(state, group_index) {
          return bracketPairingService.suggestNextSingleRound(state, group_index);
        },
        suggestRound: function(state, group_index) {
          if(0 === stateService.bracketNbRounds(group_index, state)) {
            return bracketPairingService.suggestFirstRound(state, group_index);
          }
          else {
            return bracketPairingService.suggestNextRound(state, group_index);
          }
        }
      };
      R.curryService(bracketPairingService);
      return bracketPairingService;
    }
  ])
  .factory('srPairing', [
    'basePairing',
    'players',
    'rounds',
    'game',
    'state',
    function(basePairingService,
             playersService,
             roundsService,
             gameService,
             stateService) {
      var srPairingService = {
        sortPlayers: function(players) {
          var players_grouped_by_tp;
          return R.pipe(
            R.groupBy(R.path(['points','tournament'])),
            R.tap(function(players) { players_grouped_by_tp = players; }),
            R.keys,
            R.sortBy(function(key) { return parseFloat(key); }),
            R.chain(function(key) {
              return R.shuffle(players_grouped_by_tp[key]);
            }),
            R.reverse
          )(players);
        },
        sortAvailablePlayersFor: function(available_players, p1) {
          var players_grouped_by_tp;
          return R.pipe(
            R.groupBy(R.path(['points','tournament'])),
            R.tap(function(players) { players_grouped_by_tp = players; }),
            R.keys,
            R.sortBy(function(key) { return "undefined" === key ? -1 : parseFloat(key); }),
            R.map(function(key) { return R.prop(key, players_grouped_by_tp); }),
            R.chain(R.partition(R.eqProps('origin', p1))),
            R.flatten,
            R.reverse,
            R.pluck('name')
          )(available_players);
        },
        suggestOpponentFor: function(opp_names, available_player_names) {
          var candidates = R.difference(available_player_names, opp_names);
          return ( candidates.length === 0 ?
                   available_player_names[0] :
                   candidates[0]
                 );
        },
        findNextPairing: function(rounds, sorted_players, tables, tables_groups_size) {
          var p1 = R.head(sorted_players);
          sorted_players = R.tail(sorted_players);

          var p1_opps = roundsService.opponentsForPlayer(p1.name, rounds);
          var p1_availables = srPairingService.sortAvailablePlayersFor(sorted_players, p1);
          
          var p2_name = srPairingService.suggestOpponentFor(p1_opps, p1_availables);
          var p2 = playersService.player(p2_name, sorted_players);
          sorted_players = R.reject(R.eq(p2), sorted_players);

          var table = basePairingService.suggestTableFor(rounds, tables,
                                                         p1.name, p2.name,
                                                         tables_groups_size);
          tables = R.reject(R.eq(table), tables);

          return [ gameService.create({ table: table,
                                        p1: { name: p1.name },
                                        p2: { name: p2.name } }),
                   sorted_players,
                   tables
                 ];
        },
        suggestNextSingleRound: function(state, group_index) {
          var players_not_droped = stateService.playersNotDropedInLastRound(state);
          var tables = playersService.tableRangeForGroup(group_index, players_not_droped);
          var sorted_players = srPairingService.sortPlayers(players_not_droped[group_index]);

          if(1 === (sorted_players.length & 0x1)) sorted_players.push({ name: '_phantom_' });
          
          return R.pipe(
            R.nth(group_index),
            R.length,
            R.flip(R.divide)(2),
            R.range(0),
            R.map(function(i) {
              var pairing = srPairingService.findNextPairing(state.rounds,
                                                             sorted_players,
                                                             tables,
                                                             R.prop('tables_groups_size', state));
              sorted_players = pairing[1];
              tables = pairing[2];
              return pairing[0];
            }),
            R.sortBy(R.prop('table'))
          )(players_not_droped);
        },
        suggestNextRound: function(state, group_index) {
          return srPairingService.suggestNextSingleRound(state, group_index);
        }
      };
      R.curryService(srPairingService);
      return srPairingService;
    }
  ])
  .factory('pairing', [
    'bracketPairing',
    'srPairing',
    function(bracketPairingService,
             srPairingService) {
      var pairingService = {
        suggestRound: function(state, group_index, bracket) {
          if(!R.isNil(bracket)) {
            return bracketPairingService.suggestRound(state, group_index, bracket);
          }
          else {
            return srPairingService.suggestRound(state, group_index);
          }
        }
      };
      return pairingService;
    }
  ]);
