'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    'players',
    'lists',
    function($scope,
             playersService,
             listsService) {
      console.log('init gameEditCtrl');

      $scope.game = R.clone($scope.edit.game);

      $scope.setWinLoss = function(game, clicked, other) {
        if(game[clicked].tournament === 1) {
          game[clicked].tournament = 0;
          game[other].tournament = 0;
        }
        else {
          game[clicked].tournament = 1;
          game[other].tournament = 0;
        }
      };

      $scope.close = function(save) {
        if(save) {
          console.log('save game', $scope.edit.game, $scope.game);
          R.deepExtend($scope.edit.game, $scope.game);
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back,
                         { pane: $scope.edit.pane });
      };

      $scope.casters = {};
      $scope.casters[$scope.game.p1.name] = R.pipe(
        playersService.player$($scope.game.p1.name),
        R.defaultTo({ lists: [] }),
        R.prop('lists'),
        listsService.casters
      )($scope.state.players);
      $scope.casters[$scope.game.p2.name] = R.pipe(
        playersService.player$($scope.game.p2.name),
        R.defaultTo({ lists: [] }),
        R.prop('lists'),
        listsService.casters
      )($scope.state.players);
    }
  ]);
