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
        $scope.newState({});
      };
      $scope.newState = function(state) {
        $scope.state = _.defaults(state, {
          phantom: player.create('Phantom'),
          bracket: [],
          teams:[[]],
          players: [[]],
          rounds: [],
          factions: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
          }
        });
        $scope.updatePoints();
        $scope.storeState();
        console.log('state', $scope.state);
      };
      $scope.storeState = function() {
        $window.localStorage.setItem('sdApp.state',
                                     JSON.stringify($scope.state));
        console.log('state stored');
      };
      $scope.hasPlayers = function() {
        return _.flatten($scope.state.players).length !== 0;
      };
      $scope.isTeamTournament = function() {
        return _.flatten($scope.state.teams).length !== 0;
      };
      $scope.isBracketTournament = function(g) {
        return (g < $scope.state.bracket.length &&
                _.exists($scope.state.bracket[g]));
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
        _.each($scope.state.players, function(group) {
          var base_weight = group.length/2;
          _.chain(group)
            .each(function(p) {
              p.lists_played = rounds.listsFor($scope.state.rounds, p.name);
            })
            .each(function(p) {
              p.points = rounds.pointsFor($scope.state.rounds,
                                          p.name,
                                          $scope.state.bracket,
                                          base_weight);
            })
            .each(function(p) {
              p.points.sos = players.sosFrom($scope.state.players,
                                             rounds.opponentsFor($scope.state.rounds,
                                                                 p.name));
            });
        });
        _.each($scope.state.teams, function(group) {
          var base_weight = group.length/2;
          _.chain(group)
            .each(function(t) {
              t.points = rounds.pointsForTeam($scope.state.rounds,
                                              t.name,
                                              $scope.state.bracket,
                                              base_weight);
            })
            .each(function(t) {
              t.points.sos = teams.sosFrom($scope.state.teams,
                                           rounds.opponentsForTeam($scope.state.rounds,
                                                                   t.name));
            });
        });
      };
      
      $scope.show = {};
      $scope.doShowAll = function(i, show, event) {
        _.chain($scope.state.teams[i])
          .apply(teams.names)
          .each(function(name) {
            $scope.show[name] = show;
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

      $scope.bracketRoundOf = function(g, r) {
        var n = ($scope.isTeamTournament() ?
                 $scope.state.teams[g].length >> (r - $scope.state.bracket[g] + 1) :
                 $scope.state.players[g].length >> (r - $scope.state.bracket[g] + 1));
        switch(n) {
        case 1:
          {
            return 'Final';
          }
        case 2:
          {
            return 'Semi-finals';
          }
        case 4:
          {
            return 'Quarter-finals';
          }
        default:
          {
            return 'Round of '+n;
          }
        }
      };

      console.log('state', $scope.state);
    }
  ]);
