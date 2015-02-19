'use strict';

angular.module('srAppStats.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$window',
    'jsonStringifier',
    'factions',
    function($scope,
             $state,
             $window,
             jsonStringifier,
             factions
            ) {
      console.log('init mainCtrl');

      factions.init();

      $scope.goToState = _.bind($state.go, $state);
      $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');
      $scope.stateIs = _.bind($state.is, $state);

      $scope.resetState = function() {
        $scope.setState([]);
      };
      $scope.setState = function(st) {
        $scope.state = st;
        $window.localStorage.setItem('srApp_stats',
                                     jsonStringifier.stringify($scope.state));
        console.log('state', $scope.state);
      };
      $scope.pushState = function(st) {
        $scope.setState(_.cat($scope.state, [st]));
      };
      $scope.dropState = function(index) {
        var new_state = _.clone($scope.state);
        new_state.splice(index, 1);
        $scope.setState(new_state);
      };

      $scope.state = [];
      var storage = $window.localStorage.getItem('srApp_stats');
      if(_.exists(storage) &&
         !s.isBlank(storage)) {
        try {
          $scope.setState(JSON.parse(storage));
        }
        catch (err) {
          console.log('JSON parse storage', err);
          $scope.state = [];
        }
      }
    }
  ]);
