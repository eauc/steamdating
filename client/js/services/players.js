'use strict';

angular.module('srApp.services')
  .factory('player', [
    function() {
      return {
        is: _.rcurry2(function(p, name) {
          return p.name === name;
        }),
        inTeam: _.rcurry2(function(p, team) {
          return p.team === team;
        }),
        rank: function(p, critFn) {
          var rank = critFn(p.points.tournament,
                            p.points.sos,
                            p.points.control,
                            p.points.army);
          return rank;
        },
        create: function playerCreate(name, faction, city, team) {
          return {
            name: name,
            faction: faction,
            city: city,
            team: team,
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
    'player',
    function(player) {
      var players = {
        appendPhantom: function(coll, phantom) {
          if((coll.length % 2) === 1) {
            return _.cat(coll, phantom);
          }
          return coll;
        },
        add: function playersAdd(coll, p, phantom) {
          return _.chain(coll)
            .reject(_.unary(player.is('Phantom')))
            .cat(p)
            .apply(players.appendPhantom, phantom)
            .value();
        },
        drop: function(coll, p, phantom) {
          return _.chain(coll)
            .reject(_.unary(player.is(p.name)))
            .reject(_.unary(player.is('Phantom')))
            .apply(players.appendPhantom, phantom)
            .value();
        },
        player: function(coll, name) {
          return _.find(coll, _.unary(player.is(name)));
        },
        names: function(coll) {
          return _.mapWith(coll, _.getPath, 'name');
        },
        cities: function(coll) {
          return _.chain(coll)
            .mapWith(_.getPath, 'city')
            .uniq()
            .without(undefined)
            .value();
        },
        sort: function(coll, criterium, n_rounds) {
          var baseCritFn = new Function('tp', 'sos', 'cp', 'ap',
                                        'n_players', 'n_rounds',
                                        'return '+criterium+';');
          var critFn = _.partial(baseCritFn, _, _, _, _,
                                 coll.length, n_rounds);
          return _.sortBy(coll.slice(),
                          _.partial(player.rank, _, critFn)).reverse();
        },
        sosFrom: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(players.player, coll))
            .reduce(function(mem, o) {
              return mem + _.getPath(o, 'points.tournament');
            }, 0)
            .value();
        },
        inTeam: function(coll, t) {
          return _.chain(coll)
            .select(_.unary(player.inTeam(t)))
            // .tap(function(c) { console.log(c.length); })
            .value();
        },
        dropTeam: function(coll, t) {
          return _.reject(coll, _.unary(player.inTeam(t)));
        }
      };
      return players;
    }
  ]);
