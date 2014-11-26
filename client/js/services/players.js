'use strict';

angular.module('srApp.services')
  .factory('player', [
    function() {
      var lessOrEqual = _.comparator(_.lt);
      return {
        is: _.rcurry2(function(p, name) {
          return p.name === name;
        }),
        compare: function(p1, p2) {
          var ret = lessOrEqual(p1.points.tournament, p2.points.tournament);
          if(0 === ret) ret = lessOrEqual(p1.points.sos, p2.points.sos);
          if(0 === ret) ret = lessOrEqual(p1.points.control, p2.points.control);
          if(0 === ret) ret = lessOrEqual(p1.points.army, p2.points.army);
          if(0 === ret) ret = p1.name.localCompare(p2.name);
          return ret;
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
        add: function playersAdd(coll, p, phantom) {
          var players = _.reject(coll, _.unary(player.is('Phantom'))).concat(p);
          if((p.length % 2) === 1) {
            players = _.cat(players, phantom);
          }
          return players;
        },
        player: function(coll, name) {
          return _.find(coll, _.unary(player.is(name)));
        },
        names: function(coll) {
          return _.map(coll, _.partial(_.getPath, _, 'name'));
        },
        sort: function(coll) {
          return coll.slice().sort(player.compare).reverse();
        },
        sosFrom: function(coll, opponents) {
          return _.map(opponents, function(o) {
            return players.player(coll, o);
          }).reduce(function(mem, o) {
            return mem + _.getPath(o, 'points.tournament');
          }, 0);
        }
      };
      return players;
    }
  ]);
