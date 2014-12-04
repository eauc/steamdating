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
              list: null,
              tournament: null,
              control: null,
              army: null
            },
            p2: {
              name: p2_name,
              list: null,
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
        listFor: function(g, p) {
          return _.chain(g)
            .apply(game.player, p)
            .getPath('list')
            .value();
        },
        tableFor: _.partial(_.getPath, _, 'table')
      };
      return game;
    }
  ])
  .factory('team_game', [
    'game',
    function(game) {
      var team_game = {
        create: function(table, t1_name, t2_name, nb_players) {
          return {
            table: table,
            t1: {
              name: t1_name,
              team_tournament: null,
              tournament: null,
              control: null,
              army: null
            },
            t2: {
              name: t2_name,
              team_tournament: null,
              tournament: null,
              control: null,
              army: null
            },
            games: _.chain(nb_players)
              .range()
              .map(function(i) {
                return game.create(table);
              })
              .value()
          };
        },
        team: function(g, t) {
          var t1_name = _.getPath(g, 't1.name');
          return t1_name === t ? _.getPath(g, 't1') : _.getPath(g, 't2');
        },
        opponentForTeam: function(g, t) {
          var t1_name = _.getPath(g, 't1.name');
          return t1_name === t ? _.getPath(g, 't2.name') : t1_name;
        },
        successForTeam: function(g, t) {
          return _.chain(g)
            .apply(team_game.team, t)
            .getPath('team_tournament')
            .value();
        },
        tableForTeam: _.partial(_.getPath, _, 'table'),
        refreshPoints: function(tg) {
          var points = _.chain(tg.games)
            .reduce(function(mem, g) {
              return {
                t1: {
                  tournament: mem.t1.tournament + (g.p1.tournament || 0),
                  control: mem.t1.control + (g.p1.control || 0),
                  army: mem.t1.army + (g.p1.army || 0)
                },
                t2: {
                  tournament: mem.t2.tournament + (g.p2.tournament || 0),
                  control: mem.t2.control + (g.p2.control || 0),
                  army: mem.t2.army + (g.p2.army || 0)
                }
              };
            }, {
              t1: {
                tournament: 0,
                control: 0,
                army: 0
              },
              t2: {
                tournament: 0,
                control: 0,
                army: 0
              }
            })
            .value();
          _.extend(tg.t1, points.t1);
          _.extend(tg.t2, points.t2);
          tg.t1.team_tournament = tg.t1.tournament > tg.t2.tournament ?
            1 : tg.t1.tournament < tg.t2.tournament ? 0 : null;
          tg.t2.team_tournament = tg.t2.tournament > tg.t1.tournament ?
            1 : tg.t2.tournament < tg.t1.tournament ? 0 : null;
        }
      };
      return team_game;
    }
  ])
  .factory('round', [
    'game',
    function(game) {
      var round = {
        gameFor: function(coll, p) {
          if(!_.isArray(coll) ||
             coll.length === 0) return [];
          if(_.exists(coll[0].games)) {
            return _.chain(coll)
              // .tap(function(c) { console.log('start', c); })
              .map(function(g) { return _.getPath(g, 'games'); })
              // .tap(function(c) { console.log(c); })
              .map(function(games) {
                return _.find(games, function(g) {
                  return g.p1.name === p || g.p2.name === p;
                });
              })
              // .tap(function(c) { console.log(c); })
              .without(undefined)
              // .tap(function(c) { console.log(c); })
              .first()
              // .tap(function(c) { console.log(c); })
              .value();
          }
          else {
            return _.find(coll, function(g) {
              return g.p1.name === p || g.p2.name === p;
            });
          }
        },
        gameForTeam: function(coll, t) {
          return _.find(coll, function(g) {
            return g.t1.name === t || g.t2.name === t;
          });
        }
      };
      return round;
    }
  ])
  .factory('rounds', [
    'game',
    'team_game',
    'round',
    function(game,
             team_game,
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
            .without(undefined)
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
        pointsForTeam: function(coll, t) {
          return _.chain(coll)
            .mapWith(round.gameForTeam, t)
            .without(undefined)
            .mapWith(team_game.team, t)
            .reduce(function(mem, r) {
              return {
                team_tournament: mem.team_tournament + r.team_tournament,
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army
              };
            }, {
              team_tournament: 0,
              tournament: 0,
              control: 0,
              army: 0
            })
            .value();
        },
        opponentsFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .without(undefined)
            .mapWith(game.opponentFor, p)
            .without(undefined)
            .value();
        },
        opponentsForTeam: function(coll, t) {
          return _.chain(coll)
            .mapWith(round.gameForTeam, t)
            .without(undefined)
            .mapWith(team_game.opponentForTeam, t)
            .without(undefined)
            .value();
        },
        tablesFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .mapWith(game.tableFor, p)
            .value();
        },
        listsFor: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .mapWith(game.listFor, p)
            .uniq()
            .without(undefined, null)
            .value();
        },
        tablesForTeam: function(coll, t) {
          return _.chain(coll)
            // .tap(function(c) { console.log('start', c); })
            .mapWith(round.gameForTeam, t)
            // .tap(function(c) { console.log(c); })
            .mapWith(team_game.tableForTeam, t)
            // .tap(function(c) { console.log(c); })
            .value();
        },
        gameFor: function(coll, p, r) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameFor, p)
            .value();
        },
        gameForTeam: function(coll, t, r) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameForTeam, t)
            .value();
        },
        query: function(coll, r, p, q) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameFor, p)
            .apply(game[q], p)
            .value();
        },
        teamQuery: function(coll, r, t, q) {
          return _.chain(coll)
            .apply(rounds.round, r)
            .apply(round.gameForTeam, t)
            .apply(team_game[q], t)
            .value();
        }
      };
      return rounds;
    }
  ]);
