'use strict';

angular.module('srApp.services')
  .factory('state', [
    'player',
    'players',
    'game',
    'list',
    'lists',
    'ranking',
    function(player,
             players,
             game,
             list,
             lists,
             ranking) {
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
            var f = _.chain(faction).shuffle().first().value();
            _st.players[i >> 2].push(player.create(
              'Player'+(i+1),
              f,
              _.chain(city).shuffle().first().value(),
              _.chain(team).shuffle().first().value()
            ));
            _st.players[i >> 2][i%4].lists.push(
              list.create(f, 'Caster1'),
              list.create(f, 'Caster2')
            );
          });
          _.range(2).map(function(i) {
            _st.rounds.push([]);
            var table = 1;
            _.each(_st.players, function(gr) {
              var names = _.shuffle(players.names(gr));
              _.range(names.length/2).map(function(j) {
                var p1 = _.first(names);
                names = _.rest(names);
                var p2 = _.first(names);
                names = _.rest(names);

                var g = game.create(table++, p1, p2);
                g.p1.list = _.chain(_st.players)
                  .apply(players.player, p1)
                  .getPath('lists')
                  .apply(lists.casters)
                  .shuffle()
                  .first()
                  .value();
                g.p2.list = _.chain(_st.players)
                  .apply(players.player, p2)
                  .getPath('lists')
                  .apply(lists.casters)
                  .shuffle()
                  .first()
                  .value();
                var res = _.shuffle(['p1','p2']);
                g[res[0]].tournament = 1;
                g[res[1]].tournament = 0;
                g.p1.control = (Math.random()*5)>>0;
                g.p2.control = (Math.random()*5)>>0;
                g.p1.army = (Math.random()*50)>>0;
                g.p2.army = (Math.random()*50)>>0;
                _st.rounds[i].push(g);
              });
            });
          });
          _st.players = players.updatePoints(_st.players, _st.rounds);
          return _st;
        },
        create: function(data) {
          var _data = _.clone(data || {});
          return _.defaults(_data, {
            // phantom: player.create('Phantom'),
            // bracket: [],
            // teams:[[]],
            players: [[]],
            rounds: [],
            // factions: [],
            ranking: {
              player: ranking.srPlayerCrit(),
              team: ranking.srTeamCrit()
            }
          });
          //   $scope.updatePoints();
          //   $scope.storeState();
          //   console.log('state', $scope.state);
        },
        store: function(st) {
          // $window.localStorage.setItem('srApp.state',
          //                              JSON.stringify(st));
          // console.log('state stored');
        },
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
