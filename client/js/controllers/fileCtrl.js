'use strict';

angular.module('srApp.controllers')
  .controller('fileCtrl', [
    '$scope',
    '$q',
    '$window',
    'state',
    'fileExport',
    'fileImport',
    'factions',
    // 'backup',
    // 'exporter',
    function($scope,
             $q,
             $window,
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
          name: 'steamdating_'+now+'.txt',
          url: fileExport.generate('json', $scope.state)
        };
        $scope.exports = {
          fk: {
            name: 'players_'+now+'.txt',
            url: fileExport.generate('fk', $scope.state.players),
            label: 'FK players list'
          },
          csv_rank: {
            name: 'ranking_'+now+'.csv',
            url: fileExport.generate('csv', state.rankingTables($scope.state)),
            label: 'CSV Ranking'
          },
          bb_rank: {
            name: 'ranking_'+now+'.txt',
            url: fileExport.generate('bb', state.rankingTables($scope.state)),
            label: 'BB Ranking'
          }
        };
      };
      $scope.updateExports();

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

      $scope.doOpenFile = function(file) {
        console.log('openFile', file);
        fileImport.read('json', file, $scope.factions)
          .then(function(data) {
            var state = data[0];
            var error = data[1];
            $scope.resetState(state);
            $scope['open_result'] = error;
            $scope.goToState('players');
          }, function(error) {
            $scope['open_result'] = error;
          });
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
              $scope.updateExports();
            }
          }, function(error) {
            $scope['import_'+type+'_result'] = error;
          });
      };
    }
  ]);
