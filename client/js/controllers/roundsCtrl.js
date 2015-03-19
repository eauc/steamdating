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
    'fileExport',
    function($scope,
             playersService,
             roundService,
             stateService,
             fileExportService) {
      console.log('init roundsSumCtrl', $scope);
      $scope.state.players = playersService.updateListsPlayed($scope.state.rounds,
                                                              $scope.state.players);
      $scope.sorted_players = stateService.sortPlayersByName($scope.state);
      $scope.games_by_players = playersService.gamesForRounds($scope.state.rounds,
                                                              $scope.sorted_players);
      
      $scope.updateExports = function() {
        $scope.exports = {
          csv: {
            name: 'rounds_summary.csv',
            url: fileExportService
              .generate('csv', stateService.roundsSummaryTables($scope.state)),
            label: 'CSV Rounds Summary'
          },
          bb: {
            name: 'rounds_summary.txt',
            url: fileExportService
              .generate('bb', stateService.roundsSummaryTables($scope.state)),
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
    'bracket',
    'round',
    'rounds',
    'players',
    'srPairing',
    'bracketPairing',
    function($scope,
             stateService,
             bracketService,
             roundService,
             roundsService,
             playersService,
             srPairingService,
             bracketPairingService) {
      $scope.new_state = R.clone($scope.state);
      console.log('init roundsNextCtrl', $scope.new_state);
      $scope.previous_round_complete = roundsService.lastRoundIsComplete($scope.new_state.rounds);
      $scope.next_round = stateService.createNextRound($scope.state);

      $scope.updatePlayersOptions = function() {
        $scope.players_options = R.pipe(
          stateService.playersNotDropedInLastRound,
          R.mapIndexed(function(gr, gri) {
            return R.map(function(p) {
              var paired = roundService.isPlayerPaired(p, $scope.next_round[gri]);
              var label = paired ? p.name : '> '+p.name;
              return [ p.name, label ];
            }, gr);
          })
        )($scope.new_state);
        $scope.pairs_already = R.map(function(gr) {
          return R.map(R.flip(roundsService.pairAlreadyExists)($scope.new_state.rounds),
                       gr);
        }, $scope.next_round);
        $scope.tables_ranges = R.pipe(
          stateService.playersNotDropedInLastRound,
          R.mapIndexed(function(group, group_index) {
            return R.pipe(
              stateService.playersNotDropedInLastRound,
              playersService.tableRangeForGroup$(group_index)
            )($scope.new_state);
          })
        )($scope.new_state);
      };
      $scope.updatePlayersOptions();

      $scope.suggestNextRound = function(i, type) {
        if('bracket' === type) {
          $scope.new_state.bracket = bracketService.set(i, $scope.new_state.bracket);
          $scope.next_round[i] = bracketPairingService.suggestRound($scope.new_state, i);
        }
        if('sr' === type) {
          $scope.new_state.bracket = bracketService.reset(i, $scope.new_state.bracket);
          $scope.next_round[i] = srPairingService.suggestNextRound($scope.new_state, i);
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
        $scope.next_round[gr_index] =
          roundService.updatePlayer(ga_index, key, $scope.next_round[gr_index]);
        $scope.updatePlayersOptions();
      };
      $scope.updateTable = function(gr_index, ga_index) {
        $scope.next_round[gr_index] =
          roundService.updateTable(ga_index, R.min($scope.tables_ranges[gr_index]),
                                   $scope.next_round[gr_index]);
        $scope.updatePlayersOptions();
      };
    }
  ])
  .controller('roundsNthCtrl', [
    '$scope',
    '$stateParams',
    'prompt',
    'rounds',
    'fileExport',
    'state',
    function($scope,
             $stateParams,
             promptService,
             roundsService,
             fileExportService,
             stateService) {
      console.log('init roundsNthCtrl', $stateParams.pane);
      $scope.round.current = parseFloat($stateParams.pane);
      $scope.r = $scope.state.rounds[$scope.round.current];
      if(R.isNil($scope.r)) {
        $scope.goToState('rounds.sum');
        return;
      }

      $scope.updateExports = function() {
        $scope.exports = {
          csv: {
            name: 'round_'+($scope.round.current+1)+'.csv',
            url: fileExportService
              .generate('csv', stateService.roundTables($scope.round.current,
                                                        $scope.state)),
            label: 'CSV Round'
          },
          bb: {
            name: 'round_'+($scope.round.current+1)+'.txt',
            url: fileExportService
              .generate('bb', stateService.roundTables($scope.round.current,
                                                       $scope.state)),
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
    }
  ]);
