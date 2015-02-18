'use strict';

angular.module('srApp.services')
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
    'games',
    // 'team_game',
    function(round,
             game,
             games) {
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
            // .without(undefined, null)
            .apply(games.pointsForPlayer, p, bracket_start, base_weight)
            .value();
        },
        gamesForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .without(undefined)
            .value();
        },
        opponentsForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .without(undefined)
            .apply(games.opponentsForPlayer, p)
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
            .apply(games.listsForPlayer, p)
            .value();
        },
        tablesForPlayer: function(coll, p) {
          return _.chain(coll)
            .mapWith(round.gameForPlayer, p)
            .apply(games.tablesForPlayer, p)
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
