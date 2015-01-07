'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    // '$state',
    // '$window',
    'state',
    // 'player',
    // 'players',
    // 'rounds',
    // 'factions',
    // 'team',
    // 'teams',
    function($scope,
             // $state,
             // $window,
             state
             // player,
             // players,
             // rounds,
             // factions,
             // team,
             // teams
            ) {
      console.log('init mainCtrl');

      // $scope.resetState = function() {
      //   $scope.state = state.create();
      // };
      $scope.state = state.init();
      // $scope.state = state.test($scope.state);
      console.log('state', $scope.state);

      // $scope.goToState = _.bind($state.go, $state);
      // $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');

      // $scope.edit = {};
      // $scope.doEditPlayer = function(player) {
      //   $scope.edit.player = player;
      //   $scope.goToState('player_edit');
      // };
      // $scope.doEditTeam = function(team) {
      //   $scope.edit.team = team;
      //   $scope.goToState('team_edit');
      // };

      // $scope.show = {};
      // $scope.doShowAll = function(i, show, event) {
      //   _.chain($scope.state.teams[i])
      //     .apply(teams.names)
      //     .each(function(name) {
      //       $scope.show[name] = show;
      //     });
      //   event.stopPropagation();
      // };
      // $scope.doShow = function(name, show, event) {
      //   $scope.show[name] = show;
      //   event.stopPropagation();
      // };

    }
  ]);
