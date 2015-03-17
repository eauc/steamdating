'use strict';

angular.module('srAppStats.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    'prompt',
    'fileImport',
    function($scope,
             $q,
             promptService,
             fileImportService) {
      console.log('init fileCtrl');

      $scope.doReset = function() {
        promptService.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
          });
      };

      $scope.doOpenFile = function(files) {
        console.log('openFile', files);
        R.forEach(function(file) {
          fileImportService.read('json', file)
            .then(function(data) {
              var state = data[0];
              var error = data[1];
              $scope.pushState({
                name: file.name,
                state: state
              });
              $scope['open_result'] = error;
            }, function(error) {
              $scope['open_result'] = error;
            });
        }, files);
      };
      $scope.doDropFile = function(index) {
        $scope.dropState(index);
      };
    }
  ]);
