'use strict';

angular.module('srApp.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    'prompt',
    'state',
    'fileExport',
    'fileImport',
    'factions',
    function($scope,
             $q,
             promptService,
             stateService,
             fileExportService,
             fileImportService,
             factionsService) {
      console.log('init fileCtrl');

      $scope.$on('$destroy', function() {
        R.forEach(function(f) {
          fileExportService.cleanup($scope.exports[f].url);
        }, R.keys($scope.exports));
      });

      $scope.updateExports = function() {
        var now = (new Date()).getTime();
        $scope.save = {
          name: 'steamdating_'+now+'.json',
          url: fileExportService.generate('json', $scope.state)
        };
      };
      $scope.updateExports();

      $scope.factions = {};
      $q.when(factionsService.baseFactions())
        .then(function(base_factions) {
          $scope.factions = base_factions;
        });

      $scope.doReset = function() {
        if(stateService.isEmpty($scope.state)) {
          $scope.resetState();
          return;
        }
        promptService.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
            $scope.goToState('players_list');
          });
      };

      $scope.doOpenFile = function(files) {
        console.log('openFile', files);
        fileImportService.read('json', files[0], $scope.factions)
          .then(function(data) {
            var state = data[0];
            var error = data[1];
            $scope.resetState(state);
            $scope['open_result'] = error;
            $scope.goToState('players_ranking');
          }, function(error) {
            $scope['open_result'] = error;
          });
      };

      $scope.doImportFile = function(type, files) {
        console.log('importFile', type, files);
        fileImportService.read(type, files[0], $scope.factions)
          .then(function(data) {
            var players = data[0];
            var error = data[1];
            $q.when(!stateService.isEmpty($scope.state) ?
                    promptService.prompt('confirm', 'You\'ll lose current data.') :
                    true)
              .then(function() {
                $scope.resetState({ players: [players] });
                $scope['import_'+type+'_result'] = error;
                if(R.isEmpty(error)) {
                  $scope.goToState('players_list');
                }
                else {
                  $scope['import_'+type+'_result'].push(players.length+
                                                        ' players have been read successfully');
                  $scope.updateExports();
                }
              });
          }, function(error) {
            $scope['import_'+type+'_result'] = error;
          });
      };
    }
  ]);
