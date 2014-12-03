'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    '$stateParams',
    'rounds',
    'players',
    'teams',
    'team_game',
    'lists',
    'factions',
    function($scope,
             $stateParams,
             rounds,
             players,
             teams,
             team_game,
             lists,
             factions) {
      console.log('init gameEditCtrl');

      $scope.game = _.snapshot($scope.edit.game);

      $scope.setWinLoss = function(game, winner, loser) {
        game[winner].tournament = 1;
        game[loser].tournament = 0;
      };

      $scope.close = function(save) {
        if(save) {
          console.log($scope.edit.game, $scope.game);
          _.extend($scope.edit.game, $scope.game);
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState('rounds', { pane: $scope.edit.rounds_pane });
      };

      $scope.casters = {};
      if($scope.game.games) {
        $scope.$watch('game.games',
                      function() {
                        team_game.refreshPoints($scope.game);
                      },
                      true);
        _.chain($scope.state.players)
          .apply(players.inTeam, $scope.game.t1.name)
          .each(function(p) {
            $scope.casters[p.name] = lists.casters(p.lists);
          });
        _.chain($scope.state.players)
          .apply(players.inTeam, $scope.game.t2.name)
          .each(function(p) {
            $scope.casters[p.name] = lists.casters(p.lists);
          });
      }
      else {
        $scope.casters.p1 = _.chain($scope.state.players)
          .apply(players.player, $scope.game.p1.name)
          .apply(_.getPath, 'lists')
          .apply(lists.casters)
          .value();
        $scope.casters.p2 = _.chain($scope.state.players)
          .apply(players.player, $scope.game.p2.name)
          .apply(_.getPath, 'lists')
          .apply(lists.casters)
          .value();
      }
      console.log($scope.casters);
    }
  ]);
