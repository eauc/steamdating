'use strict';

angular.module('srApp.controllers')
  .controller('playersCtrl', [
    '$scope',
    '$state',
    'player',
    function($scope,
             $state,
             player) {
      console.log('init playersCtrl');
      $scope.doAddPlayer = function() {
        $scope.edit.player = player.create();
        $scope.goToState('player_edit');
      };
      $scope.doEditPlayer = function(player) {
        $scope.edit.player = player;
        $scope.goToState('player_edit');
      };
    }
  ])
  .controller('playerEditCtrl', [
    '$scope',
    'players',
    'player',
    'factions',
    function($scope,
             players,
             player,
             factions) {
      console.log('init playerEditCtrl');

      $scope.state.factions = factions.listFrom($scope.state.players);
      $scope.player = _.snapshot($scope.edit.player);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!_.isString($scope.player.name) ||
             0 >= $scope.player.name) {
            alert('invalid player info');
            return;
          }
          if(!_.exists($scope.edit.player.name)) {
            if(players.player($scope.state.players, $scope.player.name)) {
              alert('a player with the same name already exists');
              return;
            }
            $scope.state.players = players.add($scope.state.players,
                                               $scope.player,
                                               $scope.state.phantom);
          }
          else {
            _.extend($scope.edit.player, $scope.player);
          }
        }
        $scope.goToState('players');
      };
    }
  ]);
