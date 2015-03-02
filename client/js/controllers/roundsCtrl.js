'use strict';

angular.module('srApp.controllers')
  .controller('roundsCtrl', [
    '$scope',
    '$state',
    'round',
    function($scope,
             $state,
             round) {
      console.log('init roundsCtrl');

      $scope.round = {};
      $scope.doGameEdit = function(r, p, pane) {
        $scope.edit.game = round.gameForPlayer(r, p);
        $scope.edit.back = $state.current.name;
        $scope.edit.pane = pane;
        $scope.goToState('game_edit');
      };
    }
  ])
  .controller('roundsSumCtrl', [
    '$scope',
    'players',
    'state',
    function($scope,
             players,
             state) {
      console.log('init roundsSumCtrl');
      $scope.state.players = players.updateListsPlayed($scope.state.players,
                                                       $scope.state.rounds);
      $scope.sorted_players = state.sortPlayersByName($scope.state);
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
    function($scope,
             state,
             round,
             rounds,
             players,
             srPairing,
             bracketPairing) {
      $scope.new_state = _.clone($scope.state);
      console.log('init roundsNextCtrl', $scope.new_state);
      $scope.previous_round_complete = rounds.lastRoundIsComplete($scope.new_state.rounds);
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
        $scope.tables_ranges = _.map($scope.new_state.players, function(group, group_index) {
          return players.tableRangeForGroup($scope.new_state.players, group_index);
        });
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

      $scope.updatePlayer = function(gr_index, ga_index, key) {
        $scope.next_round[gr_index] =
          round.updatePlayer($scope.next_round[gr_index], ga_index, key);
        $scope.updatePlayersOptions();
      };
      $scope.updateTable = function(gr_index, ga_index) {
        $scope.next_round[gr_index] =
          round.updateTable($scope.next_round[gr_index], ga_index,
                            _.min($scope.tables_ranges[gr_index]));
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
             prompt,
             rounds,
             fileExport,
             state) {
      console.log('init roundsNthCtrl', $stateParams.pane);
      $scope.round.current = parseFloat($stateParams.pane);
      $scope.r = $scope.state.rounds[$scope.round.current];
      if(!_.exists($scope.r)) {
        $scope.goToState('rounds.sum');
        return;
      }

      $scope.updateExports = function() {
        $scope.exports = {
          csv: {
            name: 'round_'+($scope.round.current+1)+'.csv',
            url: fileExport.generate('csv', state.roundTables($scope.state, $scope.round.current)),
            label: 'CSV Round'
          },
          bb: {
            name: 'round_'+($scope.round.current+1)+'.txt',
            url: fileExport.generate('bb', state.roundTables($scope.state, $scope.round.current)),
            label: 'BBCode Round'
          }
        };
      };
      $scope.updateExports();
      
      $scope.doDeleteRound = function(r) {
        prompt.prompt('confirm', 'You sure ?')
          .then(function() {
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
          });
      };
    }
  ]);
