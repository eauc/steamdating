'use strict';

angular.module('srApp.services')
  .factory('player', [
    'rounds',
    'lists',
    function(rounds,
             lists) {
      return {
        is: function(p, name) {
          return p.name === name;
        },
        // inTeam: function(p, team) {
        //   return p.team === team;
        // },
        rank: function(p, critFn) {
          var rank;
          try {
            rank = critFn(p.points.tournament,
                          p.points.sos,
                          p.points.control,
                          p.points.army);
          }
          catch(e) {
            return "Error : " + e.message;
          }
          return rank;
        },
        create: function playerCreate(name, faction, city, team) {
          return {
            name: name,
            faction: faction,
            city: city,
            team: team,
            lists: [],
            lists_played: [],
            points: {
              tournament: 0,
              sos: 0,
              control: 0,
              army: 0
            }
          };
        },
        updateListsPlayed: function(p, rs) {
          return _.chain(p)
            .clone()
            .apply(function(p) {
              p.lists_played = rounds.listsForPlayer(rs, p.name);
              return p;
            })
            .value();
        },
        allListsHaveBeenPlayed: function(p) {
          return _.chain(p.lists)
            .apply(lists.casters)
            .difference(p.lists_played)
            .value().length === 0;
        },
        updatePoints: function(p, rs) {
          return _.chain(p)
            .clone()
            .apply(function(p) {
              p.points = rounds.pointsForPlayer(rs, p.name);
              return p;
            })
            .value();
        }
      };
    }
  ])
  .factory('players', [
    'player',
    'factions',
    'round',
    'rounds',
    'ranking',
    function(player,
             factions,
             round,
             rounds,
             ranking) {
      var players = {
        add: function playersAdd(coll, p, i) {
          coll[i] = _.cat(coll[i], p);
          return coll;
        },
        drop: function(coll, p) {
          return _.chain(coll)
            .mapWith(_.reject, _.partial(player.is, _, p.name))
            .reject(_.isEmpty)
            .value();
        },
        player: function(coll, name) {
          return _.chain(coll)
            .flatten()
            .find(_.partial(player.is, _, name))
            .value();
        },
        names: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'name')
            .value();
        },
        factions: function(coll, base_factions) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'faction')
            .cat(_.keys(base_factions))
            .uniq()
            .without(undefined)
            .value();
        },
        cities: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapWith(_.getPath, 'city')
            .uniq()
            .without(undefined)
            .value();
        },
        updateListsPlayed: function(coll, rs) {
          return _.chain(coll)
            .map(function(g) {
                return _.mapWith(g, player.updateListsPlayed, rs);
            })
            .value();
        },
        updatePoints: function(coll, rs) {
          var temp = _.chain(coll)
            .map(function(g) {
                return _.mapWith(g, player.updatePoints, rs);
            })
            .value();
          return _.chain(temp)
            .map(function(g) {
              return _.map(g, function(p) {
                var opponents = rounds.opponentsForPlayer(rs, p.name);
                p.points.sos = players.sosFromPlayers(temp, opponents);
                return p;
              });
            })
            .value();
        },
        sortGroup: function(coll, state) {
          // if(_.exists(state.bracket[i])) {
          //   return _.sortBy(coll.slice(), function(p) {
          //     return -p.points.bracket;
          //   });
          // }
          // else {
          var critFn = ranking.buildPlayerCritFunction(state.ranking.player,
                                                       state.rounds.length,
                                                       coll.length);
          if(!_.isFunction(critFn)) {
            console.error('Error create ranking function', critFn);
            return coll;
          }
          var by_rank;
          var rank = 0;
          return _.chain(coll)
          // group players by rank criterion
            .groupBy(_.partial(player.rank, _, critFn))
          // store grouped players for later
            .apply(function(g) {
              by_rank = g;
              return g;
            })
          // get list of rank and order it decrementally
            .keys()
            .sortBy(function(r) { return -parseFloat(r); })
          // fold each rank list into final list
            .reduce(function(mem, r) {
              mem[rank+1] = by_rank[r];
              rank += by_rank[r].length;
              return mem;
            }, {})
            .spy('sort')
            .value();
          // }
        },
        sort: function(coll, state) {
          return _.map(coll, function(group) {
            return players.sortGroup(group, state);
          });
        },
        sosFromPlayers: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(players.player, coll))
            .without(undefined)
            .reduce(function(mem, o) {
              return mem + _.getPath(o, 'points.tournament');
            }, 0)
            .value();
        },
        areAllPaired: function(coll, rs) {
          return _.chain(coll)
            .apply(players.names)
            .difference(round.pairedPlayers(rs))
            .value().length === 0;
        },
        indexRangeForGroup: function(coll, i) {
          var first_player = _.chain(coll)
            .slice(0, i)
            .flatten()
            .value().length;
          var next_player = first_player + coll[i].length;
          return [first_player, next_player];
        },
        // inTeam: function(coll, t) {
        //   return _.chain(coll)
        //     .flatten()
        //     .select(_.unary(player.inTeam(t)))
        //     .value();
        // },
        // dropTeam: function(coll, t) {
        //   return _.map(coll, function(group) {
        //     return _.reject(group, _.unary(player.inTeam(t)));
        //   });
        // },
        chunkGroups: function(coll, size) {
          return _.chain(coll)
            .flatten()
            .chunkAll(size)
            .value();
        },
        splitNewGroup: function(coll, ps) {
          var new_group = _.map(ps, _.partial(players.player, coll));
          return _.chain(coll)
            .mapWith(_.difference, new_group)
            .cat([new_group])
            .reject(_.isEmpty)
            .value();
        },
        groupForPlayer: function(coll, p) {
          return _.chain(coll)
            .map(function(gr) {
              return _.findWhere(gr, { name: p });
            })
            .reduce(function(mem, val, i) {
              return _.exists(mem) ? mem : (_.exists(val) ? i : null);
            }, null)
            .value();
        },
        movePlayerGroupFront: function(coll, p) {
          var gr = players.groupForPlayer(coll, p);
          if(0 === gr) return coll;
          var pl = players.player(coll, p);
          var new_coll = coll.slice();
          new_coll[gr] = _.difference(coll[gr], [pl]);
          new_coll[gr-1] = _.cat(coll[gr-1], pl);
          return _.reject(new_coll, _.isEmpty);
        },
        movePlayerGroupBack: function(coll, p) {
          var gr = players.groupForPlayer(coll, p);
          if(coll.length === gr+1) return coll;
          var pl = players.player(coll, p);
          var new_coll = coll.slice();
          new_coll[gr] = _.difference(coll[gr], [pl]);
          new_coll[gr+1] = _.cat(coll[gr+1], pl);
          return _.reject(new_coll, _.isEmpty);
        },
        moveGroupFront: function(coll, i) {
          if(i === 0) return coll;
          var new_coll = coll.slice();
          new_coll.splice(i,1);
          new_coll.splice(i-1, 0, coll[i]);
          return new_coll;
        },
        moveGroupBack: function(coll, i) {
          if(coll.length === i+1) return coll;
          var new_coll = coll.slice();
          new_coll.splice(i,1);
          new_coll.splice(i+1, 0, coll[i]);
          return new_coll;
        }
      };
      return players;
    }
  ]);
