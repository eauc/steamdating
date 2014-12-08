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
        tableFor: _.partial(_.getPath, _, 'table'),
        winner: function(g) {
          return (g.p1.tournament === 1 ? g.p1.name :
                  g.p2.tournament === 1 ? g.p2.name :
                  undefined);
        },
        loser: function(g) {
          return _.chain(g)
            .apply(game.winner)
            .apply(function(w) { return game.opponentFor(g, w); })
            .value();
        }
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
        winner: function(g) {
          return (g.t1.team_tournament === 1 ? g.t1.name :
                  g.t2.team_tournament === 1 ? g.t2.name :
                  undefined);
        },
        loser: function(g) {
          return _.chain(g)
            .apply(team_game.winner)
            .apply(function(w) { return team_game.opponentForTeam(g, w); })
            .value();
        },
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
    'team_game',
    function(game,
             team_game) {
      var round = {
        gameFor: function(coll, p) {
          if(!_.isArray(coll) ||
             coll.length === 0) return [];
          if(_.exists(coll[0].games)) {
            return _.chain(coll)
              .map(function(g) { return _.getPath(g, 'games'); })
              .map(function(games) {
                return _.find(games, function(g) {
                  return g.p1.name === p || g.p2.name === p;
                });
              })
              .without(undefined)
              .first()
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
        },
        winners: function(coll) {
          return _.map(coll, game.winner);
        },
        losers: function(coll) {
          return _.map(coll, game.loser);
        },
        winnerTeams: function(coll) {
          return _.map(coll, team_game.winner);
        },
        loserTeams: function(coll) {
          return _.map(coll, team_game.loser);
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
        pointsFor: function(coll, p, bracket_start, base_weight) {
          return _.chain(coll)
            .mapWith(round.gameFor, p)
            .map(function(g) {
              if(!_.exists(g)) return game.create(0, p);
              return g;
            })
            .mapWith(game.player, p)
            .reduce(function(mem, r, i) {
              var bracket_weight = base_weight >> (i - bracket_start);
              return {
                bracket: ((_.exists(bracket_start) && i >= bracket_start) ?
                          mem.bracket + bracket_weight * r.tournament :
                          mem.bracket),
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army
              };
            }, {
              bracket: 0,
              tournament: 0,
              control: 0,
              army: 0
            })
            .spy('pointsFor', p)
            .value();
        },
        pointsForTeam: function(coll, t, bracket_start, base_weight) {
          return _.chain(coll)
            .mapWith(round.gameForTeam, t)
            .without(undefined)
            .mapWith(team_game.team, t)
            .reduce(function(mem, r, i) {
              var bracket_weight = base_weight >> (i - bracket_start);
              return {
                bracket: ((_.exists(bracket_start) && i >= bracket_start) ?
                          mem.bracket + bracket_weight * r.team_tournament :
                          mem.bracket),
                team_tournament: mem.team_tournament + r.team_tournament,
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army
              };
            }, {
              bracket: 0,
              team_tournament: 0,
              tournament: 0,
              control: 0,
              army: 0
            })
            .spy('pointsForTeam', t)
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
            .mapWith(round.gameForTeam, t)
            .mapWith(team_game.tableForTeam, t)
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
