'use strict';

angular.module('srApp.controllers')
  .controller('settingsEditCtrl', [
    '$scope',
    'prompt',
    'ranking',
    'player',
    function($scope,
             promptService,
             rankingService,
             playerService) {
      console.log('init settingsEditCtrl');
      $scope.pane = 'custom_fields';
      $scope.criterions = R.clone(rankingService.criterions);
      
      $scope.player_test = {
        ranking: $scope.state.ranking.player,
        n_rounds: 5,
        n_players: 32,
        player1: {
          name: 'p1',
          custom_field: 21,
          points: {
            tournament: 4,
            sos: 10,
            control: 13,
            army: 38,
            assassination: 3,
            custom_field: 14,
          },
          rank: 0
        },
        player2: {
          name: 'p2',
          custom_field: 19,
          points: {
            tournament: 3,
            sos: 15,
            control: 8,
            army: 45,
            assassination: 5,
            custom_field: 25
          },
          rank: 0
        }
      };
      function computePlayerTestRankings() {
        $scope.player_ranking_valid = true;
        var critFun = rankingService
            .buildPlayerCritFunction($scope.player_test.ranking,
                                     $scope.player_test.n_rounds,
                                     $scope.player_test.n_players,
                                     1);
        if(R.type(critFun) !== 'Function') {
          $scope.player_test.player1.rank = critFun;
          $scope.player_test.player2.rank = critFun;
          $scope.player_ranking_valid = false;
          return;
        }

        $scope.player_test.player1.rank =
          playerService.rank(critFun, $scope.player_test.player1);
        if('Number' !== R.type($scope.player_test.player1.rank)) {
          $scope.player_ranking_valid = false;
        }
        
        $scope.player_test.player2.rank =
          playerService.rank(critFun, $scope.player_test.player2);
        if('Number' !== R.type($scope.player_test.player2.rank)) {
          $scope.player_ranking_valid = false;
        }
      }
      $scope.team_test = {
        ranking: $scope.state.ranking.team,
        n_rounds: 5,
        n_players: 32,
        team_size: 3,
        team1: {
          name: 'p1',
          custom_field: 21,
          points: {
            team_tournament: 6,
            tournament: 4,
            sos: 10,
            control: 13,
            army: 38,
            assassination: 3,
            custom_field: 14,
          },
          rank: 0
        },
        team2: {
          name: 'p2',
          custom_field: 19,
          points: {
            team_tournament: 5,
            tournament: 3,
            sos: 15,
            control: 8,
            army: 45,
            assassination: 5,
            custom_field: 25
          },
          rank: 0
        }
      };
      function computeTeamTestRankings() {
        $scope.team_ranking_valid = true;
        var critFun = rankingService
            .buildPlayerCritFunction($scope.team_test.ranking,
                                     $scope.team_test.n_rounds,
                                     $scope.team_test.n_players,
                                     $scope.team_test.team_size);
        if(R.type(critFun) !== 'Function') {
          $scope.team_test.team1.rank = critFun;
          $scope.team_test.team2.rank = critFun;
          $scope.team_ranking_valid = false;
          return;
        }

        $scope.team_test.team1.rank =
          playerService.rank(critFun, $scope.team_test.team1);
        if('Number' !== R.type($scope.team_test.team1.rank)) {
          $scope.team_ranking_valid = false;
        }
        
        $scope.team_test.team2.rank =
          playerService.rank(critFun, $scope.team_test.team2);
        if('Number' !== R.type($scope.team_test.team2.rank)) {
          $scope.team_ranking_valid = false;
        }
      }

      $scope.$watch('player_test', computePlayerTestRankings, true);
      $scope.$watch('team_test', computeTeamTestRankings, true);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!$scope.player_ranking_valid) {
            promptService.prompt('alert', 'current player ranking is invalid !');
            $scope.pane = 'player_ranking';
            return;
          }
          if(!$scope.team_ranking_valid) {
            promptService.prompt('alert', 'current team ranking is invalid !');
            $scope.pane = 'team_ranking';
            return;
          }
          $scope.state.ranking.player = $scope.player_test.ranking;
          $scope.state.ranking.team = $scope.team_test.ranking;
          $scope.storeState();
        }
        $scope.goToState('players_ranking');
      };
    }
  ]);
