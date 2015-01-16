'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    'players',
    'rounds',
    'round',
    // 'teams',
    // 'pairing',
    function($scope,
             $stateParams,
             $window,
             players,
             rounds,
             round
             // teams,
             // pairing
            ) {
      console.log('init roundsCtrl');

      $scope.pane = $stateParams.pane;

      $scope.state.players = players.updateListsPlayed($scope.state.players,
                                                       $scope.state.rounds);

      $scope.doGameEdit = function(r, p) {
        $scope.edit.game = round.gameForPlayer(r, p);
        $scope.edit.rounds_pane = $scope.pane;
        $scope.goToState('game_edit');
      };

      $scope.doDeleteRound = function(r) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.rounds = rounds.drop($scope.state.rounds, r);
          // _.each($scope.state.bracket, function(b, i) {
          //   if(_.exists(b) &&
          //      $scope.state.rounds.length <= b) {
          //     $scope.state.bracket[i] = undefined;
          //   }
          // });
          $scope.updatePoints();
          $scope.storeState();
          $scope.goToState('rounds', { pane: 'sum' });
        }
      };

      // var nb_games = $scope.isTeamTournament() ?
      //   _.flatten($scope.state.teams).length / 2 :
      //   _.flatten($scope.state.players).length / 2;
      // $scope.doShowAllTables = function(show, event) {
      //   _.chain(nb_games)
      //     .range()
      //     .each(function(i) {
      //       $scope.show['table'+(i+1)] = show;
      //     });
      //   event.stopPropagation();
      // };
      // $scope.doShowTable = function(t, show, event) {
      //   $scope.show['table'+t] = show;
      //   event.stopPropagation();
      // };

      // if($scope.pane >= $scope.state.rounds.length) {
      //   $scope.goToState('rounds', { pane: 'sum' });
      //   return;
      // }


      // function mapRoundsQuery(q) {
      //   $scope[q] = function(p, r) {
      //     return rounds.query($scope.state.rounds, r, p, q);
      //   };
      // }
      // mapRoundsQuery('opponentFor');
      // mapRoundsQuery('successFor');
      // mapRoundsQuery('tableFor');
      // $scope.gameFor = function(p, r) {
      //   return rounds.gameFor($scope.state.rounds, p, r);
      // };
      // function mapRoundsTeamQuery(q) {
      //   $scope[q] = function(t, r) {
      //     return rounds.teamQuery($scope.state.rounds, r, t, q);
      //   };
      // }
      // mapRoundsTeamQuery('opponentForTeam');
      // mapRoundsTeamQuery('successForTeam');
      // mapRoundsTeamQuery('tableForTeam');
      // $scope.gameForTeam = function(t, r) {
      //   return rounds.gameForTeam($scope.state.rounds, t, r);
      // };

      // $scope.round = function(r, i) {
      //   var start_index;
      //   var end_index;
      //   if($scope.isTeamTournament()) {
      //     start_index = _.chain($scope.state.teams)
      //       .slice(0, i)
      //       .flatten()
      //       .value()
      //       .length / 2;
      //     end_index = (start_index +
      //                  $scope.state.teams[i].length / 2);
      //     return _.chain($scope.state.rounds)
      //       .apply(rounds.round, r)
      //       .slice(start_index, end_index)
      //       .value();
      //   }
      //   else {
      //     start_index = _.chain($scope.state.players)
      //       .slice(0, i)
      //       .flatten()
      //       .value()
      //       .length / 2;
      //     end_index = (start_index +
      //                  $scope.state.players[i].length / 2);
      //     return _.chain($scope.state.rounds)
      //       .apply(rounds.round, r)
      //       .slice(start_index, end_index)
      //       .value();
      //   }
      // };

      // if(!$scope.isTeamTournament()) {
        $scope.next_round = rounds.createNextRound($scope.state.players);
      // }
      // else {
      //   $scope.next_round = _.map($scope.state.teams, function(group) {
      //     return _.chain(group.length/2)
      //       .range()
      //       .map(function(i) {
      //         return {
      //           table: i+1,
      //           t1: {
      //             name: null,
      //           },
      //           t2: {
      //             name: null,
      //           }
      //         };
      //       })
      //       .value();
      //   });
      // }
      // $scope.playerNames = function(gr) {
      //   return players.names(gr);
      // };
      // $scope.teamNames = function(gr) {
      //   return teams.names(gr);
      // };
      // $scope.bracket = _.snapshot($scope.state.bracket);
      // var n_groups = ($scope.isTeamTournament() ?
      //                 $scope.state.teams.length :
      //                 $scope.state.players.length);
      // if($scope.bracket.length !== n_groups) {
      //   $scope.bracket = _.repeat(n_groups, undefined);
      // }
      // $scope.suggestNextRound = function(i, bracket_start) {
      //   if(bracket_start) {
      //     if(!_.exists($scope.bracket[i])) {
      //       $scope.bracket[i] = $scope.state.rounds.length;
      //     }
      //   }
      //   else {
      //     if(_.exists($scope.bracket[i])) {
      //       $scope.bracket[i] = undefined;
      //     }
      //   }
      //   $scope.next_round[i] = pairing.suggestRound($scope.state, i, $scope.bracket[i]);
      // };
      $scope.registerNextRound = function() {
        // $scope.state.bracket = $scope.bracket;
        $scope.state.rounds = rounds.registerNextRound($scope.state.rounds,
                                                       $scope.next_round);
        $scope.storeState();
        $scope.goToState('rounds', { pane: $scope.state.rounds.length-1 });
      };
      $scope.updateNextRound = function(gr_index, ga_index, key) {
        $scope.next_round[gr_index] =
          round.updatePlayer($scope.next_round[gr_index], ga_index, key);
      };
    }
  ]);
