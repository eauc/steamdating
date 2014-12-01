'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    '$stateParams',
    'rounds',
    'players',
    'teams',
    'team_game',
    function($scope,
             $stateParams,
             rounds,
             players,
             teams,
             team_game) {
      console.log('init gameEditCtrl');

      $scope.game = _.snapshot($scope.edit.game);

      $scope.setWinLoss = function(game, winner, loser) {
        game[winner].tournament = 1;
        game[loser].tournament = 0;
      };

      $scope.close = function(save) {
        if(save) {
          _.extend($scope.edit.game, $scope.game);
          $scope.updatePoints();
        }
        $scope.goToState('rounds', { pane: $scope.edit.rounds_pane });
      };

      if($scope.game.games) {
        $scope.$watch('game.games',
                      function() {
                        team_game.refreshPoints($scope.game);
                      },
                      true);
      }
    }
  ]);
