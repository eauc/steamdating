'use strict';

angular.module('srApp.services')
  .factory('player', [
    function() {
      return {
        is: _.rcurry2(function(p, name) {
          return p.name === name;
        }),
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
