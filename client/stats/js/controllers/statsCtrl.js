'use strict';

angular.module('srAppStats.controllers')
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

      $scope.factions = _.chain($scope.state)
        .map(function(s) {
          return players.factions(s.state.players);
        })
        .flatten()
        .uniq()
        .sortBy(_.identity)
        .value();
      console.log('factions', $scope.factions);
      $scope.players = _.chain($scope.state)
        .map(function(s) {
          return players.names(s.state.players);
        })
        .flatten()
        .uniq()
        .sortBy(_.identity)
        .value();
      console.log('players', $scope.players);
      $scope.casters = _.chain($scope.state)
        .map(function(s) {
          return players.casters(s.state.players);
        })
        .flatten(true)
        .uniq(function(c) { return c.name; })
        .apply(function(cs) {
          return cs.sort(function(a, b) {
            if(a.faction !== b.faction) return a.faction.localeCompare(b.faction);
            return a.name.localeCompare(b.name);
          });
        })
        .value();
      console.log('casters', $scope.casters);

      $scope.stats = {};
      var group;
      $scope.getStats = function() {
        console.log('getStats');
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
