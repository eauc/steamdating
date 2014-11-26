'use strict';

angular.module('srApp.services')
  .factory('game', [
    function() {
      var game = {
        player: _.rcurry2(function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p1') : _.getPath(g, 'p2');
        }),
        opponentFor: _.rcurry2(function(g, p) {
          var p1_name = _.getPath(g, 'p1.name');
          return p1_name === p ? _.getPath(g, 'p2.name') : p1_name;
        }),
        successFor: _.rcurry2(function(g, p) {
          var player = game.player(p)(g);
          return _.getPath(player || {}, 'tournament');
        }),
        tableFor: _.rcurry2(function(g, p) {
          return _.getPath(g, 'table');
        })
      };
      return game;
    }
  ])
  .factory('round', [
    'game',
    function(game) {
      var round = {
        gameFor: _.rcurry2(function(coll, p) {
          return _.find(coll, function(g) {
            return g.p1.name === p || g.p2.name === p;
          });
        })
      };
      return round;
    }
  ])
  .factory('rounds', [
    'game',
    'round',
    function(game,
             round) {
      var rounds = {
        round: _.rcurry2(function(coll, r) {
          if(r >= coll.length) return [];
          return coll[r];
        }),
        pointsFor: function(coll, p) {
          return _.map(coll, _.unary(round.gameFor(p)))
            .map(_.unary(game.player(p)))
            .reduce(function(mem, r) {
              return {
                tournament: mem.tournament + r.tournament,
                control: mem.control + r.control,
                army: mem.army + r.army
              };
            }, {
              tournament: 0,
              control: 0,
              army: 0
            });
        },
        opponentsFor: function(coll, p) {
          return _.map(coll, _.unary(round.gameFor(p)))
            .map(_.unary(game.opponentFor(p)));
        },
        query: function(coll, r, p, q) {
          return _.pipeline(rounds.round(r),
                            round.gameFor(p),
                            game[q](p))(coll);
        }
      };
      return rounds;
    }
  ]);
