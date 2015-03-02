'use strict';

angular.module('srApp.controllers')
  .controller('groupEditCtrl', [
    '$scope',
    'prompt',
    'players',
    'state',
    function($scope,
             prompt,
             players,
             state) {
      $scope.new_state = _.clone($scope.state);
      $scope.new_state.players = _.chain($scope.state)
        .apply(state.sortPlayersByRank)
        .map(function(gr) {
          return _.chain(gr)
            .mapWith(_.getPath, 'players')
            .flatten()
            .value();
        })
        .value();

      console.log('init groupEditCtrl', $scope.new_state);

      $scope.selection= {};
      $scope.isSelectionEmpty = function() {
        return !_.chain($scope.selection)
          .values()
          .any()
          .value();
      };

      $scope.chunkGroups = function() {
        prompt.prompt('prompt', 'Groups size')
          .then(function(value) {
            var size = parseFloat(value);
            if(_.isNaN(size)) return;
            $scope.new_state.players = players.chunkGroups($scope.new_state.players,
                                                           parseFloat(size));
            $scope.new_state.bracket = state.clearBracket($scope.new_state);
          });
      };
      $scope.splitSelection = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        $scope.new_state.players = players.splitNewGroup($scope.new_state.players, ps);
        $scope.new_state.bracket = state.clearBracket($scope.new_state);
      };
      $scope.moveSelectionFront = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        _.each(ps, function(p) {
          $scope.new_state.players = players.movePlayerGroupFront($scope.new_state.players, p);
        });
        $scope.new_state.bracket = state.clearBracket($scope.new_state);
      };
      $scope.moveSelectionBack = function() {
        var ps = _.reduce($scope.selection, function(mem, is, name) {
          return is ? _.cat(mem, name) : mem;
        }, []);
        _.each(ps, function(p) {
          $scope.new_state.players = players.movePlayerGroupBack($scope.new_state.players, p);
        });
        $scope.new_state.bracket = state.clearBracket($scope.new_state);
      };
      $scope.moveGroupFront = function(gr) {
        $scope.new_state.players = players.moveGroupFront($scope.new_state.players, gr);
        $scope.new_state.bracket = state.clearBracket($scope.new_state);
      };
      $scope.moveGroupBack = function(gr) {
        $scope.new_state.players = players.moveGroupBack($scope.new_state.players, gr);
        $scope.new_state.bracket = state.clearBracket($scope.new_state);
      };

      $scope.doClose = function(validate) {
        if(validate) {
          $scope.state.players = $scope.new_state.players;
          $scope.state.bracket = $scope.new_state.bracket;
          $scope.updatePoints();
          $scope.storeState();
        }
        $scope.goToState($scope.edit.back || 'players_list');
      };
    }
  ]);
