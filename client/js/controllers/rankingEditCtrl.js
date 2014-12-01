'use strict';

angular.module('srApp.controllers')
  .controller('rankingEditCtrl', [
    '$scope',
    function($scope) {
      console.log('init rankingEditCtrl');
      $scope.ranking = _.snapshot($scope.state.ranking);
      $scope.doReset = function() {
        $scope.ranking = {
          player: '((tp*n_players^2+sos)*5*n_rounds+cp)*100*n_rounds+ap',
          team: '(((ttp*team_size*n_rounds+tp)*n_teams^2+sos)*5*n_rounds+cp)*100*n_rounds+ap'
        };
      };
      $scope.doClose = function(validate) {
        if(validate) {
          _.extend($scope.state.ranking, $scope.ranking);
        }
        $scope.goToState('players');
      };
    }
  ]);
