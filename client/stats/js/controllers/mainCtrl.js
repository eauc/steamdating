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
             jsonStringifierService,
             factionsService) {
      console.log('init mainCtrl');

      factionsService.init();

      $scope.goToState = R.bind($state.go, $state);
      $scope.currentState = function() { return $state.current.name; };
      $scope.stateIs = R.bind($state.is, $state);

      $scope.resetState = function() {
        $scope.setState([]);
      };
      $scope.setState = function(st) {
        $scope.state = st;
        $window.localStorage.setItem('srApp_stats',
                                     jsonStringifierService.stringify($scope.state));
        console.log('state', $scope.state);
      };
      $scope.pushState = function(st) {
        $scope.setState(R.sortBy(R.prop('name'), R.append(st, $scope.state)));
      };
      $scope.dropState = function(index) {
        var new_state = R.remove(index, 1, $scope.state);
        $scope.setState(new_state);
      };

      $scope.state = [];
      var storage = $window.localStorage.getItem('srApp_stats');
      if(R.exists(storage) &&
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
