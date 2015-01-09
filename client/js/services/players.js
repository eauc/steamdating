'use strict';

angular.module('srApp.services')
  .factory('player', [
    function() {
      return {
        is: function(p, name) {
          return p.name === name;
        },
        // inTeam: _.rcurry2(function(p, team) {
        //   return p.team === team;
        // }),
        // rank: function(p, critFn) {
        //   var rank = critFn(p.points.tournament,
        //                     p.points.sos,
        //                     p.points.control,
        //                     p.points.army);
        //   return rank;
        // },
        create: function playerCreate(name, faction, city, team) {
          return {
            name: name,
            faction: faction,
            city: city,
            team: team,
            lists: [],
            points: {
              tournament: 0,
              sos: 0,
              control: 0,
              army: 0
            }
          };
        }
      };
    }
  ])
  .factory('players', [
    '$q',
    'player',
    'factions',
    function($q,
             player,
             factions) {
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
        // player: function(coll, name) {
        //   return _.chain(coll)
        //     .flatten()
        //     .find(_.unary(player.is(name)))
        //     .value();
        // },
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
        // sortGroup: function(coll, i, state) {
        //   if(_.exists(state.bracket[i])) {
        //     return _.sortBy(coll.slice(), function(p) {
        //       return -p.points.bracket;
        //     });
        //   }
        //   else {
        //     var baseCritFn = new Function('tp', 'sos', 'cp', 'ap',
        //                                   'n_players', 'n_rounds',
        //                                   'return '+state.ranking.player+';');
        //     var critFn = _.partial(baseCritFn, _, _, _, _,
        //                            coll.length, state.rounds.length);
        //     return _.sortBy(coll.slice(), function(p) {
        //       return -player.rank(p, critFn);
        //     });
        //   }
        // },
        // sort: function(coll, state) {
        //   return _.map(state.players, function(group, i) {
        //     return players.sortGroup(group, i, state);
        //   });
        // },
        // sosFrom: function(coll, opponents) {
        //   return _.chain(opponents)
        //     .map(_.partial(players.player, coll))
        //     .reduce(function(mem, o) {
        //       return mem + _.getPath(o, 'points.tournament');
        //     }, 0)
        //     .value();
        // },
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
        // chunk: function(coll, size) {
        //   return _.chain(coll)
        //     .flatten()
        //     .chunkAll(size)
        //     .value();
        // }
      };
      return players;
    }
  ]);
