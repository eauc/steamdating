'use strict';

angular.module('srApp.controllers')
  .controller('gameEditCtrl', [
    '$scope',
    'player',
    'players',
    'lists',
    'state',
    'game',
    function($scope,
             playerService,
             playersService,
             listsService,
             stateService,
             gameService) {
      $scope.game = R.clone($scope.edit.game);
      console.log('init gameEditCtrl', $scope.game);

      $scope.casters = {};
      function getCastersForPlayerName(player_name) {
        $scope.casters[player_name] = $scope.casters[player_name] || R.pipe(
          playersService.playerFull$(player_name),
          R.defaultTo({ lists: [] }),
          R.prop('lists'),
          listsService.casters
        )($scope.state.players);
        // console.log('getCastersForPlayerName',
        //             player_name, $scope.casters[player_name]);
      }
      $scope.updatePlayersOptions = function() {
        $scope.players_options = R.pipe(
          stateService.playersNotDropedInLastRound,
          playersService.names
        )($scope.state);

        $scope.p1_members_options = R.pipe(
          playersService.player$($scope.game.p1.name),
          R.defaultTo({}),
          playerService.members,
          R.pluck('name')
        )($scope.state.players);
        // console.log('p1_members', $scope.p1_members_options);
        $scope.p2_members_options = R.pipe(
          playersService.player$($scope.game.p2.name),
          R.defaultTo({}),
          playerService.members,
          R.pluck('name')
        )($scope.state.players);
        // console.log('p2_members', $scope.p2_members_options);
        
        getCastersForPlayerName($scope.game.p1.name);
        getCastersForPlayerName($scope.game.p2.name);
        R.forEach(getCastersForPlayerName, R.concat($scope.p1_members_options,
                                                    $scope.p2_members_options));
      };
      $scope.updatePlayersOptions();

      $scope.setWinLoss = function(game, clicked, other) {
        if(game[clicked].tournament === 1) {
          game[clicked].tournament = 0;
          game[other].tournament = 0;
        }
        else {
          game[clicked].tournament = 1;
          game[other].tournament = 0;
        }
        if(game !== $scope.game) {
          $scope.game = gameService.updatePointsFromSubGames($scope.game);
        }
      };

      $scope.close = function(save) {
        if(save) {
          $scope.game = gameService.updatePoints($scope.game);
          console.log('save game', $scope.edit.game, $scope.game);
          R.deepExtend($scope.edit.game, $scope.game);
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back,
                         { pane: $scope.edit.pane });
      };

      $scope.doRandomGame = function doRandomGame() {
        gameService.random($scope.p1_members_options,
                           $scope.p2_members_options,
                           $scope.casters, $scope.game);
      };
    }
  ]);
