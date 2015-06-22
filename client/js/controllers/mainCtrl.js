'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$q',
    'factions',
    'resultSheetsHtml',
    'state',
    'scenario',
    'players',
    function($scope,
             $state,
             $q,
             factionsService,
             resultSheetsHtmlService,
             stateService,
             scenarioService,
             playersService) {
      console.log('init mainCtrl');

      factionsService.init();
      resultSheetsHtmlService.init();
      scenarioService.init().then(function(scenarios) {
        $scope.scenarios = scenarios;
      });
      
      $scope.resetState = function(data) {
        $scope.state = stateService.create(data);
      };
      $scope.state = stateService.init();
      // $scope.state = stateService.test(stateService.create());
      // console.log('test state', $scope.state);

      $scope.isTeamTournament = function isTeamTournament() {
        return playersService.hasTeam($scope.state.players);
      };
      
      $scope.goToState = R.bind($state.go, $state);
      $scope.currentState = function() { return $state.current.name; };
      $scope.stateIs = R.bind($state.is, $state);

      $scope.edit = {};
      $scope.doEditPlayer = function(player) {
        $scope.edit.team = null;
        $scope.edit.player = player;
        $scope.edit.back = $state.current.name;
        $scope.goToState('player_edit');
      };
      $scope.doEditTeamMember = function(group_index, team, player) {
        $scope.edit.team = team;
        $scope.edit.player = player;
        $scope.edit.group = group_index;
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
