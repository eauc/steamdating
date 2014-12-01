'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    'player',
    'players',
    'rounds',
    'factions',
    'team',
    'teams',
    function($scope,
             $state,
             player,
             players,
             rounds,
             factions,
             team,
             teams) {
      console.log('init mainCtrl');
      $scope.edit = {};
      $scope.state = {
        phantom: player.create('Phantom'),
        teams:[],
        players: [],
        rounds: [],
        factions: []
      };
      $scope.newState = function(state) {
        $scope.state = state;
        $scope.state.factions = factions.listFrom($scope.state.players);
        console.log('state', $scope.state);
      };
      $scope.isTeamTournament = function() {
        return $scope.state.teams.length !== 0;
      };

      $scope.goToState = _.bind($state.go, $state);
      $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');

      $scope.doEditPlayer = function(player) {
        $scope.edit.player = player;
        $scope.goToState('player_edit');
      };
      $scope.doEditTeam = function(team) {
        $scope.edit.team = team;
        $scope.goToState('team_edit');
      };

      $scope.show = {};
      $scope.doShowAll = function(show, event) {
        _.each($scope.state.teams, function(t) {
          $scope.show[t.name] = show;
        });
        event.stopPropagation();
      };
      $scope.doShow = function(name, show, event) {
        $scope.show[name] = show;
        event.stopPropagation();
      };

      console.log('state', $scope.state);
    }
  ]);
