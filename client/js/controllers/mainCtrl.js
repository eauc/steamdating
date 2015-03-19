'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$q',
    'factions',
    'resultSheetsHtml',
    'state',
    'players',
    function($scope,
             $state,
             $q,
             factionsService,
             resultSheetsHtmlService,
             stateService) {
      console.log('init mainCtrl');

      factionsService.init();
      resultSheetsHtmlService.init();
      
      $scope.resetState = function(data) {
        $scope.state = stateService.create(data);
      };
      $scope.state = stateService.init();
      // $scope.state = stateService.test(stateService.create());
      // console.log('test state', $scope.state);

      $scope.goToState = R.bind($state.go, $state);
      $scope.currentState = function() { return $state.current.name; };
      $scope.stateIs = R.bind($state.is, $state);

      $scope.edit = {};
      $scope.doEditPlayer = function(player) {
        $scope.edit.player = player;
        $scope.edit.back = $state.current.name;
        $scope.goToState('player_edit');
      };

      $scope.updatePoints = function() {
        $scope.state = stateService.updatePlayersPoints($scope.state);
        $scope.state = stateService.updateBestsPlayers($scope.state);
      };
      $scope.storeState = function() {
        stateService.store($scope.state);
      };
    }
  ]);
