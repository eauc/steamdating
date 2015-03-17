'use strict';

angular.module('srApp.controllers')
  .controller('teamEditCtrl', [
    '$scope',
    '$window',
    'players',
    'player',
    'factions',
    function($scope,
             playersService,
             playerService,
             factionsService,
             $window) {
      console.log('init teamsEditCtrl');

      // $scope.state.factions = players.factions([], $scope.state.players);
      // $scope.state.cities = teams.cities($scope.state.teams);

      // $scope.team = _.snapshot($scope.edit.team);

      // $scope.doClose = function(validate) {
      //   if(validate) {
      //     if(!_.isString($scope.team.name) ||
      //        0 >= $scope.team.name) {
      //       $window.alert('invalid team info');
      //       return;
      //     }
      //     var existing_teams = teams.names($scope.state.teams);
      //     if(_.exists($scope.edit.team.name)) {
      //       existing_teams = _.without(existing_teams, $scope.edit.team.name);
      //     }
      //     if(0 <= _.indexOf(existing_teams, $scope.team.name)) {
      //       $window.alert('a team with the same name already exists');
      //       return;
      //     }
      //     if(!_.exists($scope.edit.team.name)) {
      //       $scope.state.teams = teams.add($scope.state.teams,
      //                                      $scope.team,
      //                                      $scope.edit.group);
      //     }
      //     else {
      //       _.extend($scope.edit.team, $scope.team);
      //     }
      //     $scope.storeState();
      //   }
      //   $scope.goToState('players');
      // };
    }
  ]);
