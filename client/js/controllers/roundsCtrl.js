'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    'rounds',
    'players',
    '$stateParams',
    '$window',
    function($scope,
             rounds,
             players,
             $stateParams,
             $window) {
      console.log('init roundsCtrl');

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

      $scope.round = function(r) {
        return rounds.round($scope.state.rounds, r);
      };

      $scope.next_round = _.range($scope.state.players.length/2).map(function(i) {
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
      });
      $scope.playerNames = function() {
        return players.names($scope.state.players);
      };
      $scope.suggestNextRound = function() {
        var sorted_player_names = _.chain($scope.state.players)
            .apply(players.sort)
            .apply(players.names)
            .value();
        $scope.next_round = rounds.suggestNextRound($scope.state.rounds,
                                                    sorted_player_names);
      };
      $scope.registerNextRound = function() {
        $scope.state.rounds.push($scope.next_round);
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
          _.chain($scope.state.players)
            .each(function(p) {
              p.points = rounds.pointsFor($scope.state.rounds, p.name);
            })
            .each(function(p) {
              p.points.sos = players.sosFrom($scope.state.players,
                                             rounds.opponentsFor($scope.state.rounds,
                                                                 p.name));
            });
        }
      };
    }
  ]);
