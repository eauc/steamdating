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
            },
            games: []
          };
        },
        forPlayer: function(g, p) {
          if(p === g.p1.name ||
             p === g.p2.name) return g;
          if(0 === g.games.length) return;
          return _.chain(g.games)
            .filter(_.partial(game.forPlayer, _, p))
            .first()
            .value();
        },
        player: function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p1') : _.getPath(g, 'p2');
        },
        opponentForPlayer: function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p2.name') : p1_name;
        },
        winForPlayer: function(g, p) {
          var tp = _.chain(g)
            .apply(game.player, p)
            .getPath('tournament')
            .value();
          return (tp === 1 ? true :
                  (tp === 0 ? false : undefined));
        },
        listForPlayer: function(g, p) {
          return _.chain(g)
            .apply(game.player, p)
            .getPath('list')
            .value();
        },
        tableForPlayer: _.partial(_.getPath, _, 'table'),
        isValid: function(g) {
          return (_.isString(g.p1.name) &&
                  _.isString(g.p2.name));
        },
        winner: function(g) {
          return (g.p1.tournament === 1 ? g.p1.name :
                  g.p2.tournament === 1 ? g.p2.name :
                  undefined);
        },
        loser: function(g) {
          return _.chain(g)
            .apply(game.winner)
            .apply(function(w) {
              return _.exists(w) ? game.opponentForPlayer(g, w) : undefined;
            })
            .value();
        }
      };
      return game;
    }
  ])
  // .factory('team_game', [
  //   'game',
  //   function(game) {
  //     var team_game = {
  //       create: function(table, t1_name, t2_name, nb_players) {
  //         return {
  //           table: table,
  //           t1: {
  //             name: t1_name,
  //             team_tournament: null,
  //             tournament: null,
  //             control: null,
  //             army: null
  //           },
  //           t2: {
  //             name: t2_name,
  //             team_tournament: null,
  //             tournament: null,
  //             control: null,
  //             army: null
  //           },
  //           games: _.chain(nb_players)
  //             .range()
  //             .map(function(i) {
  //               return game.create(table);
  //             })
  //             .value()
  //         };
  //       },
  //       team: function(g, t) {
  //         var t1_name = _.getPath(g, 't1.name');
  //         return t1_name === t ? _.getPath(g, 't1') : _.getPath(g, 't2');
  //       },
  //       opponentForTeam: function(g, t) {
  //         var t1_name = _.getPath(g, 't1.name');
  //         return t1_name === t ? _.getPath(g, 't2.name') : t1_name;
  //       },
  //       successForTeam: function(g, t) {
  //         return _.chain(g)
  //           .apply(team_game.team, t)
  //           .getPath('team_tournament')
  //           .value();
  //       },
  //       tableForTeam: _.partial(_.getPath, _, 'table'),
  //       winner: function(g) {
  //         return (g.t1.team_tournament === 1 ? g.t1.name :
  //                 g.t2.team_tournament === 1 ? g.t2.name :
  //                 undefined);
  //       },
  //       loser: function(g) {
  //         return _.chain(g)
  //           .apply(team_game.winner)
  //           .apply(function(w) { return team_game.opponentForTeam(g, w); })
  //           .value();
  //       },
  //       refreshPoints: function(tg) {
  //         var points = _.chain(tg.games)
  //           .reduce(function(mem, g) {
  //             return {
  //               t1: {
  //                 tournament: mem.t1.tournament + (g.p1.tournament || 0),
  //                 control: mem.t1.control + (g.p1.control || 0),
  //                 army: mem.t1.army + (g.p1.army || 0)
  //               },
  //               t2: {
  //                 tournament: mem.t2.tournament + (g.p2.tournament || 0),
  //                 control: mem.t2.control + (g.p2.control || 0),
  //                 army: mem.t2.army + (g.p2.army || 0)
  //               }
  //             };
  //           }, {
  //             t1: {
  //               tournament: 0,
  //               control: 0,
  //               army: 0
  //             },
  //             t2: {
  //               tournament: 0,
   //               control: 0,
  //               army: 0
  //             }
  //           })
  //           .value();
  //         _.extend(tg.t1, points.t1);
  //         _.extend(tg.t2, points.t2);
  //         tg.t1.team_tournament = tg.t1.tournament > tg.t2.tournament ?
  //           1 : tg.t1.tournament < tg.t2.tournament ? 0 : null;
  //         tg.t2.team_tournament = tg.t2.tournament > tg.t1.tournament ?
  //           1 : tg.t2.tournament < tg.t1.tournament ? 0 : null;
  //       }
  //     };
  //     return team_game;
  //   }
  // ])
  .factory('games', [
    'game',
    function(game) {
      var games = {
        pointsForPlayer: function(gs, p, bracket_start, base_weight) {
          return _.chain(gs)
            .mapWith(game.player, p)
            .apply(games.reducePoints, bracket_start, base_weight)
            .value();
        },
        pointsAgainstPlayer: function(gs, p, bracket_start, base_weight) {
          return _.chain(gs)
            .map(function(g) { return game.player(g, game.opponentForPlayer(g, p)); })
            .apply(games.reducePoints, bracket_start, base_weight)
            .value();
        },
        reducePoints: function(gs, bracket_start, base_weight) {
          return _.chain(gs)
            .reduce(function(mem, r, i) {
              var bracket_weight = base_weight >> (i - bracket_start);
              return {
                bracket: ((_.exists(bracket_start) && i >= bracket_start) ?
                          mem.bracket + bracket_weight * r.tournament :
                          mem.bracket),
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army,
                sos: 0
              };
            }, {
              bracket: 0,
              tournament: 0,
              control: 0,
              army: 0,
              sos: 0
            })
            .value();
        },
        opponentsForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(game.opponentForPlayer, p)
            .without(undefined)
            .value();
        },
        listsForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(game.listForPlayer, p)
            .uniq()
            .without(undefined, null)
            .value();
        },
        tablesForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(game.tableForPlayer, p)
            .without(undefined, null)
            .value();
        },
        forCaster: function(coll, p, c) {
          return _.filter(coll, function(g) {
            return _.chain(g)
              .apply(game.player, p)
              .getPath('list')
              .value() === c;
          });
        },
      };
      return games;
    }
  ]);
