'use strict';

angular.module('srApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    'player',
    'players',
    'rounds',
    'factions',
    function($scope,
             $state,
             player,
             players,
             rounds,
             factions) {
      console.log('init mainCtrl');
      $scope.edit = {};
      $scope.state = {
        phantom: player.create('Phantom'),
        players: [],
        rounds: [],
        factions: []
      };
      $scope.newState = function(state) {
        $scope.state = state;
        $scope.state.factions = factions.listFrom($scope.state.players);
      };

      $scope.goToState = _.bind($state.go, $state);
      $scope.currentState = _.bind(_.getPath, _, $state, 'current.name');

      // $scope.state.rounds = _.range(2).map(function(i) {
      //   return _.range(4).map(function(j) {
      //     var game = {
      //       table: ((i+j)%4)+1,
      //       p1: {
      //         name: 'Player'+(j*2+1),
      //         tournament: (i/2)>>0,
      //         control: (Math.random()*5)>>0+1,
      //         army: (Math.random()*50)>>0+1
      //       },
      //       p2: {
      //         name: 'Player'+((j*2+i*2)%8+2),
      //         tournament: 1-((i/2)>>0),
      //         control: (Math.random()*5)>>0+1,
      //         army: (Math.random()*50)>>0+1
      //       }
      //     };
      //     game.p2.name = (game.p2.name === 'Player8') ? 'Phantom' : game.p2.name;
      //     return game;
      //   });
      // });

      // $scope.state.players = _.range(7).map(function(i) {
      //   return {
      //     name: 'Player'+(i+1),
      //     faction: 'Faction'+(((i/2)>>0)+1),
      //     city: 'City'+(((i/3)>>0)+1),
      //     points: rounds.pointsFor($scope.state.rounds, 'Player'+(i+1))
      //   };
      // });
      // $scope.state.players.push($scope.state.phantom);
      $scope.state.phantom.points = rounds.pointsFor($scope.state.rounds, 'Phantom');

      // _.each($scope.state.players, function(p) {
      //   p.points.sos = players.sosFrom($scope.state.players,
      //                                  rounds.opponentsFor($scope.state.rounds, p.name));
      // });

      console.log('state', $scope.state);
    }
  ]);
