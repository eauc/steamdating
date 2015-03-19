'use strict';

angular.module('srApp.controllers')
  .controller('playersListCtrl', [
    '$scope',
    '$state',
    'prompt',
    'state',
    'stateTables',
    'players',
    'player',
    'fileExport',
    function($scope,
             $state,
             promptService,
             stateService,
             stateTablesService,
             playersService,
             playerService,
             fileExportService) {
      console.log('init playersListCtrl', $scope);
      $scope.updatePoints();
      
      function sortPlayers() {
        $scope.sorted_players =
          stateService['sortPlayersBy'+$state.current.data.sort]($scope.state);
      }
      sortPlayers();

      $scope.updateExports = function() {
        var ranking_tables = stateTablesService.rankingTables($scope.state);
        var exports = {
          fk: {
            name: 'players_list.txt',
            url: fileExportService.generate('fk', $scope.state.players),
            label: 'FK players list'
          },
          csv_rank: {
            name: 'players_ranking.csv',
            url: fileExportService.generate('csv', ranking_tables),
            label: 'CSV Ranking'
          },
          bb_rank: {
            name: 'players_ranking.txt',
            url: fileExportService.generate('bb', ranking_tables),
            label: 'BB Ranking'
          }
        };
        $scope.exports = R.pick($state.current.data.exports, exports);
      };
      $scope.updateExports();

      $scope.doEditGroups = function() {
        $scope.edit.back = $state.current.name;
        $scope.goToState('groups_edit');
      };

      $scope.doAddPlayer = function(i) {
        $scope.edit.player = playerService.create();
        $scope.edit.group = i;
        $scope.edit.back = $state.current.name;
        $scope.goToState('player_edit');
      };

      $scope.doDropPlayer = function(do_drop, p, event) {
        R.deepExtend(p, do_drop ?
                     playerService.drop($scope.state.rounds.length, p) :
                     playerService.undrop(p)
                    );
        stateService.store($scope.state);
        event.stopPropagation();
      };

      $scope.doDeletePlayer = function(p, event) {
        promptService.prompt('confirm', 'You sure ?')
          .then(function()  {
            $scope.state.players = playersService.drop(p, $scope.state.players);
            stateService.store($scope.state);
            sortPlayers();
          });
        event.stopPropagation();
      };
    }
  ])
  .controller('playerEditCtrl', [
    '$scope',
    '$q',
    'prompt',
    'factions',
    'players',
    'list',
    'lists',
    function($scope,
             $q,
             promptService,
             factionsService,
             playersService,
             listService,
             listsService) {
      $scope.player = R.clone($scope.edit.player);
      console.log('init playerEditCtrl', $scope.player);

      $q.when(factionsService.baseFactions())
        .then(function(base_factions) {
          $scope.factions = playersService.factions(base_factions,
                                                    $scope.state.players);
        });
      $scope.origins = playersService.origins($scope.state.players);

      $scope.doClose = function(validate) {
        if(validate) {
          if( R.type($scope.player.name) !== 'String' ||
              s.isBlank($scope.player.name)
            ) {
            promptService.prompt('alert', 'invalid player name');
            return;
          }
          var existing_players = playersService.names($scope.state.players);
          if(R.exists($scope.edit.player.name)) {
            existing_players = R.reject(R.eq($scope.edit.player.name), existing_players);
          }
          if(0 <= R.indexOf($scope.player.name, existing_players)) {
            promptService.prompt('alert', 'a player with the same name already exists');
            return;
          }
          if(R.isNil($scope.edit.player.name)) {
            $scope.state.players = playersService.add($scope.edit.group,
                                                      $scope.player,
                                                      $scope.state.players);
          }
          else {
            R.extend($scope.edit.player, $scope.player);
          }
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back);
      };

      $scope.list = R.isEmpty($scope.player.lists) ? -1 : 0;
      $scope.doSwitchToList = function(i) {
        $scope.list = i;
      };
      $scope.doAddList = function() {
        $scope.list = $scope.player.lists.length;
        $scope.player.lists = listsService.add(listService.create({
          faction: $scope.player.faction
        }), $scope.player.lists);
      };
      $scope.doDropList = function(i) {
        $scope.player.lists = listsService.drop(i, $scope.player.lists);
      };
    }
  ]);
