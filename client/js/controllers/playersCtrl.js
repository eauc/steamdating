'use strict';

angular.module('srApp.controllers')
  .controller('playersCtrl', [
    '$scope',
    '$state',
    'player',
    'players',
    'team',
    'teams',
    '$window',
    function($scope,
             $state,
             player,
             players,
             team,
             teams,
             $window) {
      console.log('init playersCtrl');

      $scope.doAddPlayer = function() {
        $scope.edit.player = player.create();
        $scope.goToState('player_edit');
      };
      $scope.doAddTeam = function() {
        $scope.edit.team = team.create();
        $scope.goToState('team_edit');
      };

      $scope.doDeletePlayer = function(p, event) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.players = players.drop($scope.state.players,
                                              p,
                                              $scope.state.phantom);
        }
        event.stopPropagation();
      };
      $scope.doDeleteTeam = function(t, event) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.teams = teams.drop($scope.state.teams, t);
          $scope.state.players = players.dropTeam($scope.state.players,
                                                  t.name);
        }
        event.stopPropagation();
      };
    }
  ])
  .controller('playerEditCtrl', [
    '$scope',
    'players',
    'player',
    'factions',
    '$window',
    function($scope,
             players,
             player,
             factions,
             $window) {
      console.log('init playerEditCtrl');

      $scope.state.factions = factions.listFrom($scope.state.players);
      $scope.state.cities = players.cities($scope.state.players);

      $scope.player = _.snapshot($scope.edit.player);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!_.isString($scope.player.name) ||
             0 >= $scope.player.name) {
            $window.alert('invalid player name');
            return;
          }
          if($scope.isTeamTournament() &&
             (!_.isString($scope.player.team) ||
              0 >= $scope.player.team)) {
            $window.alert('invalid player team');
            return;
          }
          var existing_players = players.names($scope.state.players);
          if(_.exists($scope.edit.player.name)) {
            existing_players = _.without(existing_players, $scope.edit.player.name);
          }
          if(0 <= _.indexOf(existing_players, $scope.player.name)) {
            $window.alert('a player with the same name already exists');
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
