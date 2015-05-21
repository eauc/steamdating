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
             factionsService,
             playersService,
             statsService) {
      console.log('init statsCtrl');

      $scope.panel = 'general';

      $scope.factions = R.pipe(
        R.chain(function(s) {
          return playersService.factions(null, s.state.players);
        }),
        R.uniq,
        R.sortBy(R.identity)
      )($scope.state);
      $scope.players = R.pipe(
        R.chain(function(s) {
          return playersService.names(s.state.players);
        }),
        R.uniq,
        R.sortBy(R.identity)
      )($scope.state);
      $scope.casters = R.pipe(
        R.chain(function(s) {
          return playersService.casters(s.state.players);
        }),
        R.uniqWith(R.useWith(R.eq, R.prop('name'), R.prop('name'))),
        function(cs) {
          return cs.sort(function(a, b) {
            if(a.faction !== b.faction) return a.faction.localeCompare(b.faction);
            return a.name.localeCompare(b.name);
          });
        }
      )($scope.state);

      $scope.general = statsService.getGeneral($scope.state);
      $scope.stats = {};
      var group;
      $scope.getStats = function() {
        var value = $scope.selection[$scope.selection.type];
        var ret = statsService.get($scope.state,
                                   $scope.selection.type, value,
                                   $scope.selection.group_by,
                                   $scope.stats);
        if(0 > R.indexOf($scope.group, R.map(R.head, ret)) &&
           R.exists(ret[0]) &&
           !R.isEmpty(ret[0])) {
          $scope.group = ret[0][0];
        }
        return ret;
      };

      $scope.selection = {
        type: 'faction',
        // type: 'player',
        // type: 'caster',
        group_by: 'total',
        faction: R.head($scope.factions),
        player: R.head($scope.players),
        caster: R.prop('name', R.defaultTo({}, R.head($scope.casters))),
      };
      $scope.setGroup = function(gr) {
        $scope.group = gr;
      };
    }
  ]);
