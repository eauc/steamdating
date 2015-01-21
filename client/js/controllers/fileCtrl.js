'use strict';

angular.module('srApp.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    '$window',
    'state',
    'fileImport',
    'factions',
    // 'backup',
    // 'exporter',
    function($scope,
             $q,
             $window,
             state,
             fileImport,
             factions
             // backup,
             // exporter
            ) {
      console.log('init fileCtrl');

      // $scope.openFile = function(file) {
      //   backup.read(file).then(function(data) {
      //     $scope.newState(data);
      //     $scope.goToState('players');
      //   }, function(error) {
      //     $scope.open_result = error;
      //   });
      // };

      // var today = new Date();

      // $scope.save_name = 'dating_' + today.getTime() + '.txt';
      // $scope.save_url = backup.generate($scope.state);

      // $scope.csv_name = 'dating_' + today.getTime() + '.csv';
      // $scope.csv_url = exporter.generate('csv', $scope.state);

      // $scope.bb_name = 'dating_' + today.getTime() + '.txt';
      // $scope.bb_url = exporter.generate('bb', $scope.state);

      // $scope.$on('$destroy', function() {
      //   backup.cleanup($scope.save_url);
      //   backup.cleanup($scope.csv_url);
      //   backup.cleanup($scope.bb_url);
      // });

      $scope.factions = {};
      $q.when(factions.baseFactions())
        .then(function(base_factions) {
          $scope.factions = base_factions;
        });

      $scope.doReset = function() {
        var conf = state.isEmpty($scope.state);
        if(!conf) conf = $window.confirm('You sure ?');
        if(conf) $scope.resetState();
      };

      $scope.doImportFile = function(type, file) {
        console.log('importFile', type, file);
        fileImport.read(type, file, $scope.factions)
          .then(function(data) {
            var players = data[0];
            var error = data[1];
            $scope.resetState({ players: [players] });
            $scope['import_'+type+'_result'] = error;
            if(_.isEmpty(error)) {
              $scope.goToState('players');
            }
            else {
              $scope['import_'+type+'_result'].push(players.length+
                                                    ' players have been read successfully');
            }
          }, function(error) {
            $scope['import_'+type+'_result'] = error;
          });
      };
    }
  ]);
