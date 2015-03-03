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
    // 'backup',
    // 'exporter',
    function($scope,
             $q,
             prompt,
             state,
             fileExport,
             fileImport,
             factions
             // backup,
             // exporter
            ) {
      console.log('init fileCtrl');

      $scope.$on('$destroy', function() {
        _.each($scope.exports, function(f) {
          fileExport.cleanup(f.url);
        });
      });

      $scope.updateExports = function() {
        var now = (new Date()).getTime();
        $scope.save = {
          name: 'steamdating_'+now+'.json',
          url: fileExport.generate('json', $scope.state)
        };
      };
      $scope.updateExports();

      $scope.factions = {};
      $q.when(factions.baseFactions())
        .then(function(base_factions) {
          $scope.factions = base_factions;
        });

      $scope.doReset = function() {
        if(state.isEmpty($scope.state)) {
          $scope.resetState();
          return;
        }
        prompt.prompt('confirm', 'You sure ?')
          .then(function() {
            $scope.resetState();
            $scope.goToState('players_list');
          });
      };

      $scope.doOpenFile = function(files) {
        console.log('openFile', files);
        fileImport.read('json', files[0], $scope.factions)
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
        fileImport.read(type, files[0], $scope.factions)
          .then(function(data) {
            var players = data[0];
            var error = data[1];
            $q.when(!state.isEmpty($scope.state) ?
                    prompt.prompt('confirm', 'You\'ll lose current data.') :
                    true)
              .then(function() {
                $scope.resetState({ players: [players] });
                $scope['import_'+type+'_result'] = error;
                if(_.isEmpty(error)) {
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
