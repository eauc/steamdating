'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$window',
    'player',
    'players',
    'rounds',
    'factions',
    'team',
    'teams',
    function($scope,
             $state,
             $window,
             player,
             players,
             rounds,
             factions,
             team,
             teams) {
      console.log('init mainCtrl');
      $scope.edit = {};
      $scope.resetState = function() {
        $scope.newState({
          phantom: player.create('Phantom'),
          teams:[],
          players: [],
          rounds: [],
          factions: []
        });
      };
      $scope.newState = function(state) {
        $scope.state = state;
        $scope.state.factions = factions.listFrom($scope.state.players);
        $scope.storeState();
        console.log('state', $scope.state);
      };
      $scope.storeState = function() {
        $window.localStorage.setItem('sdApp.state',
                                     JSON.stringify($scope.state));
        console.log('state stored');
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

      var stored_state = $window.localStorage.getItem('sdApp.state');
      if(stored_state) {
        try {
          stored_state = JSON.parse(stored_state);
          $scope.newState(stored_state);
          console.log('restoring stored state');
        }
        catch(e) {
          console.log('error parsing stored state', e);
        }
      }
      if(!_.exists($scope.state)) {
        $scope.resetState();
      }

      console.log('state', $scope.state);
    }
  ]);
