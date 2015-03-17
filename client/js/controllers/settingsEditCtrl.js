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
                                     $scope.player_test.n_players);
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

      $scope.$watch('player_test', computePlayerTestRankings, true);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!$scope.player_ranking_valid) {
            promptService.prompt('alert', 'current player ranking is invalid !');
            $scope.pane = 'player_ranking';
            return;
          }
          $scope.state.ranking.player = $scope.player_test.ranking;
          $scope.storeState();
        }
        $scope.goToState('players_ranking');
      };
    }
  ]);
