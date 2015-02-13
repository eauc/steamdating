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
  .factory('round', [
    'game',
    // 'team_game',
    function(game) {
      var round = {
        gameForPlayer: function(coll, p) {
          if(!_.isArray(coll) ||
             coll.length === 0) return;

          return _.chain(coll)
            .map(_.partial(game.forPlayer, _, p))
            .without(undefined)
            .first()
            .value();
        },
        gamesForGroup: function(coll, ps, i) {
          var start_index = Math.ceil(_.chain(ps)
                                      .slice(0, i)
                                      .flatten()
                                      .value()
                                      .length / 2);
          var end_index = Math.ceil(start_index +
                                    ps[i].length / 2);
          return _.chain(coll)
            .slice(start_index, end_index)
            .value();
        },
        pairedPlayers: function(coll) {
          return _.chain(coll)
            .flatten()
            .map(function(ga) {
              return [ ga.p1.name, ga.p2.name ];
            })
            .flatten()
            .uniq()
            .without(null, undefined)
            .value();
        },
        isPlayerPaired: function(coll, player) {
          return (0 <= _.chain(coll)
                  .apply(round.pairedPlayers)
                  .indexOf(player.name)
                  .value());
        },
        updatePlayer: function(coll, index, key) {
          var name = coll[index][key].name;
          return _.chain(coll)
            .map(function(ga, i) {
              if(i === index && key === 'p1') return ga;
              if(ga.p1.name === name) {
                var new_ga = _.snapshot(ga);
                new_ga.p1.name = null;
                return new_ga;
              }
              return ga;
            })
            .map(function(ga, i) {
              if(i === index && key === 'p2') return ga;
              if(ga.p2.name === name) {
                var new_ga = _.snapshot(ga);
                new_ga.p2.name = null;
                return new_ga;
              }
              return ga;
            })
            .value();
        },
        // gameForTeam: function(coll, t) {
        //   return _.find(coll, function(g) {
        //     return g.t1.name === t || g.t2.name === t;
        //   });
        // },
        // gameForTeam: function(coll, t) {
        //   return _.find(coll, function(g) {
        //     return g.t1.name === t || g.t2.name === t;
        //   });
        // },
        winners: function(coll) {
          return _.map(coll, game.winner);
        },
        losers: function(coll) {
          return _.map(coll, game.loser);
        },
        // winnerTeams: function(coll) {
        //   return _.map(coll, team_game.winner);
        // },
        // loserTeams: function(coll) {
        //   return _.map(coll, team_game.loser);
        // }
      };
      return round;
    }
  ])
  .factory('rounds', [
    'round',
    'game',
    // 'team_game',
    function(round,
             game) {
      var rounds = {
        // round: function(coll, r) {
        //   if(r >= coll.length) return [];
        //   return coll[r];
        // },
        createNextRound: function(players) {
          var table = 1;
          return _.map(players, function(group) {
            return _.chain(group.length/2)
              .range()
              .map(function() {
                return game.create(table++);
              })
              .value();
          });
        },
        registerNextRound: function(coll, next) {
          return _.cat(coll, [_.flatten(next)]);
        },
        drop: function(coll, r) {
          var new_coll = coll.slice();
          new_coll.splice(r, 1);
          return new_coll;
        },
        pointsForPlayer: function(coll, p, bracket_start, base_weight) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .map(function(g) {
              if(!_.exists(g)) {
                return { p1: { name: p, tournament: 0, control: 0, army: 0 } };
              }
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
            .mapWith(round.gameForPlayer, p)
            .without(undefined)
            .mapWith(game.opponentForPlayer, p)
            .without(undefined)
            .value();
        },
        pairAlreadyExists: function(coll, g) {
          if(!_.exists(_.getPath(g, 'p1.name')) ||
             !_.exists(_.getPath(g, 'p2.name'))) return false;
          // console.log(g);
          return (_.chain(coll)
                  .apply(rounds.opponentsForPlayer, g.p1.name)
                  // .spy('opps')
                  .indexOf(g.p2.name)
                  // .spy('index')
                  .value() >= 0);
        },
        listsForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .mapWith(game.listForPlayer, p)
            .uniq()
            .without(undefined, null)
            .value();
        },
        tablesForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .mapWith(game.tableForPlayer, p)
            .without(undefined, null)
            .value();
        },
        // pointsForTeam: function(coll, t, bracket_start, base_weight) {
        //   return _.chain(coll)
        //     .mapWith(round.gameForTeam, t)
        //     .without(undefined)
        //     .mapWith(team_game.team, t)
        //     .reduce(function(mem, r, i) {
        //       var bracket_weight = base_weight >> (i - bracket_start);
        //       return {
        //         bracket: ((_.exists(bracket_start) && i >= bracket_start) ?
        //                   mem.bracket + bracket_weight * r.team_tournament :
        //                   mem.bracket),
        //         team_tournament: mem.team_tournament + r.team_tournament,
        //         tournament: mem.tournament + r.tournament,
        //         control: mem.control + r.control,
        //         army: mem.army + r.army
        //       };
        //     }, {
        //       bracket: 0,
        //       team_tournament: 0,
        //       tournament: 0,
        //       control: 0,
        //       army: 0
        //     })
        //     .spy('pointsForTeam', t)
        //     .value();
        // },
        // opponentsForTeam: function(coll, t) {
        //   return _.chain(coll)
        //     .mapWith(round.gameForTeam, t)
        //     .without(undefined)
        //     .mapWith(team_game.opponentForTeam, t)
        //     .without(undefined)
        //     .value();
        // },
        // tablesForTeam: function(coll, t) {
        //   return _.chain(coll)
        //     .mapWith(round.gameForTeam, t)
        //     .mapWith(team_game.tableForTeam, t)
        //     .value();
        // },
        // gameFor: function(coll, p, r) {
        //   return _.chain(coll)
        //     .apply(rounds.round, r)
        //     .apply(round.gameFor, p)
        //     .value();
        // },
        // gameForTeam: function(coll, t, r) {
        //   return _.chain(coll)
        //     .apply(rounds.round, r)
        //     .apply(round.gameForTeam, t)
        //     .value();
        // },
        // query: function(coll, r, p, q) {
        //   return _.chain(coll)
        //     .apply(rounds.round, r)
        //     .apply(round.gameFor, p)
        //     .apply(game[q], p)
        //     .value();
        // },
        // teamQuery: function(coll, r, t, q) {
        //   return _.chain(coll)
        //     .apply(rounds.round, r)
        //     .apply(round.gameForTeam, t)
        //     .apply(team_game[q], t)
        //     .value();
        // }
      };
      return rounds;
    }
  ]);
