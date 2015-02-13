'use strict';

angular.module('srApp.services')
  .factory('basePairing', [
    'rounds',
    'players',
    function(rounds,
             players) {
      var basePairing = {
        tableRangeForGroup: function(ps, i) {
          var group_range = players.indexRangeForGroup(ps, i);
          return _.range(Math.round(group_range[0]/2+1),
                         Math.round(group_range[1]/2+1));
        },
        suggestTableFor: function(rs, available_tables, p1, p2) {
          var p1_tables = rounds.tablesForPlayer(rs, p1);
          var p2_tables = rounds.tablesForPlayer(rs, p2);
          var possible_tables = _.difference(available_tables, p1_tables, p2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        },
        // suggestTableForTeam: function(rs, available_tables, t1, t2) {
        //   var t1_tables = rounds.tablesForTeam(rs, t1);
        //   var t2_tables = rounds.tablesForTeam(rs, t2);
        //   var possible_tables = _.difference(available_tables, t1_tables, t2_tables);
        //   return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        // }
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
    // 'team_game',
    // 'teams',
    function(basePairing,
             players,
             game,
             round,
             state
             // team_game,
             // teams
            ) {
      var bracketPairing = {
        indices: function(n) {
          if(2 === n) return [[1, 2]];
          return _.chain(bracketPairing.indices(n/2))
            .map(function(val) {
              return [[val[0], n+1-val[0]], [n+1-val[1], val[1]]];
            })
            .reduce(function(mem, val) {
              return _.cat(mem, val);
            }, [])
            .value();
        },
        suggestFirstSingleRound: function(st, gri) {
          var tables = basePairing.tableRangeForGroup(st.players, gri);
          var group = st.players[gri];
          var ps = _.chain(group)
            .apply(players.sortGroup, st, false)
            .mapWith(_.getPath, 'players')
            .flatten()
            .value();
          return _.chain(ps.length)
            .apply(bracketPairing.indices)
            .map(function(ind) {
              var p1 = ps[ind[0]-1].name;
              var p2 = ps[ind[1]-1].name;
              var table = basePairing.suggestTableFor(st.rounds, tables, p1, p2);
              tables = _.without(tables, table);
              return game.create(table, p1, p2);
            })
            .value();
        },
        suggestNextSingleRound: function(st, gri) {
          var tables = basePairing.tableRangeForGroup(st.players, gri);
          var nb_bracket_rounds = state.bracketNbRounds(st, gri);
          return _.chain(st.rounds)
            .last()
            .apply(round.gamesForGroup, st.players, gri)
            // .spy('games')
            .chunk(st.players[gri].length / (1 << nb_bracket_rounds))
            // .spy('chunk')
            .reduce(function(mem, r) {
              var winners = _.chain(r)
                  .apply(round.winners)
                  .value();
              // console.log('winners', winners);
              var losers = _.chain(r)
                  .apply(round.losers)
                  .value();
              // console.log('losers', losers);
              var pairs = _.chain(winners)
                  .cat(losers)
                  .chunk(2)
                  .value();
              // console.log('pairs', pairs);
              return  _.cat(mem, _.map(pairs, function(p) {
                var table = basePairing.suggestTableFor(st.rounds,
                                                        tables,
                                                        p[0], p[1]);
                tables = _.without(tables, table);
                return game.create(table, p[0], p[1]);
              }));
            }, [])
            .value();
        },
  //       suggestFirstTeamRound: function(state, i) {
  //         var n_games = _.flatten(state.teams).length/2;
  //         var first_table = _.chain(state.teams)
  //           .slice(0, i)
  //           .flatten()
  //           .value().length / 2 + 1;
  //         var last_table = first_table + state.teams[i].length / 2;
  //         var tables = _.range(first_table, last_table);
  //         var nb_games = teams.teamSize(state.teams,
  //                                       state.players);
  //         var group = state.teams[i];
  //         var ts = teams.sortGroup(group, i, state);
  //         return _.chain(group.length)
  //           .apply(bracketPairing.indices)
  //           .map(function(ind) {
  //             var t1 = ts[ind[0]-1].name;
  //             var t2 = ts[ind[1]-1].name;
  //             var table = basePairing.suggestTableForTeam(state.rounds,
  //                                                         tables,
  //                                                         t1, t2);
  //             tables = _.without(tables, table);
  //             return team_game.create(table, t1, t2, nb_games);
  //           })
  //           .value();
  //       },
  //       suggestNextTeamRound: function(state, i) {
  //         var n_games = _.flatten(state.teams[i]).length/2;
  //         var first_table = _.chain(state.teams)
  //           .slice(0, i)
  //           .flatten()
  //           .value().length / 2 + 1;
  //         var last_table = first_table + state.teams[i].length / 2;
  //         var tables = _.range(first_table, last_table);
  //         var nb_games = teams.teamSize(state.teams,
  //                                       state.players);
  //         var group = state.teams[i];
  //         var nb_bracket_rounds = state.rounds.length - state.bracket[i];
  //         var start_index = _.chain(state.teams)
  //             .slice(0, i)
  //             .flatten()
  //             .value().length / 2;
  //         var end_index = start_index + group.length / 2;
  //         return _.chain(state.rounds)
  //           .last()
  //           .slice(start_index, end_index)
  //           .chunk(n_games / (1 << nb_bracket_rounds-1))
  //           .reduce(function(mem, r) {
  //             var winners = _.chain(r)
  //               .apply(round.winnerTeams)
  //               .value();
  //             var losers = _.chain(r)
  //               .apply(round.loserTeams)
  //               .value();
  //             var pairs = _.chain(winners)
  //               .cat(losers)
  //               .chunk(2)
  //               .value();
  //             return  _.cat(mem, _.map(pairs, function(p) {
  //               var table = basePairing.suggestTableForTeam(state.rounds,
  //                                                           tables,
  //                                                           p[0], p[1]);
  //               tables = _.without(tables, table);
  //               return team_game.create(table, p[0], p[1], nb_games);
  //             }));
  //           }, [])
  //           .value();
  //       },
        suggestFirstRound: function(state, gri) {
  //         if(_.flatten(state.teams).length === 0) {
            return bracketPairing.suggestFirstSingleRound(state, gri);
  //         }
  //         else {
  //           return bracketPairing.suggestFirstTeamRound(state, i);
  //         }
        },
        suggestNextRound: function(state, gri) {
  //         if(_.flatten(state.teams).length === 0) {
            return bracketPairing.suggestNextSingleRound(state, gri);
  //         }
  //         else {
  //           return bracketPairing.suggestNextTeamRound(state, i);
  //         }
        },
        suggestRound: function(st, gri) {
          if(0 === state.bracketNbRounds(st, gri)) {
            return bracketPairing.suggestFirstRound(st, gri);
          }
          else {
            return bracketPairing.suggestNextRound(st, gri);
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
    // 'teams',
    // 'team_game',
    function(basePairing,
             players,
             rounds,
             game
      //        teams,
      //        team_game
            ) {
      var srPairing = {
        sortPlayers: function(ps) {
          var by_tp;
          return _.chain(ps)
            .groupBy(function(p) { return p.points.tournament; })
            .apply(function(c) { by_tp = c; return c; })
            .keys()
            .sortBy(function(k) { return parseFloat(k); })
            .map(function(key) {
              return _.shuffle(by_tp[key]);
            })
            .flatten()
            .reverse()
            .value();
        },
        sortAvailablePlayersFor: function(available_players, p1) {
          var by_tp;
          return _.chain(available_players)
            .groupBy(_.partial(_.getPath, _, 'points.tournament'))
            .apply(function(c) { by_tp = c; return c; })
            .keys()
            // .spy('keys')
            .sortBy(function(k) { return "undefined" === k ? -1 : parseFloat(k); })
            // .spy('keys_sort')
            .map(function(key) {
              var other_cities = _.filter(by_tp[key], function(p) { return p.city !== p1.city; });
              var same_city = _.filter(by_tp[key], function(p) { return p.city === p1.city; });
              return _.cat(same_city, other_cities);
            })
            .flatten()
            .reverse()
            .apply(players.names)
            .value();
        },
        suggestOpponentFor: function(opp_names, available_player_names) {
          var candidates = _.difference(available_player_names, opp_names);
          return (candidates.length === 0 ? available_player_names[0] : candidates[0]);
        },
        findNextPairing: function(rs, sorted_players, tables) {
          var p1 = _.first(sorted_players);
          sorted_players = _.rest(sorted_players);

          var p1_opps = rounds.opponentsForPlayer(rs, p1.name);
          var p1_availables = srPairing.sortAvailablePlayersFor(sorted_players, p1);
          var p2_name = srPairing.suggestOpponentFor(p1_opps, p1_availables);
          var p2 = players.player(sorted_players, p2_name);
          sorted_players = _.without(sorted_players, p2);

          var table = basePairing.suggestTableFor(rs, tables,
                                                  p1.name, p2.name);
          tables = _.without(tables, table);

          return [ game.create(table, p1.name, p2.name), sorted_players, tables ];
        },
        suggestNextSingleRound: function(state, i) {
          var tables = basePairing.tableRangeForGroup(state.players, i);
          var sorted_players = srPairing.sortPlayers(state.players[i]);
          if(1 === (sorted_players.length & 0x1)) sorted_players.push({ name: '_phantom_' });
          return _.chain(state.players[i].length/2)
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
        // suggestOpponentForTeam: function(rs, available_teams, t1) {
        //   var available_team_names = _.chain(available_teams)
        //       .groupBy(function(t) { return t.points.team_tournament; })
        //       .map(function(g) {
        //         var other_cities = _.filter(g, function(t) { return t.city !== t1.city; });
        //         var same_city = _.filter(g, function(t) { return t.city === t1.city; });
        //         return _.cat(same_city, other_cities);
        //       })
        //       .flatten()
        //       .reverse()
        //       .apply(teams.names)
        //       .value();
        //   var opp_names = rounds.opponentsForTeam(rs, t1.name);
        //   var candidates = _.difference(available_team_names, opp_names);
        //   return (candidates.length === 0 ?
        //           teams.team(available_teams, available_team_names[0]) :
        //           teams.team(available_teams, candidates[0]));
        // },
        // suggestNextTeamRound: function(state, i) {
        //   var first_table = _.chain(state.teams)
        //     .slice(0, i)
        //     .flatten()
        //     .value().length / 2 + 1;
        //   var last_table = first_table + state.teams[i].length / 2;
        //   var tables = _.range(first_table, last_table);
        //   var group = state.teams[i];
        //   var nb_games = teams.teamSize(group,
        //                                 state.players);
        //   var sorted_teams = _.chain(group)
        //     .groupBy(function(t) { return t.points.team_tournament; })
        //     .each(function(g, key, c) {
        //       c[key] = _.shuffle(g);
        //     })
        //     .flatten()
        //     .reverse()
        //     .value();
        //   return _.chain(_.range(group.length/2))
        //     .map(function(i) {
        //       var t1 = _.first(sorted_teams);
        //       sorted_teams = _.rest(sorted_teams);

        //       var t2 = srPairing.suggestOpponentForTeam(state.rounds,
        //                                                 sorted_teams,
        //                                                 t1);
        //       sorted_teams = _.without(sorted_teams, t2);

        //       var table = basePairing.suggestTableForTeam(state.rounds,
        //                                                   tables,
        //                                                   t1.name, t2.name);
        //       tables = _.without(tables, table);

        //       return team_game.create(table, t1.name, t2.name, nb_games);
        //     })
        //     .sortBy(_.property('table'))
        //     .value();
        // },
        suggestNextRound: function(state, gr_i) {
          // if(_.flatten(state.teams).length === 0) {
            return srPairing.suggestNextSingleRound(state, gr_i);
          // }
          // else {
          //   return srPairing.suggestNextTeamRound(state, i);
          // }
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
        suggestRound: function(state, i, bracket) {
          if(_.exists(bracket)) {
            return bracketPairing.suggestRound(state, i, bracket);
          }
          else {
            return srPairing.suggestRound(state, i);
          }
        }
      };
      return pairing;
    }
  ]);
