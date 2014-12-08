'use strict';

angular.module('srApp.controllers')
  .controller('statsCtrl', [
    '$scope',
    '$window',
    '$stateParams',
    'factions',
    'round',
    'game',
    function($scope,
             $window,
             $stateParams,
             factions,
             round,
             game) {
      console.log('init statsCtrl');
      $scope.pane = $stateParams.pane;

      var n_players = _.flatten($scope.state.players).length;

      $scope.player_stats = {};
      factions.baseFactions().then(function() {
        var mem = 0;
        $scope.player_stats.factions = _.chain(_.flatten($scope.state.players))
          .countBy(function(p) { return p.faction; })
          .map(function(f, key) {
            return _.extend({
              count: f
            }, factions.info(key));
          })
          .sortBy(function(f) { return -f.count; })
          .each(function(f) {
            var start_angle = 2*Math.PI*mem/n_players;
            f.start = {
              x: 100 + 75*Math.sin(start_angle),
              y: 100 - 76*Math.cos(start_angle)
            };
            var end_angle = 2*Math.PI*(mem+f.count)/n_players;
            f.end = {
              x: 100 + 75*Math.sin(end_angle),
              y: 100 - 76*Math.cos(end_angle)
            };
            mem += f.count;
          })
          .tap(function(c) { console.log(c); })
          .value();
      });
      var player_win_loss = {};
      _.chain(_.flatten($scope.state.players))
        .each(function(p) {
          player_win_loss[p.name] = _.chain($scope.state.rounds)
            .map(function(r) {
              return round.gameFor(r, p.name);
            })
            .reduce(function(mem, g) {
              if(game.successFor(g, p.name)) {
                mem[0]++;
              }
              else{
                mem[1]++;
              }
              return mem;
            }, [0, 0])
            .value();
        })
        .value();
      console.log(player_win_loss);
      var faction_win_loss = _.chain(_.flatten($scope.state.players))
        .map(function(p) { return p.faction; })
        .uniq()
        .without(undefined)
        .map(function(f) {
          return {
            name: f,
            wl: _.chain(_.flatten($scope.state.players))
              .where({ faction: f })
              .reduce(function(mem, p) {
                mem[0] += player_win_loss[p.name][0];
                mem[1] += player_win_loss[p.name][1];
                return mem;
              }, [0, 0])
              .apply(function(wl) {
                return _.cat(wl, wl[0]+wl[1]);
              })
              .value()
          };
        })
        .sortBy(function(f) { return f.wl[0]/f.wl[2]; })
        .reverse()
        .value();
      console.log(faction_win_loss);
      $scope.faction_win_loss = faction_win_loss;
    }
  ]);
