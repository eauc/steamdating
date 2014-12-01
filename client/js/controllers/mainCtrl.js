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

      $scope.state.teams = _.range(8).map(function(i) {
        return team.create('Team'+(i+1), 'City'+(i+1));
      });
      $scope.state.players = _.chain(8)
        .range()
        .map(function(i) {
          return _.chain(3)
            .range()
            .map(function(j) {
              return player.create('Player'+(i+1)+(j+1),
                                   'Faction'+(i+1)+(j+1),
                                   undefined,
                                   'Team'+(i+1));
            })
            .value();
        })
        .flatten()
        .value();

      $scope.updatePoints = function() {
        _.chain($scope.state.players)
          .each(function(p) {
            p.points = rounds.pointsFor($scope.state.rounds, p.name);
          })
          .each(function(p) {
            p.points.sos = players.sosFrom($scope.state.players,
                                           rounds.opponentsFor($scope.state.rounds,
                                                               p.name));
          });
        _.chain($scope.state.teams)
          .each(function(t) {
            t.points = rounds.pointsForTeam($scope.state.rounds, t.name);
          })
          .each(function(t) {
            t.points.sos = teams.sosFrom($scope.state.teams,
                                         rounds.opponentsForTeam($scope.state.rounds,
                                                                 t.name));
          });
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
