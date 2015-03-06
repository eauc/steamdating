'use strict';

angular.module('srApp.controllers')
  .controller('playersListCtrl', [
    '$scope',
    'prompt',
    'state',
    '$state',
    'players',
    'player',
    'fileExport',
    function($scope,
             prompt,
             state,
             $state,
             players,
             player,
             fileExport) {
      console.log('init playersListCtrl', $scope);
      $scope.updatePoints();
      
      function sortPlayers() {
        $scope.sorted_players =
          state['sortPlayersBy'+$state.current.data.sort]($scope.state);
      }
      sortPlayers();

      $scope.updateExports = function() {
        var exports = {
          fk: {
            name: 'players_list.txt',
            url: fileExport.generate('fk', $scope.state.players),
            label: 'FK players list'
          },
          csv_rank: {
            name: 'players_ranking.csv',
            url: fileExport.generate('csv', state.rankingTables($scope.state)),
            label: 'CSV Ranking'
          },
          bb_rank: {
            name: 'players_ranking.txt',
            url: fileExport.generate('bb', state.rankingTables($scope.state)),
            label: 'BB Ranking'
          }
        };
        $scope.exports = _.pick(exports, $state.current.data.exports);
      };
      $scope.updateExports();

      $scope.doEditGroups = function() {
        $scope.edit.back = $state.current.name;
        $scope.goToState('groups_edit');
      };

      $scope.doAddPlayer = function(i) {
        $scope.edit.player = player.create();
        $scope.edit.group = i;
        $scope.edit.back = $state.current.name;
        $scope.goToState('player_edit');
      };

      $scope.doDropPlayer = function(p, event) {
        prompt.prompt('confirm', 'You sure ?')
          .then(function()  {
            $scope.state.players = players.drop($scope.state.players, p);
            state.store($scope.state);
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
    'state',
    'players',
    // 'player',
    'list',
    'lists',
    function($scope,
             $q,
             prompt,
             factions,
             state,
             players,
             // player,
             list,
             lists
            ) {
      $scope.player = _.clone($scope.edit.player);
      console.log('init playerEditCtrl', $scope.player);

      $q.when(factions.baseFactions()).then(function(base_factions) {
        $scope.factions = players.factions($scope.state.players,
                                           base_factions);
      });
      $scope.origins = players.origins($scope.state.players);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!_.isString($scope.player.name) ||
             0 >= $scope.player.name) {
            prompt.prompt('alert', 'invalid player name');
            return;
          }
          var existing_players = players.names($scope.state.players);
          if(_.exists($scope.edit.player.name)) {
            existing_players = _.without(existing_players, $scope.edit.player.name);
          }
          if(0 <= _.indexOf(existing_players, $scope.player.name)) {
            prompt.prompt('alert', 'a player with the same name already exists');
            return;
          }
          if(!_.exists($scope.edit.player.name)) {
            $scope.state.players = players.add($scope.state.players,
                                               $scope.player,
                                               $scope.edit.group);
          }
          else {
            _.extend($scope.edit.player, $scope.player);
          }
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back);
      };

      $scope.list = $scope.player.lists.length === 0 ? -1 : 0;
      $scope.doSwitchToList = function(i) {
        $scope.list = i;
      };
      $scope.doAddList = function() {
        $scope.list = $scope.player.lists.length;
        $scope.player.lists = lists.add($scope.player.lists,
                                        list.create({ faction: $scope.player.faction }));
      };
      $scope.doDropList = function(i) {
        $scope.player.lists = lists.drop($scope.player.lists, i);
      };
    }
  ]);
