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
             factionsService,
             playersService,
             statsService) {
      console.log('init statsCtrl');

      $scope.panel = 'general';

      $scope.factions = playersService.factions([], $scope.state.players);
      $scope.players = playersService.names($scope.state.players);
      $scope.casters = playersService.casters($scope.state.players);

      $scope.general = statsService.getGeneral($scope.state);
      $scope.stats = {};
      var group;
      $scope.getStats = function() {
        var value = $scope.selection[$scope.selection.type];
        var ret = statsService.get($scope.state,
                                   $scope.selection.type, value,
                                   $scope.selection.group_by,
                                   $scope.stats);
        if(0 > R.indexOf($scope.group, R.map(R.head, ret))) {
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
