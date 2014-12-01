'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    'rounds',
    'players',
    'teams',
    '$stateParams',
    '$window',
    function($scope,
             rounds,
             players,
             teams,
             $stateParams,
             $window) {
      console.log('init roundsCtrl');

      var nb_games = _.chain($scope.state.teams)
          .map(function(t) {
            return players.inTeam($scope.state.players, t.name).length;
          })
          .max()
          .value();
      $scope.doShowAllTables = function(show, event) {
        _.chain(nb_games)
          .range()
          .each(function(i) {
            $scope.show['table'+(i+1)] = show;
          });
        event.stopPropagation();
      };
      $scope.doShowTable = function(t, show, event) {
        $scope.show['table'+t] = show;
        event.stopPropagation();
      };

      $scope.pane = $stateParams.pane;
      if($scope.pane >= $scope.state.rounds.length) {
        $scope.goToState('rounds', { pane: 'sum' });
        return;
      }

      $scope.roundsRange = function() {
        return _.range($scope.state.rounds.length);
      };

      function mapRoundsQuery(q) {
        $scope[q] = function(p, r) {
          return rounds.query($scope.state.rounds, r, p, q);
        };
      }
      mapRoundsQuery('opponentFor');
      mapRoundsQuery('successFor');
      mapRoundsQuery('tableFor');
      $scope.gameFor = function(p, r) {
        return rounds.gameFor($scope.state.rounds, p, r);
      };
      function mapRoundsTeamQuery(q) {
        $scope[q] = function(t, r) {
          return rounds.teamQuery($scope.state.rounds, r, t, q);
        };
      }
      mapRoundsTeamQuery('opponentForTeam');
      mapRoundsTeamQuery('successForTeam');
      mapRoundsTeamQuery('tableForTeam');
      $scope.gameForTeam = function(t, r) {
        return rounds.gameForTeam($scope.state.rounds, t, r);
      };

      $scope.round = function(r) {
        return rounds.round($scope.state.rounds, r);
      };

      if(!$scope.isTeamTournament()) {
        $scope.next_round = _.chain($scope.state.players.length/2)
          .range()
          .map(function(i) {
            return {
              table: i+1,
              p1: {
                name: null,
                tournament: null,
                control: null,
                army: null
              },
              p2: {
                name: null,
                tournament: null,
                control: null,
                army: null
              }
            };
          })
          .value();
      }
      else {
        $scope.next_round = _.chain($scope.state.teams.length/2)
          .range()
          .map(function(i) {
            return {
              table: i+1,
              t1: {
                name: null,
              },
              t2: {
                name: null,
              }
            };
          })
          .value();
      }
      $scope.playerNames = function() {
        return players.names($scope.state.players);
      };
      $scope.teamNames = function() {
        return teams.names($scope.state.teams);
      };
      $scope.suggestNextRound = function() {
        if(!$scope.isTeamTournament()) {
          var sorted_player_names = _.chain($scope.state.players)
            .apply(players.sort,
                   $scope.state.ranking.player,
                   $scope.state.rounds.length)
            .apply(players.names)
            .value();
          $scope.next_round = rounds.suggestNextRound($scope.state.rounds,
                                                      sorted_player_names);
        }
        else {
          var sorted_team_names = _.chain($scope.state.teams)
            .apply(teams.sort,
                   $scope.state.ranking.team,
                   $scope.state.players,
                   $scope.state.rounds.length)
            .apply(teams.names)
            .value();
          $scope.next_round = rounds.suggestNextTeamRound($scope.state.rounds,
                                                          sorted_team_names,
                                                          nb_games);
        }
      };
      $scope.registerNextRound = function() {
        $scope.state.rounds.push($scope.next_round);
        $scope.storeState();
        $scope.goToState('rounds', { pane: $scope.state.rounds.length-1 });
      };

      $scope.doGameEdit = function(g) {
        $scope.edit.game = g;
        $scope.edit.rounds_pane = $scope.pane;
        $scope.goToState('game_edit');
      };

      $scope.doDeleteRound = function(r) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.rounds = rounds.drop($scope.state.rounds, r);
          $scope.updatePoints();
          $scope.storeState();
          $scope.goToState('rounds', { pane: 'sum' });
        }
      };
    }
  ]);
