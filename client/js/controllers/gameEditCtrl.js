'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    '$stateParams',
    'rounds',
    'players',
    function($scope,
             $stateParams,
             rounds,
             players) {
      console.log('init gameEditCtrl');

      $scope.game = _.snapshot($scope.edit.game);

      $scope.setWinLoss = function(winner, loser) {
        $scope.game[winner].tournament = 1;
        $scope.game[loser].tournament = 0;
      };

      $scope.close = function(save) {
        if(save) {
          _.extend($scope.edit.game, $scope.game);
          var p1 = players.player($scope.state.players, $scope.game.p1.name);
          p1.points = rounds.pointsFor($scope.state.rounds, $scope.game.p1.name);
          var p2 = players.player($scope.state.players, $scope.game.p2.name);
          p2.points = rounds.pointsFor($scope.state.rounds, $scope.game.p2.name);

          var opps = _.chain([])
            .cat(rounds.opponentsFor($scope.state.rounds, p1.name))
            .cat(rounds.opponentsFor($scope.state.rounds, p2.name))
            .uniq()
            .value();
          _.each(opps, function(opp) {
            var p = players.player($scope.state.players, opp);
            p.points.sos = players.sosFrom($scope.state.players,
                                           rounds.opponentsFor($scope.state.rounds,
                                                               p.name));
          });
        }
        $scope.goToState('rounds', { pane: $scope.edit.rounds_pane });
      };
    }
  ]);
