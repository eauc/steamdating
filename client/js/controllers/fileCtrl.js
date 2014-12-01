'use strict';

angular.module('srApp.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$window',
    'backup',
    function($scope,
             $window,
             backup) {
      console.log('init fileCtrl');

      $scope.openFile = function(file) {
        backup.read(file).then(function(data) {
          $scope.newState(data);
          $scope.goToState('players');
        }, function(error) {
          $scope.open_result = error;
        });
      };

      var today = new Date();
      $scope.save_name = 'dating_' + today.getTime() + '.txt';
      $scope.save_url = backup.generate($scope.state);
      $scope.$on('$destroy', function() {
        backup.cleanup($scope.save_url);
      });

      $scope.doReset = function() {
        var conf = ($scope.state.teams.length === 0 &&
                    $scope.state.players.length === 0 &&
                    $scope.state.rounds.length === 0);
        if(!conf) conf = $window.confirm('You sure ?');
        if(conf) $scope.resetState();
      };
    }
  ]);
