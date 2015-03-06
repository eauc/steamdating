'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$q',
    'factions',
    'state',
    'players',
    function($scope,
             $state,
             $q,
             factions,
             state,
             players) {
      console.log('init mainCtrl');

      factions.init();
      $scope.resetState = function(data) {
        $scope.state = state.create(data);
      };
      $scope.state = state.init();
      // $scope.state = state.test(state.create());
      // console.log('test state', $scope.state);

      $scope.goToState = _.bind($state.go, $state);
      $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');
      $scope.stateIs = _.bind($state.is, $state);

      $scope.edit = {};
      $scope.doEditPlayer = function(player) {
        $scope.edit.player = player;
        $scope.edit.back = $state.current.name;
        $scope.goToState('player_edit');
      };

      $scope.updatePoints = function() {
        $scope.state = state.updatePlayersPoints($scope.state);
        $scope.state = state.updateBestsPlayers($scope.state);
      };
      $scope.storeState = function() {
        state.store($scope.state);
      };
    }
  ]);
