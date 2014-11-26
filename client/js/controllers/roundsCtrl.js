'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    'rounds',
    'players',
    '$stateParams',
    function($scope,
             rounds,
             players,
             $stateParams) {
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

      $scope.round = function(r) {
        return rounds.round(r)($scope.state.rounds);
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
        $scope.next_round[0].p1.name = 'Player1';
        $scope.next_round[0].p2.name = 'Player3';
        $scope.next_round[1].p1.name = 'Player2';
        $scope.next_round[1].p2.name = 'Player4';
        $scope.next_round[2].p1.name = 'Player5';
        $scope.next_round[2].p2.name = 'Player7';
        $scope.next_round[3].p1.name = 'Player6';
        $scope.next_round[3].p2.name = 'Phantom';
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
    }
  ]);
