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
          var existing_players = players.names($scope.state.players);
          if(_.exists($scope.edit.player.name)) {
            existing_players = _.without(existing_players, $scope.edit.player.name);
          }
          if(0 <= _.indexOf(existing_players, $scope.player.name)) {
              alert('a player with the same name already exists');
            return;
          }
          if(!_.exists($scope.edit.player.name)) {
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
