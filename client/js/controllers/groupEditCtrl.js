'use strict';

angular.module('srApp.controllers')
  .controller('groupEditCtrl', [
    '$scope',
    '$window',
    'players',
    function($scope,
             $window,
             players) {
      console.log('init groupEditCtrl');

      $scope.players = _.map($scope.state.players, function(gr) {
        return _.clone(gr);
      });
      $scope.selection= {};
      $scope.isSelectionEmpty = function() {
        return !_.chain($scope.selection)
          .values()
          .any()
          .value();
      };

      $scope.chunkGroups = function() {
        var size = parseFloat($window.prompt('Groups size'));
        if(_.isNaN(size)) return;
        $scope.players = players.chunkGroups($scope.players,
                                             parseFloat(size));
      };
      $scope.splitSelection = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        $scope.players = players.splitNewGroup($scope.players, ps);
      };
      $scope.moveSelectionFront = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        _.each(ps, function(p) {
          $scope.players = players.movePlayerGroupFront($scope.players, p);
        });
      };
      $scope.moveSelectionBack = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        _.each(ps, function(p) {
          $scope.players = players.movePlayerGroupBack($scope.players, p);
        });
      };
      $scope.moveGroupFront = function(gr) {
        $scope.players = players.moveGroupFront($scope.players, gr);
      };
      $scope.moveGroupBack = function(gr) {
        $scope.players = players.moveGroupBack($scope.players, gr);
      };

      $scope.doClose = function(validate) {
        if(validate) {
          $scope.state.players = $scope.players;
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState('players');
      };
    }
  ]);
