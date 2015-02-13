'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    'round',
    function($scope,
             round) {
      console.log('init roundsCtrl');

      $scope.round = {};
      $scope.doGameEdit = function(r, p, back, pane) {
        $scope.edit.game = round.gameForPlayer(r, p);
        $scope.edit.back = back;
        $scope.edit.pane = pane;
        $scope.goToState('game_edit');
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
    }
  ])
  .controller('roundsSumCtrl', [
    '$scope',
    'players',
    function($scope,
             players) {
      console.log('init roundsSumCtrl');
      $scope.state.players = players.updateListsPlayed($scope.state.players,
                                                       $scope.state.rounds);
    }
  ])
  .controller('roundsNextCtrl', [
    '$scope',
    'state',
    'round',
    'rounds',
    'srPairing',
    'bracketPairing',
    function($scope,
             state,
             round,
             rounds,
             srPairing,
             bracketPairing) {
      $scope.new_state = _.clone($scope.state);
      console.log('init roundsNextCtrl', $scope.new_state);
      $scope.next_round = rounds.createNextRound($scope.state.players);

      $scope.updatePlayersOptions = function() {
        $scope.players_options = _.map($scope.new_state.players, function(gr, gri) {
          return _.map(gr, function(p) {
            var paired = round.isPlayerPaired($scope.next_round[gri], p);
            var label = paired ? p.name : '> '+p.name;
            return [ p.name, label ];
          });
        });
        $scope.pairs_already = _.map($scope.next_round, function(gr) {
          return _.map(gr, function(g) {
            return rounds.pairAlreadyExists($scope.new_state.rounds, g);
          });
        });
        // console.log('already', $scope.pairs_already);
      };
      $scope.updatePlayersOptions();

      $scope.suggestNextRound = function(i, type) {
        if('bracket' === type) {
          $scope.new_state.bracket = state.setBracket($scope.new_state, i);
          $scope.next_round[i] = bracketPairing.suggestRound($scope.new_state, i);
        }
        if('sr' === type) {
          $scope.new_state.bracket = state.resetBracket($scope.new_state, i);
          $scope.next_round[i] = srPairing.suggestNextRound($scope.new_state, i);
        }
        $scope.updatePlayersOptions();
      };

      $scope.registerNextRound = function() {
        $scope.state.bracket = $scope.new_state.bracket;
        $scope.state.rounds = rounds.registerNextRound($scope.new_state.rounds,
                                                       $scope.next_round);
        $scope.storeState();
        $scope.goToState('rounds.nth', { pane: $scope.state.rounds.length-1 });
      };

      $scope.updateNextRound = function(gr_index, ga_index, key) {
        $scope.next_round[gr_index] =
          round.updatePlayer($scope.next_round[gr_index], ga_index, key);
        $scope.updatePlayersOptions();
      };
    }
  ])
  .controller('roundsNthCtrl', [
    '$scope',
    '$stateParams',
    '$window',
    'rounds',
    function($scope,
             $stateParams,
             $window,
             rounds) {
      console.log('init roundsNthCtrl', $stateParams.pane);
      $scope.round.current = $stateParams.pane;
      $scope.r = $scope.state.rounds[$stateParams.pane];
      if(!_.exists($scope.r)) {
        $scope.goToState('rounds.sum');
      }

      $scope.doDeleteRound = function(r) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.rounds = rounds.drop($scope.state.rounds, parseFloat(r));
          // _.each($scope.state.bracket, function(b, i) {
          //   if(_.exists(b) &&
          //      $scope.state.rounds.length <= b) {
          //     $scope.state.bracket[i] = undefined;
          //   }
          // });
          $scope.updatePoints();
          $scope.storeState();
          $scope.goToState('rounds.sum');
        }
      };
    }
  ]);
