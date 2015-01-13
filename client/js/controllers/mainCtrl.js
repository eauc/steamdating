'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$q',
    // '$window',
    'factions',
    'state',
    // 'player',
    'players',
    // 'rounds',
    // 'team',
    // 'teams',
    function($scope,
             $state,
             $q,
             // $window,
             factions,
             state,
             // player,
             players
             // rounds,
             // team,
             // teams
            ) {
      console.log('init mainCtrl');

      factions.init();
      // $scope.resetState = function() {
      //   $scope.state = state.create();
      // };
      $scope.state = state.init();
      // $scope.state = state.test($scope.state);
      console.log('state', $scope.state);

      $scope.goToState = _.bind($state.go, $state);
      $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');

      $scope.edit = {};
      $scope.doEditPlayer = function(player) {
        $scope.edit.player = player;
        $scope.goToState('player_edit');
      };
      // $scope.doEditTeam = function(team) {
      //   $scope.edit.team = team;
      //   $scope.goToState('team_edit');
      // };

      // $scope.edit.player = $scope.state.players[0][1];
      // $scope.edit.game = $scope.state.rounds[0][1];
      // $scope.edit.rounds_pane = 'sum';

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

      $scope.updatePoints = function() {
        $scope.state.players = players.updatePoints($scope.state.players,
                                                    $scope.state.rounds);
      };
      $scope.storeState = function() {
        // state.store($scope.state);
      };
    }
  ]);
