'use strict';

angular.module('srApp.controllers')
  .controller('statsCtrl', [
    '$scope',
    '$q',
    'factions',
    'players',
    'stats',
    function($scope,
             $q,
             factions,
             players,
             stats) {
      console.log('init statsCtrl');

      $scope.factions = players.factions($scope.state.players);
      console.log('factions', $scope.factions);
      $scope.players = players.names($scope.state.players);
      console.log('players', $scope.players);
      $scope.casters = players.casters($scope.state.players);
      console.log('casters', $scope.casters);

      $scope.stats = {};
      var group;
      $scope.getStats = function() {
        var value = $scope.selection[$scope.selection.type];
        var ret = stats.get($scope.state,
                            $scope.selection.type, value,
                            $scope.selection.group_by,
                            $scope.stats);
        if(_.indexOf(_.mapWith(ret, _.first), $scope.group) < 0) {
          $scope.group = ret[0][0];
        }
        return ret;
      };

      $scope.selection = {
        type: 'faction',
        // type: 'player',
        // type: 'caster',
        group_by: 'total',
        faction: $scope.factions[0],
        player: $scope.players[0],
        caster: $scope.casters[0].name,
      };
      $scope.setGroup = function(gr) {
        $scope.group = gr;
      };
    }
  ]);
