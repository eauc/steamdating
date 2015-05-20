'use strict';

angular.module('srAppStats.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    '$http',
    'prompt',
    'fileImport',
    'state',
    function($scope,
             $q,
             $http,
             promptService,
             fileImportService,
             stateService) {
      console.log('init fileCtrl');

      $scope.doReset = function() {
        promptService.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
          });
      };

      $http.get('/data/results.json')
        .then(function(response) {
          $scope.server_results = response.data;
        });

      $scope.doLoadFromServer = function doLoadFromServer(index) {
        var desc = R.nth(index, $scope.server_results);
        if(R.isNil(desc)) return;
        $http.get(desc.url)
          .then(function(response) {
            $scope.server_results[index].loaded = true;
            $scope.pushState({
              name: desc.name,
              state: stateService.create(response.data),
              from_server: index
            });
          });
      };

      $scope.doOpenFile = function(files) {
        console.log('openFile', files);
        R.forEach(function(file) {
          fileImportService.read('json', file)
            .then(function(data) {
              var state = stateService.create(data[0]);
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
        if(R.exists($scope.state[index].from_server)) {
          $scope.server_results[$scope.state[index].from_server].loaded = false;
        }
        $scope.dropState(index);
      };
    }
  ]);
