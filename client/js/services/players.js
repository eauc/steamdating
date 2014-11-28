'use strict';

angular.module('srApp.services')
  .factory('player', [
    function() {
      var chainComp = function(comp) {
        return function(ret, a, b) {
          return ret===0 ? comp(a, b) : ret;
        };
      };
      var lessOrEqual = chainComp(_.comparator(_.lt));
      var greaterOrEqual = chainComp(_.comparator(_.gt));
      return {
        is: _.rcurry2(function(p, name) {
          return p.name === name;
        }),
        compare: function(p1, p2) {
          return _.chain(0)
            .apply(lessOrEqual, p1.points.tournament, p2.points.tournament)
            .apply(lessOrEqual, p1.points.sos, p2.points.sos)
            .apply(lessOrEqual, p1.points.control, p2.points.control)
            .apply(lessOrEqual, p1.points.army, p2.points.army)
            .apply(greaterOrEqual, p1.name, p2.name)
            .value();
        },
        create: function playerCreate(name, faction, city) {
          return {
            name: name,
            faction: faction,
            city: city,
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
        sort: function(coll) {
          return coll.slice().sort(player.compare).reverse();
        },
        sosFrom: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(players.player, coll))
            .reduce(function(mem, o) {
              return mem + _.getPath(o, 'points.tournament');
            }, 0)
            .value();
        }
      };
      return players;
    }
  ]);
