'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    'players',
    'lists',
    // '$stateParams',
    // 'rounds',
    // 'teams',
    // 'team_game',
    // 'factions',
    function($scope,
             players,
             lists
             // $stateParams,
             // rounds,
             // teams,
             // team_game,
             // factions
            ) {
      console.log('init gameEditCtrl');

      $scope.game = _.snapshot($scope.edit.game);

      $scope.setWinLoss = function(game, winner, loser) {
        game[winner].tournament = 1;
        game[loser].tournament = 0;
      };

      $scope.close = function(save) {
        if(save) {
          console.log('save game', $scope.edit.game, $scope.game);
          _.extend($scope.edit.game, $scope.game);
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back,
                         { pane: $scope.edit.pane });
      };

      $scope.casters = {};
      // if($scope.game.games) {
      //   $scope.$watch('game.games',
      //                 function() {
      //                   team_game.refreshPoints($scope.game);
      //                 },
      //                 true);
      //   _.chain($scope.state.players)
      //     .apply(players.inTeam, $scope.game.t1.name)
      //     .each(function(p) {
      //       $scope.casters[p.name] = lists.casters(p.lists);
      //     });
      //   _.chain($scope.state.players)
      //     .apply(players.inTeam, $scope.game.t2.name)
      //     .each(function(p) {
      //       $scope.casters[p.name] = lists.casters(p.lists);
      //     });
      // }
      // else {
      $scope.casters[$scope.game.p1.name] = _.chain($scope.state.players)
        .apply(players.player, $scope.game.p1.name)
        .apply(_.getPath, 'lists')
        .apply(lists.casters)
        .value();
      $scope.casters[$scope.game.p2.name] = _.chain($scope.state.players)
        .apply(players.player, $scope.game.p2.name)
        .apply(_.getPath, 'lists')
        .apply(lists.casters)
        .value();
      // }
    }
  ]);
