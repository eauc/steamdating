'use strict';

angular.module('srAppStats.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    '$http',
    '$window',
    'prompt',
    'fileImport',
    'fileExport',
    'state',
    function($scope,
             $q,
             $http,
             $window,
             promptService,
             fileImportService,
             fileExportService,
             stateService) {
      console.log('init fileCtrl');

      $scope.doReset = function() {
        promptService.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
            $scope.server_results = R.map(function(desc) {
              return R.assoc('loaded', false, desc);
            }, $scope.server_results);
          });
      };

      $http.get('/data/results.json')
        .then(function(response) {
          $scope.server_results = R.map(function(desc) {
            if(R.find(R.propEq('name', desc.name), $scope.state)) {
              return R.assoc('loaded', true, desc);
            }
            return desc;
          }, response.data);
        });

      $scope.selection = {};
      $scope.hasSelection = function hasSelection(sel) {
        return R.exists($scope.selection[sel]);
      };

      $scope.state_export = {};
      $scope.doStateSelection = function doStateSelection(index) {
        if($scope.selection.state === index) {
          $scope.doDropFile(index);
          return;
        }
        $scope.selection.state = index;
        fileExportService.cleanup($scope.state_export.url);
        $scope.state_export.name = $scope.state[index].name+'.json';
        $scope.state_export.url = fileExportService.generate('json',
                                                             $scope.state[index].state);
      };
      $scope.doLoadInSteamDating = function doLoadInSteamDating(index) {
        promptService.prompt('confirm',
                             'You\'ll lose all data currently loaded in SteamDating.')
          .then(function() {
            stateService.store($scope.state[index].state);
            $window.location.href = '/index.html';
          });
      };
      
      $scope.doServerSelection = function doServerSelection(index) {
        if($scope.selection.server === index) {
          $scope.doLoadFromServer(index);
          return;
        }
        $scope.selection.server = index;
      };
      $scope.doLoadFromServer = function doLoadFromServer(index) {
        var desc = R.nth(index, $scope.server_results);
        if(R.isNil(desc)) return;
        if(desc.loaded) return;
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
