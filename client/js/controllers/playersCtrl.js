'use strict';

angular.module('srApp.controllers')
  .controller('playersCtrl', [
    '$scope',
    '$window',
    'state',
    // '$state',
    'players',
    'player',
    // 'team',
    // 'teams',
    function($scope,
             $window,
             state,
             // $state,
             players,
             player
             // team,
             // teams
            ) {
      console.log('init playersCtrl');

      $scope.doAddPlayer = function(i) {
        $scope.edit.player = player.create();
        // $scope.edit.group = $scope.isTeamTournament() ? 0 : i;
        $scope.edit.group = i;
        $scope.goToState('player_edit');
      };
      // $scope.doAddTeam = function(i) {
      //   $scope.edit.team = team.create();
      //   $scope.edit.group = i;
      //   $scope.goToState('team_edit');
      // };

      $scope.doDropPlayer = function(p, event) {
        var conf = $window.confirm("You sure ?");
        if(conf) {
          $scope.state.players = players.drop($scope.state.players, p);
          state.store($scope.state);
          $scope.sorted_players = state.sortPlayers($scope.state);
        }
        event.stopPropagation();
      };
      // $scope.doDeleteTeam = function(t, event) {
      //   var conf = $window.confirm("You sure ?");
      //   if(conf) {
      //     $scope.state.teams = teams.drop($scope.state.teams, t);
      //     $scope.state.players = players.dropTeam($scope.state.players,
      //                                             t.name);
      //     $scope.storeState();
      //   }
      //   event.stopPropagation();
      // };

      // $scope.chunkGroups = function() {
      //   var chunk_size = NaN;
      //   while(isNaN(chunk_size)) {
      //     var size = $window.prompt('Groups size');
      //     if(null === size) {
      //       return;
      //     }
      //     chunk_size = parseFloat(size);
      //   }
      //   chunk_size = chunk_size >> 0;
      //   var n_groups = 1;
      //   if($scope.isTeamTournament()) {
      //     $scope.state.teams = _.chain($scope.state.teams)
      //       .apply(teams.sort, $scope.state)
      //       .apply(teams.chunk, chunk_size)
      //       .value();
      //     n_groups = $scope.state.teams.length;
      //   }
      //   else {
      //     $scope.state.players = _.chain($scope.state.players)
      //       .apply(players.sort, $scope.state)
      //       .apply(players.chunk, chunk_size)
      //       .value();
      //     n_groups = $scope.state.teams.length;
      //   }
      //   $scope.state.bracket = _.repeat(n_groups, undefined);
      //   $scope.storeState();
      // };
      $scope.sorted_players = state.sortPlayers($scope.state);
    }
  ])
  .controller('playerEditCtrl', [
    '$scope',
    '$q',
    '$window',
    'factions',
    'state',
    'players',
    // 'player',
    'list',
    'lists',
    function($scope,
             $q,
             $window,
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
      $scope.cities = players.cities($scope.state.players);

      $scope.doClose = function(validate) {
        if(validate) {
          if(!_.isString($scope.player.name) ||
             0 >= $scope.player.name) {
            $window.alert('invalid player name');
            return;
          }
        //   if($scope.isTeamTournament() &&
        //      (!_.isString($scope.player.team) ||
        //       0 >= $scope.player.team)) {
        //     $window.alert('invalid player team');
        //     return;
        //   }
          var existing_players = players.names($scope.state.players);
          if(_.exists($scope.edit.player.name)) {
            existing_players = _.without(existing_players, $scope.edit.player.name);
          }
          if(0 <= _.indexOf(existing_players, $scope.player.name)) {
            $window.alert('a player with the same name already exists');
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
        $scope.goToState('players');
      };

      $scope.list = $scope.player.lists.length === 0 ? -1 : 0;
      $scope.doSwitchToList = function(i) {
        $scope.list = i;
      };
      $scope.doAddList = function() {
        $scope.list = $scope.player.lists.length;
        $scope.player.lists = lists.add($scope.player.lists,
                                        list.create($scope.player.faction));
      };
      $scope.doDropList = function(i) {
        $scope.player.lists = lists.drop($scope.player.lists, i);
      };
    }
  ]);
