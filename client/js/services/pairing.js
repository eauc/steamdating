'use strict';

angular.module('srApp.services')
  .factory('basePairing', [
    'rounds',
    function(rounds) {
      var basePairing = {
        suggestTableFor: function(rs, available_tables, p1, p2) {
          var p1_tables = rounds.tablesFor(rs, p1);
          var p2_tables = rounds.tablesFor(rs, p2);
          var possible_tables = _.difference(available_tables, p1_tables, p2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        },
        suggestTableForTeam: function(rs, available_tables, t1, t2) {
          var t1_tables = rounds.tablesForTeam(rs, t1);
          var t2_tables = rounds.tablesForTeam(rs, t2);
          var possible_tables = _.difference(available_tables, t1_tables, t2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        }
      };
      return basePairing;
    }
  ])
  .factory('bracketPairing', [
    'basePairing',
    'game',
    'team_game',
    'round',
    'players',
    'teams',
    function(basePairing,
             game,
             team_game,
             round,
             players,
             teams) {
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
        suggestFirstSingleRound: function(state) {
          var n_games = state.players.length/2;
          var tables = _.range(1, n_games+1);
          var ps = players.sort(state.players, state);
          return _.chain(state.players.length)
              .apply(bracketPairing.indices)
              .map(function(ind) {
                var p1 = ps[ind[0]-1].name;
                var p2 = ps[ind[1]-1].name;
                var table = basePairing.suggestTableFor(state.rounds, tables, p1, p2);
                tables = _.without(tables, table);
                return game.create(table, p1, p2);
              })
              .value();
        },
        suggestNextSingleRound: function(state) {
          var n_games = state.players.length/2;
          var tables = _.range(1, n_games+1);
          var nb_bracket_rounds = state.rounds.length - state.bracket;
          return _.chain(state.rounds)
            .last()
            .chunk(n_games / (1 << nb_bracket_rounds-1))
            .reduce(function(mem, r) {
              var winners = _.chain(r)
                .apply(round.winners)
                .value();
              var losers = _.chain(r)
                .apply(round.losers)
                .value();
              var pairs = _.chain(winners)
                .cat(losers)
                .chunk(2)
                .value();
              return  _.cat(mem, _.map(pairs, function(p) {
                var table = basePairing.suggestTableFor(state.rounds,
                                                        tables,
                                                        p[0], p[1]);
                tables = _.without(tables, table);
                return game.create(table, p[0], p[1]);
              }));
            }, [])
            .value();
        },
        suggestFirstTeamRound: function(state) {
          var n_games = state.teams.length/2;
          var tables = _.range(1, n_games+1);
          var nb_games = teams.teamSize(state.teams,
                                        state.players);
          var ts = teams.sort(state.teams, state);
          return _.chain(state.teams.length)
              .apply(bracketPairing.indices)
              .map(function(ind) {
                var t1 = ts[ind[0]-1].name;
                var t2 = ts[ind[1]-1].name;
                var table = basePairing.suggestTableForTeam(state.rounds,
                                                            tables,
                                                            t1, t2);
                tables = _.without(tables, table);
                return team_game.create(table, t1, t2, nb_games);
              })
              .value();
        },
        suggestNextTeamRound: function(state) {
          var n_games = state.teams.length/2;
          var tables = _.range(1, n_games+1);
          var nb_games = teams.teamSize(state.teams,
                                        state.players);
          var nb_bracket_rounds = state.rounds.length - state.bracket;
          return _.chain(state.rounds)
            .last()
            .chunk(n_games / (1 << nb_bracket_rounds-1))
            .reduce(function(mem, r) {
              var winners = _.chain(r)
                .apply(round.winnerTeams)
                .value();
              var losers = _.chain(r)
                .apply(round.loserTeams)
                .value();
              var pairs = _.chain(winners)
                .cat(losers)
                .chunk(2)
                .value();
              return  _.cat(mem, _.map(pairs, function(p) {
                var table = basePairing.suggestTableForTeam(state.rounds,
                                                            tables,
                                                            p[0], p[1]);
                tables = _.without(tables, table);
                return team_game.create(table, p[0], p[1], nb_games);
              }));
            }, [])
            .value();
        },
        suggestFirstRound: function(state) {
          if(state.teams.length === 0) {
            return bracketPairing.suggestFirstSingleRound(state);
          }
          else {
            return bracketPairing.suggestFirstTeamRound(state);
          }
        },
        suggestNextRound: function(state) {
          if(state.teams.length === 0) {
            return bracketPairing.suggestNextSingleRound(state);
          }
          else {
            return bracketPairing.suggestNextTeamRound(state);
          }
        },
        suggestRound: function(state, bracket) {
          var last_round = state.rounds.length;
          if(bracket === last_round) {
            return bracketPairing.suggestFirstRound(state);
          }
          else {
            return bracketPairing.suggestNextRound(state);
          }
        }
      };
      return bracketPairing;
    }
  ])
  .factory('srPairing', [
    'basePairing',
    'rounds',
    'players',
    'teams',
    'game',
    'team_game',
    function(basePairing,
             rounds,
             players,
             teams,
             game,
             team_game) {
      var srPairing = {
        suggestOpponentFor: function(rs, available_players, p1) {
          var available_player_names = _.chain(available_players)
              .groupBy(function(p) { return p.points.tournament; })
              .map(function(g) {
                var other_cities = _.filter(g, function(p) { return p.city !== p1.city; });
                var same_city = _.filter(g, function(p) { return p.city === p1.city; });
                return _.cat(same_city, other_cities);
              })
              .flatten()
              .reverse()
              .apply(players.names)
              .value();
          var opp_names = rounds.opponentsFor(rs, p1.name);
          var candidates = _.difference(available_player_names, opp_names);
          return (candidates.length === 0 ?
                  players.player(available_players, available_player_names[0]) :
                  players.player(available_players, candidates[0]));
        },
        suggestNextSingleRound: function(state) {
          var n_games = state.players.length/2;
          var tables = _.range(1, n_games+1);
          var sorted_players = _.chain(state.players)
            .groupBy(function(p) { return p.points.tournament; })
            .each(function(g, key, c) {
              c[key] = _.shuffle(g);
            })
            .flatten()
            .reverse()
            .value();
          return _.chain(_.range(n_games))
            .map(function(i) {
              var p1 = _.first(sorted_players);
              sorted_players = _.rest(sorted_players);

              var p2 = srPairing.suggestOpponentFor(state.rounds,
                                                    sorted_players,
                                                    p1);
              sorted_players = _.without(sorted_players, p2);

              var table = basePairing.suggestTableFor(state.rounds,
                                                      tables,
                                                      p1.name, p2.name);
              tables = _.without(tables, table);

              return game.create(table, p1.name, p2.name);
            })
            .sortBy(_.property('table'))
            .value();
        },
        suggestOpponentForTeam: function(rs, available_teams, t1) {
          var available_team_names = _.chain(available_teams)
              .groupBy(function(t) { return t.points.team_tournament; })
              .map(function(g) {
                var other_cities = _.filter(g, function(t) { return t.city !== t1.city; });
                var same_city = _.filter(g, function(t) { return t.city === t1.city; });
                return _.cat(same_city, other_cities);
              })
              .flatten()
              .reverse()
              .apply(teams.names)
              .value();
          var opp_names = rounds.opponentsForTeam(rs, t1.name);
          var candidates = _.difference(available_team_names, opp_names);
          return (candidates.length === 0 ?
                  teams.team(available_teams, available_team_names[0]) :
                  teams.team(available_teams, candidates[0]));
        },
        suggestNextTeamRound: function(state) {
          var n_games = state.teams.length/2;
          var tables = _.range(1, n_games+1);
          var nb_games = teams.teamSize(state.teams,
                                        state.players);
          var sorted_teams = _.chain(state.teams)
            .groupBy(function(t) { return t.points.team_tournament; })
            .each(function(g, key, c) {
              c[key] = _.shuffle(g);
            })
            .flatten()
            .reverse()
            .value();
          return _.chain(_.range(n_games))
            .map(function(i) {
              var t1 = _.first(sorted_teams);
              sorted_teams = _.rest(sorted_teams);

              var t2 = srPairing.suggestOpponentForTeam(state.rounds,
                                                        sorted_teams,
                                                        t1);
              sorted_teams = _.without(sorted_teams, t2);

              var table = basePairing.suggestTableForTeam(state.rounds,
                                                          tables,
                                                          t1.name, t2.name);
              tables = _.without(tables, table);

              return team_game.create(table, t1.name, t2.name, nb_games);
            })
            .sortBy(_.property('table'))
            .value();
        },
        suggestRound: function(state) {
          if(state.teams.length === 0) {
            return srPairing.suggestNextSingleRound(state);
          }
          else {
            return srPairing.suggestNextTeamRound(state);
          }
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
        suggestRound: function(state, bracket) {
          if(_.exists(bracket)) {
            return bracketPairing.suggestRound(state, bracket);
          }
          else {
            return srPairing.suggestRound(state);
          }
        }
      };
      return pairing;
    }
  ]);
