'use strict';

angular.module('srApp.controllers')
  .controller('playersCtrl', [
    '$scope',
    '$state',
    function($scope,
             $state) {
      console.log('init playersCtrl', $state);
    }
  ])
  .controller('playersAddCtrl', [
    '$scope',
    'players',
    'player',
    function($scope,
             players,
             player) {
      console.log('init playersAddCtrl');

      function initScope() {
        $scope.name = 'Player';
        $scope.faction = '';
        $scope.city = '';
      }
      initScope();

      $scope.doAddPlayer = function doAddPlayer() {
        $scope.state.players = players.add($scope.state.players,
                                           player.create($scope.name,
                                                         $scope.faction,
                                                         $scope.city),
                                           $scope.state.phantom);
        $scope.goToState('players');
      };
    }
  ]);
