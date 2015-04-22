'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    '$state',
    'round',
    function($scope,
             $state,
             roundService) {
      console.log('init roundsCtrl');

      $scope.round = {};
      $scope.doGameEdit = function(r, p, pane) {
        $scope.edit.game = roundService.gameForPlayer(p, r);
        $scope.edit.back = $state.current.name;
        $scope.edit.pane = pane;
        $scope.goToState('game_edit');
      };
    }
  ])
  .controller('roundsSumCtrl', [
    '$scope',
    'players',
    'round',
    'state',
    'stateTables',
    'fileExport',
    function($scope,
             playersService,
             roundService,
             stateService,
             stateTablesService,
             fileExportService) {
      console.log('init roundsSumCtrl', $scope);
      $scope.state.players = playersService.updateListsPlayed($scope.state.rounds,
                                                              $scope.state.players);
      $scope.sorted_players = stateService.sortPlayersByName($scope.state);
      $scope.games_by_players = playersService.gamesForRounds($scope.state.rounds,
                                                              $scope.sorted_players);
      
      $scope.updateExports = function() {
        var summary_tables = stateTablesService.roundsSummaryTables($scope.state);
        $scope.exports = {
          csv: {
            name: 'rounds_summary.csv',
            url: fileExportService
              .generate('csv', summary_tables),
            label: 'CSV Rounds Summary'
          },
          bb: {
            name: 'rounds_summary.txt',
            url: fileExportService
              .generate('bb', summary_tables),
            label: 'BBCode Rounds Summary'
          }
        };
      };
      $scope.updateExports();
    }
  ])
  .controller('roundsNextCtrl', [
    '$scope',
    'state',
    'round',
    'rounds',
    'players',
    'srPairing',
    'bracketPairing',
    'games',
    function($scope,
             stateService,
             roundService,
             roundsService,
             playersService,
             srPairingService,
             bracketPairingService,
             gamesService) {
      $scope.new_state = R.clone($scope.state);
      $scope.previous_round_complete = roundsService.lastRoundIsComplete($scope.new_state.rounds);
      $scope.next_round = stateService.createNextRound($scope.state);
      console.log('init roundsNextCtrl', $scope.new_state);
      
      var player_rank_pairs = stateService.playerRankPairs($scope.new_state);
      $scope.updatePlayersOptions = function() {
        $scope.players_options = R.pipe(
          stateService.playersNotDropedInLastRound,
          R.mapIndexed(function(gr, gri) {
            return R.map(function(p) {
              var paired = R.pipe(
                roundService.gamesForGroup$(gri),
                gamesService.isPlayerPaired$(p)
              )($scope.next_round);
              var label = paired ? p.name : '> '+p.name;
              label += ' #'+(player_rank_pairs[gri][p.name] || '??');
              return [ p.name, label ];
            }, gr);
          })
        )($scope.new_state);
        $scope.round_fitness = stateService.evaluateRoundFitness($scope.next_round,
                                                                 $scope.new_state);
        $scope.tables_ranges = R.pipe(
          stateService.playersNotDropedInLastRound,
          R.mapIndexed(function(group, group_index) {
            return R.pipe(
              stateService.playersNotDropedInLastRound,
              playersService.tableRangeForGroup$(group_index)
            )($scope.new_state);
          })
        )($scope.new_state);
        console.log('next_round', $scope.next_round);
      };
      $scope.updatePlayersOptions();

      $scope.suggestNextRound = function(i, type) {
        if('bracket' === type) {
          var previous_bracket = roundService.bracketForGroup(i, R.last($scope.new_state.rounds));
          $scope.next_round = roundService.setBracketForGroup(i,
                                                              previous_bracket,
                                                              $scope.next_round);
          $scope.next_round = bracketPairingService.suggestRound($scope.new_state,
                                                                 i,
                                                                 $scope.next_round);
        }
        if('sr' === type) {
          $scope.next_round = roundService.resetBracketForGroup(i, $scope.next_round);
          $scope.next_round = srPairingService.suggestNextRound($scope.new_state,
                                                                i,
                                                                $scope.next_round);
        }
        $scope.updatePlayersOptions();
      };

      $scope.registerNextRound = function() {
        $scope.state.bracket = $scope.new_state.bracket;
        $scope.state.rounds = roundsService.registerNextRound($scope.next_round,
                                                              $scope.new_state.rounds);
        $scope.storeState();
        $scope.goToState('rounds.nth', { pane: $scope.state.rounds.length-1 });
      };

      $scope.updatePlayer = function(gr_index, ga_index, key) {
        $scope.next_round.games[gr_index] =
          gamesService.updatePlayer(ga_index, key, $scope.next_round.games[gr_index]);
        $scope.updatePlayersOptions();
      };
      $scope.updateTable = function(gr_index, ga_index) {
        $scope.next_round.games[gr_index] =
          gamesService.updateTable(ga_index, R.min($scope.tables_ranges[gr_index]),
                                   $scope.next_round.games[gr_index]);
        $scope.updatePlayersOptions();
      };
    }
  ])
  .controller('roundsNthCtrl', [
    '$scope',
    '$stateParams',
    '$location',
    'prompt',
    'round',
    'rounds',
    'fileExport',
    'state',
    'stateTables',
    function($scope,
             $stateParams,
             $location,
             promptService,
             roundService,
             roundsService,
             fileExportService,
             stateService,
             stateTablesService) {
      console.log('init roundsNthCtrl', $stateParams.pane, $scope.state);
      $scope.round.current = parseFloat($stateParams.pane);
      $scope.r = $scope.state.rounds[$scope.round.current];
      if(R.isNil($scope.r)) {
        $scope.goToState('rounds.sum');
        return;
      }

      $scope.updateExports = function() {
        var round_tables = stateTablesService.roundTables($scope.round.current,
                                                          $scope.state);
        $scope.exports = {
          csv: {
            name: 'round_'+($scope.round.current+1)+'.csv',
            url: fileExportService
              .generate('csv', round_tables),
            label: 'CSV Round'
          },
          bb: {
            name: 'round_'+($scope.round.current+1)+'.txt',
            url: fileExportService
              .generate('bb', round_tables),
            label: 'BBCode Round'
          }
        };
      };
      $scope.updateExports();
      
      $scope.doDeleteRound = function(r) {
        promptService.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.state.rounds = roundsService.drop(parseFloat(r), $scope.state.rounds);
            $scope.updatePoints();
            $scope.storeState();
            $scope.goToState('rounds.sum');
          });
      };

      $scope.doRandomRound = function() {
        $scope.state.rounds[$scope.round.current] =
          roundService.random($scope.state.rounds[$scope.round.current]);
        $scope.storeState();
        $location.reload();
      };
    }
  ]);
