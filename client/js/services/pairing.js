'use strict';

angular.module('srApp.services')
  .factory('pairing', [
    'game',
    'team_game',
    'rounds',
    'players',
    'teams',
    function(game,
             team_game,
             rounds,
             players,
             teams) {
      var pairing = {
        suggestOpponentFor: function(rs, available_players, p) {
          var opps = rounds.opponentsFor(rs, p);
          var candidates = _.difference(available_players, opps);
          return candidates.length === 0 ? available_players[0] : candidates[0];
        },
        suggestTableFor: function(rs, available_tables, p1, p2) {
          var p1_tables = rounds.tablesFor(rs, p1);
          var p2_tables = rounds.tablesFor(rs, p2);
          var possible_tables = _.difference(available_tables, p1_tables, p2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        },
        suggestNextSingleRound: function(state) {
          var round = [];
          var sorted_player_names = _.chain(state.players)
            .groupBy(function(p) { return p.points.tournament; })
            .each(function(g, key, c) {
              c[key] = _.shuffle(g);
            })
            .reduce(function(mem, g) {
                return _.cat(mem, g);
            }, [])
            .apply(players.names)
            .reverse()
            .value();
          var n_games = sorted_player_names.length/2;
          var tables = _.range(1, n_games+1);
          return _.chain(_.range(n_games))
            .map(function(i) {
              var p1 = sorted_player_names[0];
              sorted_player_names = _.rest(sorted_player_names);

              var p2 = pairing.suggestOpponentFor(state.rounds,
                                                  sorted_player_names,
                                                  p1);
              sorted_player_names = _.without(sorted_player_names, p2);

              var table = pairing.suggestTableFor(state.rounds,
                                                  tables, p1, p2);
              tables = _.without(tables, table);

              return game.create(table, p1, p2);
            })
            .sortBy(_.property('table'))
            .value();
        },
        suggestOpponentForTeam: function(rs, available_teams, t) {
          var opps = rounds.opponentsForTeam(rs, t);
          var candidates = _.difference(available_teams, opps);
          return candidates.length === 0 ? available_teams[0] : candidates[0];
        },
        suggestTableForTeam: function(rs, available_tables, t1, t2) {
          var t1_tables = rounds.tablesForTeam(rs, t1);
          var t2_tables = rounds.tablesForTeam(rs, t2);
          var possible_tables = _.difference(available_tables, t1_tables, t2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        },
        suggestNextTeamRound: function(state) {
          var round = [];
          var nb_games = teams.teamSize(state.teams,
                                        state.players);
          var sorted_team_names = _.chain(state.teams)
            .groupBy(function(t) { return t.points.team_tournament; })
            .each(function(g, key, c) {
              c[key] = _.shuffle(g);
            })
            .reduce(function(mem, g) {
                return _.cat(mem, g);
            }, [])
            .apply(teams.names)
            .reverse()
            .value();
          var n_games = sorted_team_names.length/2;
          var tables = _.range(1, n_games+1);
          return _.chain(_.range(n_games))
            .map(function(i) {
              var t1 = sorted_team_names[0];
              sorted_team_names = _.rest(sorted_team_names);

              var t2 = pairing.suggestOpponentForTeam(state.rounds, sorted_team_names, t1);
              sorted_team_names = _.without(sorted_team_names, t2);

              var table = pairing.suggestTableForTeam(state.rounds, tables, t1, t2);
              tables = _.without(tables, table);

              return team_game.create(table, t1, t2, n_games);
            })
            .sortBy(_.property('table'))
            .value();
        },
        suggestNextRound: function(state) {
          if(state.teams.length > 0) {
            return pairing.suggestNextTeamRound(state);
          }
          else {
            return pairing.suggestNextSingleRound(state);
          }
        }
      };
      return pairing;
    }
  ]);
