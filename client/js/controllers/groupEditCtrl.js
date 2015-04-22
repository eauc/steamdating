'use strict';

angular.module('srApp.controllers')
  .controller('groupEditCtrl', [
    '$scope',
    'prompt',
    'players',
    'state',
    function($scope,
             promptService,
             playersService,
             stateService) {
      $scope.new_state = R.assoc('players',
                                 R.pipe(
                                   stateService.sortPlayersByRank,
                                   R.map(function(gr) {
                                     return R.pipe(
                                       R.map(R.prop('players')),
                                       R.flatten
                                     )(gr);
                                   })
                                 )($scope.state),
                                 $scope.state);
      console.log('init groupEditCtrl', $scope.new_state);

      $scope.selection= {};
      $scope.isSelectionEmpty = function() {
        return !R.pipe(
          R.values,
          R.any(R.identity)
        )($scope.selection);
      };

      $scope.chunkGroups = function() {
        promptService.prompt('prompt', 'Groups size')
          .then(function(value) {
            var size = parseFloat(value);
            if(R.eq(NaN, size)) return;
            
            $scope.new_state.players = playersService.chunkGroups(parseFloat(size),
                                                                  $scope.new_state.players);
          });
      };
      $scope.splitSelection = function() {
        var ps = R.reduce(function(mem, name) {
          return ( $scope.selection[name] ?
                   R.append(name, mem) :
                   mem
                 );
        }, [], R.keys($scope.selection));
        
        $scope.new_state.players = playersService.splitNewGroup(ps, $scope.new_state.players);
      };
      $scope.moveSelectionFront = function() {
        var ps = R.reduce(function(mem, name) {
          return ( $scope.selection[name] ?
                   R.append(name, mem) :
                   mem
                 );
        }, [], R.keys($scope.selection));

        R.forEach(function(p) {
          $scope.new_state.players = playersService.movePlayerGroupFront(p, $scope.new_state.players);
        }, ps);
      };
      $scope.moveSelectionBack = function() {
        var ps = R.reduce(function(mem, name) {
          return ( $scope.selection[name] ?
                   R.append(name, mem) :
                   mem
                 );
        }, [], R.keys($scope.selection));

        R.forEach(function(p) {
          $scope.new_state.players = playersService.movePlayerGroupBack(p, $scope.new_state.players);
        }, ps);
      };
      $scope.moveGroupFront = function(gr) {
        $scope.new_state.players = playersService.moveGroupFront(gr, $scope.new_state.players);
      };
      $scope.moveGroupBack = function(gr) {
        $scope.new_state.players = playersService.moveGroupBack(gr, $scope.new_state.players);
      };

      $scope.doClose = function(validate) {
        if(validate) {
          $scope.state.players = $scope.new_state.players;
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState(R.defaultTo('players_list', $scope.edit.back));
      };
    }
  ]);
