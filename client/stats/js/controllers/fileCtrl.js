'use strict';

angular.module('srAppStats.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    'prompt',
    'fileImport',
    function($scope,
             $q,
             prompt,
             fileImport
            ) {
      console.log('init fileCtrl');

      $scope.doReset = function() {
        prompt.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
          });
      };

      $scope.doOpenFile = function(files) {
        console.log('openFile', files);
        _.each(files, function(file) {
          fileImport.read('json', file)
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
        });
      };
      $scope.doDropFile = function(index) {
        $scope.dropState(index);
      };
    }
  ]);
