'use strict';

angular.module('srApp.services')
  .factory('state', [
    '$window',
    'player',
    function($window,
             player) {
      var state = {
        init: function() {
          // var stored_state = $window.localStorage.getItem('srApp.state');
          // if(stored_state) {
          //   try {
          //     stored_state = JSON.parse(stored_state);
          //     console.log('restoring stored state');
          //     return state.create(stored_state);
          //   }
          //   catch(e) {
          //     console.log('error parsing stored state', e);
          //   }
          // }
          return state.create();
        },
        test: function(st) {
          var _st = _.clone(st);
          var faction = [ 'Faction1', 'Faction2', 'Faction3', 'Faction4' ];
          var city = [ 'City1', 'City2', 'City3', 'City4' ];
          var team = [ 'Team1', 'Team2', 'Team3', 'Team4' ];

          _st.players = [[],[]];
          _.range(8).map(function(i) {
            _st.players[i >> 2].push(player.create(
              'Player'+(i+1),
              _.chain(faction).shuffle().first().value(),
              _.chain(team).shuffle().first().value(),
              _.chain(city).shuffle().first().value()
            ));
            _st.players[i >> 2][i%4].lists.push({ caster: 'Caster1' }, { caster: 'Caster2' });
          });
          return _st;
        },
        create: function(data) {
          var _data = _.clone(data || {});
          return _.defaults(_data, {
            // phantom: player.create('Phantom'),
            // bracket: [],
            // teams:[[]],
            players: [[]],
            // rounds: [],
            // factions: [],
            // ranking: {
            //   player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            //   team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
            // }
          });
          //   $scope.updatePoints();
          //   $scope.storeState();
          //   console.log('state', $scope.state);
        },
        // $scope.storeState = function() {
        //   $window.localStorage.setItem('sdApp.state',
        //                                JSON.stringify($scope.state));
        //   console.log('state stored');
        // };
        hasPlayers: function(st) {
          return _.flatten(st.players).length !== 0;
        },
        hasPlayerGroups: function(st) {
          return st.players.length > 1;
        },
        isTeamTournament: function(st) {
          return _.flatten(st.teams).length !== 0;
        },
        // $scope.isBracketTournament = function(g) {
        //   return (g < $scope.state.bracket.length &&
        //           _.exists($scope.state.bracket[g]));
        // };
        // $scope.updatePoints = function() {
        //   _.each($scope.state.players, function(group, i) {
        //     var base_weight = group.length/2;
        //     _.chain(group)
        //       .each(function(p) {
        //         p.lists_played = rounds.listsFor($scope.state.rounds, p.name);
        //       })
        //       .each(function(p) {
        //         p.points = rounds.pointsFor($scope.state.rounds,
        //                                     p.name,
        //                                     $scope.state.bracket[i],
        //                                     base_weight);
        //       })
        //       .each(function(p) {
        //         p.points.sos = players.sosFrom($scope.state.players,
        //                                        rounds.opponentsFor($scope.state.rounds,
        //                                                            p.name));
        //       });
        //   });
        //   _.each($scope.state.teams, function(group, i) {
        //     var base_weight = group.length/2;
        //     _.chain(group)
        //       .each(function(t) {
        //         t.points = rounds.pointsForTeam($scope.state.rounds,
        //                                         t.name,
        //                                         $scope.state.bracket[i],
        //                                         base_weight);
        //       })
        //       .each(function(t) {
        //         t.points.sos = teams.sosFrom($scope.state.teams,
        //                                      rounds.opponentsForTeam($scope.state.rounds,
        //                                                              t.name));
        //       });
        //   });
        // };
        // $scope.bracketRoundOf = function(g, r) {
        //   var n = ($scope.isTeamTournament() ?
        //            $scope.state.teams[g].length >> (r - $scope.state.bracket[g] + 1) :
        //            $scope.state.players[g].length >> (r - $scope.state.bracket[g] + 1));
        //   switch(n) {
        //   case 1:
        //     {
        //       return 'Final';
        //     }
        //   case 2:
        //     {
        //       return 'Semi-finals';
        //     }
        //   case 4:
        //     {
        //       return 'Quarter-finals';
        //     }
        //   default:
        //     {
        //       return 'Round of '+n;
        //     }
        //   }
        // };
      };
      return state;
    }
  ]);
