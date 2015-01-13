'use strict';

angular.module('srApp.controllers')
  .controller('rankingEditCtrl', [
    '$scope',
    '$window',
    'ranking',
    'player',
    function($scope,
             $window,
             ranking,
             player
            ) {
      console.log('init rankingEditCtrl');
      $scope.pane = 'player';

      $scope.player_test = {
        ranking: $scope.state.ranking.player,
        n_rounds: 5,
        n_players: 32,
        player1: {
          name: 'p1',
          points: {
            tournament: 4,
            sos: 10,
            control: 13,
            army: 38
          },
          rank: 0
        },
        player2: {
          name: 'p2',
          points: {
            tournament: 3,
            sos: 15,
            control: 8,
            army: 45
          },
          rank: 0
        }
      };
      function computePlayerTestRankings() {
        $scope.player_ranking_valid = true;
        var critFun = ranking.buildPlayerCritFunction($scope.player_test.ranking,
                                                      $scope.player_test.n_rounds,
                                                      $scope.player_test.n_players);
        if(!_.isFunction(critFun)) {
          $scope.player_test.player1.rank = critFun;
          $scope.player_test.player2.rank = critFun;
          $scope.player_ranking_valid = false;
          return;
        }
        $scope.player_test.player1.rank = player.rank($scope.player_test.player1,
                                                      critFun);
        if(!_.isNumber($scope.player_test.player1.rank)) {
          $scope.player_ranking_valid = false;
        }
        $scope.player_test.player2.rank = player.rank($scope.player_test.player2,
                                                      critFun);
        if(!_.isNumber($scope.player_test.player2.rank)) {
          $scope.player_ranking_valid = false;
        }
      }
      // computePlayerTestRankings();
      $scope.$watch('player_test', computePlayerTestRankings, true);

      // $scope.team_test = {
      //   ranking: $scope.state.ranking.team,
      //   n_teams: 8,
      //   team_size: 5,
      //   n_rounds: 3,
      //   n_players: 40,
      //   team1: {
      //     ttp: 2,
      //     tp: 5,
      //     sos: 10,
      //     cp: 13,
      //     ap: 38,
      //     rank: 0
      //   },
      //   team2: {
      //     ttp: 1,
      //     tp: 4,
      //     sos: 15,
      //     cp: 8,
      //     ap: 45,
      //     rank: 0
      //   }
      // };
      // function computeTeamTestRankings() {
      //   $scope.team_ranking_valid = true;
      //   var critFun;
      //   try {
      //     critFun = new Function('ttp', 'tp', 'sos', 'cp', 'ap',
      //                            'n_teams', 'team_size', 'n_rounds', 'n_players',
      //                            'return '+$scope.team_test.ranking+';');
      //   }
      //   catch(e) {
      //     $scope.team_test.team1.rank = "Error : " + e.message;
      //     $scope.team_test.team2.rank = "Error : " + e.message;
      //     $scope.team_ranking_valid = false;
      //     return;
      //   }
      //   try {
      //     $scope.team_test.team1.rank = critFun($scope.team_test.team1.ttp,
      //                                           $scope.team_test.team1.tp,
      //                                           $scope.team_test.team1.sos,
      //                                           $scope.team_test.team1.cp,
      //                                           $scope.team_test.team1.ap,
      //                                           $scope.team_test.n_teams,
      //                                           $scope.team_test.team_size,
      //                                           $scope.team_test.n_rounds,
      //                                           $scope.team_test.n_teams);
      //   }
      //   catch(e) {
      //     $scope.team_test.team1.rank = "Error : " + e.message;
      //     $scope.team_ranking_valid = false;
      //   }
      //   try {
      //     $scope.team_test.team2.rank = critFun($scope.team_test.team2.ttp,
      //                                           $scope.team_test.team2.tp,
      //                                           $scope.team_test.team2.sos,
      //                                           $scope.team_test.team2.cp,
      //                                           $scope.team_test.team2.ap,
      //                                           $scope.team_test.n_teams,
      //                                           $scope.team_test.team_size,
      //                                           $scope.team_test.n_rounds,
      //                                           $scope.team_test.n_teams);
      //   }
      //   catch(e) {
      //     $scope.team_test.team2.rank = "Error : " + e.message;
      //     $scope.team_ranking_valid = false;
      //   }
      // }
      // computeTeamTestRankings();
      // $scope.$watch('team_test', function() {
      //   computeTeamTestRankings();
      // }, true);

      $scope.doReset = function(type) {
        if('player' === type) {
          $scope.player_test.ranking = ranking.srPlayerCrit();
        }
      //   if('team' === type) {
      //     $scope.team_test.ranking = ranking.srTeamCrit();
      //       '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap';
      //   }
      };
      $scope.doClose = function(validate) {
        if(validate) {
          if(!$scope.player_ranking_valid) {
            $window.alert('current player ranking is invalid !');
            $scope.pane = 'player';
            return;
          }
      //     if(!$scope.team_ranking_valid) {
      //       $window.alert('current team ranking is invalid !');
      //       $scope.pane = 'team';
      //       return;
      //     }
          $scope.state.ranking.player = $scope.player_test.ranking;
          // $scope.state.ranking.team = $scope.team_test.ranking;
          $scope.storeState();
        }
        $scope.goToState('players');
      };
    }
  ]);
