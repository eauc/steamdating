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
        $scope.state.players = state.updatePlayersPoints($scope.state);
      };
      $scope.storeState = function() {
        state.store($scope.state);
      };
    }
  ]);
