'use strict';

angular.module('srApp.services')
  .factory('game', [
    function() {
      var game = {
        create: function(table, p1_name, p2_name) {
          return {
            table: table,
            p1: {
              name: p1_name,
              tournament: null,
              control: null,
              army: null
            },
            p2: {
              name: p2_name,
              tournament: null,
              control: null,
              army: null
            }
          };
        },
        player: function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p1') : _.getPath(g, 'p2');
        },
        opponentFor: function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p2.name') : p1_name;
        },
        successFor: function(g, p) {
          return _.chain(g)
            .apply(game.player, p)
            .getPath('tournament')
            .value();
        },
        tableFor: _.partial(_.getPath, _, 'table')
      };
      return game;
    }
  ])
  .factory('round', [
    'game',
    function(game) {
      var round = {
        gameFor: function(coll, p) {
          return _.find(coll, function(g) {
            return g.p1.name === p || g.p2.name === p;
          });
        }
      };
      return round;
    }
  ])
  .factory('rounds', [
    'game',
    'round',
    function(game,
             round) {
      var rounds = {
        round: function(coll, r) {
          if(r >= coll.length) return [];
          return coll[r];
        },
        drop: function(coll, r) {
          var new_coll = coll.slice();
          new_coll.splice(r, 1);
          return new_coll;
        },
        pointsFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .mapWith(game.player, p)
            .reduce(function(mem, r) {
              return {
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army
              };
            }, {
              tournament: 0,
              control: 0,
              army: 0
            })
            .value();
        },
        opponentsFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .mapWith(game.opponentFor, p)
            .value();
        },
        tablesFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .mapWith(game.tableFor, p)
            .value();
        },
        gameFor: function(coll, p, r) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameFor, p)
            .value();
        },
        query: function(coll, r, p, q) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameFor, p)
            .apply(game[q], p)
            .value();
        },
        suggestOpponentFor: function(coll, available_players, p) {
          var opps = rounds.opponentsFor(coll, p);
          var candidates = _.difference(available_players, opps);
          return candidates.length === 0 ? available_players[0] : candidates[0];
        },
        suggestTableFor: function(coll, available_tables, p1, p2) {
          var p1_tables = rounds.tablesFor(coll, p1);
          var p2_tables = rounds.tablesFor(coll, p2);
          var possible_tables = _.difference(available_tables, p1_tables, p2_tables);
          return possible_tables.length === 0 ? available_tables[0] : possible_tables[0];
        },
        suggestNextRound: function(coll, sorted_player_names) {
          var round = [];
          var n_games = sorted_player_names.length/2;
          var players = sorted_player_names.slice();
          var tables = _.range(1, n_games+1);
          return _.chain(_.range(n_games))
            .map(function(i) {
              var p1 = players[0];
              players = _.rest(players);

              var p2 = rounds.suggestOpponentFor(coll, players, p1);
              players = _.without(players, p2);

              var table = rounds.suggestTableFor(coll, tables, p1, p2);
              tables = _.without(tables, table);

              return game.create(table, p1, p2);
            })
            .sortBy(_.property('table'))
            .value();
        }
      };
      return rounds;
    }
  ]);
