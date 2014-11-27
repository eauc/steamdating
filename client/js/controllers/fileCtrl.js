'use strict';

angular.module('srApp.controllers')
  .controller('fileCtrl', [
    '$scope',
    'backup',
    function($scope,
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
    }
  ]);
