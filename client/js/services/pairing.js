'use strict';

angular.module('srApp.services')
  .factory('basePairing', [
    'rounds',
    'players',
    function(roundsService,
             playersService) {
      var basePairing = {
        suggestTableFor: function(rounds, available_tables, p1, p2) {
          available_tables = _.shuffle(available_tables);
          var p1_tables = roundsService.tablesForPlayer(rounds, p1);
          var p2_tables = roundsService.tablesForPlayer(rounds, p2);
          var possible_tables = _.difference(available_tables, p1_tables, p2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        }
      };
      return basePairing;
    }
  ])
  .factory('bracketPairing', [
    'basePairing',
    'players',
    'game',
    'round',
    'state',
    function(basePairing,
             playersService,
             gameService,
             roundService,
             stateService) {
      var bracketPairing = {
        indices: function(size) {
          if(2 === size) return [[1, 2]];
          return _.chain(bracketPairing.indices(size/2))
            .map(function(val) {
              return [[val[0], size+1-val[0]], [size+1-val[1], val[1]]];
            })
            .reduce(function(mem, val) {
              return _.cat(mem, val);
            }, [])
            .value();
        },
        suggestFirstSingleRound: function(state, group_index) {
          var tables = playersService.tableRangeForGroup(state.players, group_index);
          var group = state.players[group_index];
          var players = _.chain(group)
            .apply(playersService.sortGroup, state, false)
            .mapcatWith(_.getPath, 'players')
            .value();
          return _.chain(players.length)
            .apply(bracketPairing.indices)
            .map(function(index) {
              var p1 = players[index[0]-1].name;
              var p2 = players[index[1]-1].name;
              var table = basePairing.suggestTableFor(state.rounds, tables, p1, p2);
              tables = _.without(tables, table);
              return gameService.create({ table: table,
                                          p1: { name: p1 },
                                          p2: { name: p2 } });
            })
            .value();
        },
        suggestNextSingleRound: function(state, group_index) {
          var tables = playersService.tableRangeForGroup(state.players, group_index);
          var nb_bracket_rounds = stateService.bracketNbRounds(state, group_index);
          return _.chain(state.rounds)
            .last()
            .apply(roundService.gamesForGroup, state.players, group_index)
            .chunk(state.players[group_index].length / (1 << nb_bracket_rounds))
            .reduce(function(mem, round) {
              var winners = roundService.winners(round);
              var losers = roundService.losers(round);
              var pairs = _.chain(winners)
                  .cat(losers)
                  .chunk(2)
                  .value();
              return  _.cat(mem, _.map(pairs, function(p) {
                var table = basePairing.suggestTableFor(state.rounds,
                                                        tables,
                                                        p[0], p[1]);
                tables = _.without(tables, table);
                return gameService.create({ table: table,
                                            p1: { name: p[0] },
                                            p2: { name: p[1] } });
              }));
            }, [])
            .value();
        },
        suggestFirstRound: function(state, group_index) {
          return bracketPairing.suggestFirstSingleRound(state, group_index);
        },
        suggestNextRound: function(state, group_index) {
          return bracketPairing.suggestNextSingleRound(state, group_index);
        },
        suggestRound: function(state, group_index) {
          if(0 === stateService.bracketNbRounds(state, group_index)) {
            return bracketPairing.suggestFirstRound(state, group_index);
          }
          else {
            return bracketPairing.suggestNextRound(state, group_index);
          }
        }
      };
      return bracketPairing;
    }
  ])
  .factory('srPairing', [
    'basePairing',
    'players',
    'rounds',
    'game',
    function(basePairing,
             playersService,
             roundsService,
             gameService) {
      var srPairing = {
        sortPlayers: function(players) {
          var players_grouped_by_tp;
          return _.chain(players)
            .groupBy(_.partial(_.getPath, _, 'points.tournament'))
            .tap(function(players) { players_grouped_by_tp = players; })
            .keys()
            .sortBy(function(key) { return parseFloat(key); })
            .mapcat(function(key) {
              return _.shuffle(players_grouped_by_tp[key]);
            })
            .reverse()
            .value();
        },
        sortAvailablePlayersFor: function(available_players, p1) {
          var players_grouped_by_tp;
          return _.chain(available_players)
            .groupBy(_.partial(_.getPath, _, 'points.tournament'))
            .tap(function(players) { players_grouped_by_tp = players; })
            .keys()
            .sortBy(function(key) { return "undefined" === key ? -1 : parseFloat(key); })
            .mapcat(function(key) {
              var other_origin = _.filter(players_grouped_by_tp[key],
                                          function(p) { return p.origin !== p1.origin; });
              var same_origin = _.filter(players_grouped_by_tp[key],
                                       function(p) { return p.origin === p1.origin; });
              return _.cat(same_origin, other_origin);
            })
            .reverse()
            .mapWith(_.partial(_.getPath, _, 'name'))
            .value();
        },
        suggestOpponentFor: function(opp_names, available_player_names) {
          var candidates = _.difference(available_player_names, opp_names);
          return (candidates.length === 0 ? available_player_names[0] : candidates[0]);
        },
        findNextPairing: function(rounds, sorted_players, tables) {
          var p1 = _.first(sorted_players);
          sorted_players = _.rest(sorted_players);

          var p1_opps = roundsService.opponentsForPlayer(rounds, p1.name);
          var p1_availables = srPairing.sortAvailablePlayersFor(sorted_players, p1);
          var p2_name = srPairing.suggestOpponentFor(p1_opps, p1_availables);
          var p2 = playersService.player(sorted_players, p2_name);
          sorted_players = _.without(sorted_players, p2);

          var table = basePairing.suggestTableFor(rounds, tables,
                                                  p1.name, p2.name);
          tables = _.without(tables, table);

          return [ gameService.create({ table: table,
                                        p1: { name: p1.name },
                                        p2: { name: p2.name } }),
                   sorted_players,
                   tables
                 ];
        },
        suggestNextSingleRound: function(state, group_index) {
          var tables = playersService.tableRangeForGroup(state.players, group_index);
          var sorted_players = srPairing.sortPlayers(state.players[group_index]);
          if(1 === (sorted_players.length & 0x1)) sorted_players.push({ name: '_phantom_' });
          return _.chain(state.players[group_index].length/2)
            .range()
            .map(function(i) {
              var pairing = srPairing.findNextPairing(state.rounds, sorted_players, tables);
              sorted_players = pairing[1];
              tables = pairing[2];
              return pairing[0];
            })
            .sortBy(_.property('table'))
            .value();
        },
        suggestNextRound: function(state, group_index) {
          return srPairing.suggestNextSingleRound(state, group_index);
        }
      };
      return srPairing;
    }
  ])
  .factory('pairing', [
    'bracketPairing',
    'srPairing',
    function(bracketPairing,
             srPairing) {
      var pairing = {
        suggestRound: function(state, group_index, bracket) {
          if(_.exists(bracket)) {
            return bracketPairing.suggestRound(state, group_index, bracket);
          }
          else {
            return srPairing.suggestRound(state, group_index);
          }
        }
      };
      return pairing;
    }
  ]);
