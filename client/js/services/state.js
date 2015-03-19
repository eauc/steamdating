'use strict';

angular.module('srApp.services')
  .factory('state', [
    '$window',
    'jsonStringifier',
    'player',
    'players',
    'game',
    'list',
    'lists',
    'ranking',
    'round',
    'rounds',
    'bracket',
    function($window,
             jsonStringifierService,
             playerService,
             playersService,
             gameService,
             listService,
             listsService,
             rankingService,
             roundService,
             roundsService,
             bracketService) {
      var STORAGE_KEY = 'sdApp.state';
      var stateService = {
        isEmpty: function(state) {
          return ( R.isEmpty(R.flatten(state.players)) &&
                   R.isEmpty(R.flatten(state.rounds))
                 );
        },
        init: function() {
          var stored_state = $window.localStorage.getItem(STORAGE_KEY);
          if(R.exists(stored_state)) {
            try {
              stored_state = JSON.parse(stored_state);
              console.log('restoring stored state');
              return stateService.create(stored_state);
            }
            catch(e) {
              console.log('error parsing stored state', e.message);
            }
          }
          return stateService.create();
        },
        test: function(state) {
          var _st = R.clone(state);
          var faction = [ 'Faction1', 'Faction2', 'Faction3', 'Faction4' ];
          var city = [ 'City1', 'City2', 'City3', 'City4' ];
          var team = [ 'Team1', 'Team2', 'Team3', 'Team4' ];

          _st.players = [[],[]];
          R.range(0, 8).map(function(i) {
            var f = R.head(R.shuffle(faction));
            _st.players[i >> 2].push(playerService.create({
              name: 'Player'+(i+1),
              faction: f,
              origin: R.head(R.shuffle(city)),
              team: R.head(R.shuffle(team))
            }));
            _st.players[i >> 2][i%4].lists.push(
              listService.create({ faction: f, caster: 'Caster1' }),
              listService.create({ faction: f, caster: 'Caster2' })
            );
            _st.players[i >> 2][i%4].custom_field = (Math.random()*50)>>0;
          });
          R.range(0, 2).map(function(i) {
            _st.rounds.push([]);
            var table = 1;
            R.forEach(function(gr) {
              var names = R.shuffle(playersService.names(gr));
              R.range(0, names.length/2).map(function(j) {
                var p1 = R.head(names);
                names = R.tail(names);
                var p2 = R.head(names);
                names = R.tail(names);

                var g = gameService.create({
                  table: table++,
                  victory: R.head(R.shuffle(['assassination', null, null])),
                  p1: { name: p1 },
                  p2: { name: p2 }
                });
                g.p1.list = R.pipe(
                  playersService.player$(p1),
                  R.prop('lists'),
                  listsService.casters,
                  R.shuffle,
                  R.head
                )(_st.players);
                g.p2.list = R.pipe(
                  playersService.player$(p2),
                  R.prop('lists'),
                  listsService.casters,
                  R.shuffle,
                  R.head
                )(_st.players);
                var res = R.shuffle(['p1','p2']);
                g[res[0]].tournament = 1;
                g[res[1]].tournament = 0;
                g.p1.control = (Math.random()*5)>>0;
                g.p2.control = (Math.random()*5)>>0;
                g.p1.army = (Math.random()*50)>>0;
                g.p2.army = (Math.random()*50)>>0;
                g.p1.custom_field = (Math.random()*50)>>0;
                g.p2.custom_field = (Math.random()*50)>>0;
                _st.rounds[i].push(g);
              });
            }, _st.players);
          });
          _st.bracket = [undefined, 1];
          _st.custom_fields.player = 'PCustom';
          _st.custom_fields.game = 'GCustom';
          _st = stateService.updatePlayersPoints(_st);
          return _st;
        },
        create: function(data) {
          var state = R.deepExtend({
            bracket: [],
            players: [[]],
            rounds: [],
            ranking: {
              player: rankingService.criterions.SR.Baseline.player,
              team: rankingService.criterions.SR.Baseline.team
            },
            custom_fields: {
              player: null,
              game: null
            },
            tables_groups_size: null
          }, data);
          state.players = R.map(function(group) {
            return R.map(playerService.create, group);
          }, state.players);
          state.rounds = R.map(function(round) {
            return R.map(gameService.create, round);
          }, state.rounds);
          state = stateService.updatePlayersPoints(state);
          stateService.store(state);
          console.log('state', state);
          return state;
        },
        store: function(state) {
          $window.localStorage.setItem(STORAGE_KEY,
                                       jsonStringifierService.stringify(state));
          console.log('state stored');
        },
        hasPlayers: function(state) {
          return !R.isEmpty(R.flatten(state.players));
        },
        hasPlayerGroups: function(state) {
          return state.players.length > 1;
        },
        isTeamTournament: function(state) {
          return !R.isEmpty(R.flatten(state.teams));
        },
        hasPlayerCustomField: function(state) {
          return !s.isBlank(state.custom_fields.player);
        },
        hasGameCustomField: function(state) {
          return !s.isBlank(state.custom_fields.game);
        },
        hasDropedPlayers: function(state) {
          return R.pipe(
            stateService.playersDroped,
            playersService.size
          )(state) > 0;
        },
        playersDroped: function(state) {
          return playersService.dropedInRound(null, state.players);
        },
        playersNotDroped: function(state) {
          return playersService.notDropedInRound(null, state.players);
        },
        playersNotDropedInLastRound: function(state) {
          return playersService.notDropedInRound(state.rounds.length, state.players);
        },
        createNextRound: function(state) {
          return R.pipe(
            stateService.playersNotDropedInLastRound,
            roundsService.createNextRound
          )(state);
        },
        clearBracket: function(state) {
          return R.assoc('bracket',
                         bracketService.clear(state.players.length, state.bracket),
                         state);
        },
        canBeBracketTournament: function(group_index, state) {
          var group_size = R.pipe(
            stateService.playersNotDropedInLastRound,
            R.nth(group_index),
            R.length
          )(state);
          if(group_size === 0) return false;
          while(0 === (group_size & 0x1)) group_size = group_size >> 1;
          return (group_size === 1);
        },
        isBracketTournament: function(group_index, round_index, state) {
          round_index = R.defaultTo(state.rounds.length, round_index);
          return bracketService.isBracketTournament(group_index, round_index, state.bracket);
        },
        bracketNbRounds: function(group_index, state) {
          return bracketService.nbRounds(group_index, state.rounds.length, state.bracket);
        },
        bracketRoundOf: function(group_index, round_index, state) {
          round_index = R.defaultTo(state.rounds.length, round_index);
          var players_not_droped = stateService.playersNotDroped(state);
          var group_size = players_not_droped[group_index].length;
          return bracketService.roundOf(group_index, group_size, round_index, state.bracket);
        },
        updatePlayersPoints: function(state) {
          var _state = R.assoc('bracket',
                               bracketService.setLength(state.players.length, state.bracket),
                               state);
          var bracket_weights = R.map(function(group) {
            return group.length/2;
          }, _state.players);
          _state = R.assoc('players',
                           playersService.updatePoints(_state.bracket, bracket_weights,
                                                       _state.rounds, _state.players),
                           _state);
          return _state;
        },
        updateBestsPlayers: function(state) {
          var _state = R.assoc('bests',
                               playersService.bests(R.length(state.rounds),
                                                    state.players),
                               state);
          _state = R.assoc('bests_in_faction',
                           bestsInFaction(_state),
                           _state);
          return _state;
        },
        isPlayerBest: function(type, player, state) {
          var path = R.prepend('bests', R.split('.', type));
          return 0 <= R.indexOf(R.prop('name', player),
                                R.path(path, state));
        },
        isPlayerBestInFaction: function(player, state) {
          var bests = R.defaultTo([], R.path(['bests_in_faction',player.faction], state));
          return player.name === R.head(bests);
        },
        sortPlayersByName: function(state) {
          return R.map(function(group) {
            return R.sortBy(R.prop('name'), group);
          }, state.players);
        },
        sortPlayersByRank: function(state) {
          var is_bracket = R.mapIndexed(function(group, group_index) {
            return stateService.isBracketTournament(group_index, null, state);
          }, state.players);
          return playersService.sort(state, is_bracket, state.players);
        },
        rankingTables: function(state) {
          var bests_table = bestsTable(state);
          var bests_in_faction_table = bestsInFactionTable(state);
          var players_tables = playersTables(state);

          var ret = R.concat([bests_table], bests_in_faction_table);
          ret = R.concat(ret, players_tables);
          return ret;
        },
        roundsSummaryTables: function(state) {
          return R.pipe(
            stateService.sortPlayersByName,
            R.mapIndexed(function(group, group_index) {
              var headers = roundsSummaryHeadersForGroup(state, group_index);
              var rows = roundsSummaryRowsForGroup(state, group);
              return R.concat([ ['Group'+(group_index+1)],
                                headers
                              ], rows);
            })
          )(state);
        },
        roundTables: function(round_index, state) {
          var has_game_custom_field = stateService.hasGameCustomField(state);
          var round = state.rounds[round_index];
          return R.pipe(
            R.mapIndexed(function(group, group_index) {
              return roundService.gamesForGroup(state.players, group_index, round);
            }),
            R.map(R.map(gameService.toArray$(has_game_custom_field))),
            R.mapIndexed(function(group, group_index) {
              var headers = [ 'Table',
                              'Player1', 'Player2',
                              'Player1.list', 'Player2.list',
                              'Player1.tp', 'Player2.tp',
                              'Player1.cp', 'Player2.cp',
                              'Player1.ap', 'Player2.ap',
                              'CasterKill'
                            ];
              if(has_game_custom_field) {
                headers = R.concat(headers, [ 'Player1.'+state.custom_fields.game,
                                              'Player2.'+state.custom_fields.game
                                            ]);
              }
              return R.concat([ ['Group'+(group_index+1)],
                                headers
                              ], group);
            })
          )(state.players);
        }
      };

      function bestsInFaction(state) {
        return R.pipe(
          stateService.sortPlayersByRank,
          R.head,
          R.chain(function(rank) {
            return R.map(function(player) {
              // player_array
              return [ player.faction,
                       player.name,
                       rank.rank
                     ];
            }, rank.players);
          }),
          R.uniqWith(R.useWith(R.eq, R.head, R.head)),
          R.reduce(function(mem, player_array) {
            mem[R.head(player_array)] = R.tail(player_array);
            return mem;
          }, {})
        )(state);
      }
      
      function bestsTable(state) {
        var headers = bestsTableHeaders(state);
        var values = bestsTableValues(state);
        return [
          ['Bests'],
          headers,
          values
        ];
      }
      function bestsTableHeaders(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Undefeated'];
        if(has_player_custom_field) {
          headers.push(state.custom_fields.player);
        }
        headers = R.concat(headers, ['SoS', 'Scenario', 'Destruction', 'Assassin']);
        if(has_game_custom_field) {
          headers.push(state.custom_fields.game);
        }
        return headers;
      }
      function bestsTableValues(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var values = [R.path(['bests','undefeated'], state)];
        if(has_player_custom_field) {
          values.push(R.path(['bests','custom_field'], state));
        }
        values = R.concat(values, [ R.path(['bests','points','sos'], state),
                                    R.path(['bests','points','control'], state),
                                    R.path(['bests','points','army'], state),
                                    R.path(['bests','points','assassination'], state)
                                  ]);
        if(has_game_custom_field) {
          values.push(R.path(['bests','points','custom_field'], state));
        }
        return values;
      }

      function bestsInFactionTable(state) {
        var values = R.pipe(
          R.prop('bests_in_faction'),
          R.toPairs,
          R.map(function(pair) {
            return R.concat([pair[0]], pair[1]);
          }),
          R.sortBy(R.nth(2))
        )(state);
        return [ R.concat([ ['Bests In Faction'],
                            ['Faction', 'Player', 'Rank'],
                          ], values)
               ];
      }
      
      function playersTables(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        return R.pipe(
          stateService.sortPlayersByRank,
          R.mapIndexed(groupRows$(state)),
          R.mapIndexed(groupTable$(state))
        )(state);
      }
      function groupTable(state, group_rows, group_index) {
        var headers = groupHeaders(state);
        return R.concat([ ['Group'+(group_index+1)],
                          headers
                        ], group_rows);
      }
      var groupTable$ = R.curry(groupTable);
      function groupHeaders(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Rank', 'Name', 'Origin', 'Faction'];
        if(has_player_custom_field) {
          headers = R.concat(headers, [state.custom_fields.player]);
        }
        headers = R.concat(headers, ['TP', 'SoS', 'CP', 'AP', 'CK']);
        if(has_game_custom_field) {
          headers = R.concat(headers, [state.custom_fields.game]);
        }
        headers = R.concat(headers, ['Drop']);
        return headers;
      }
      function groupRows(state, group) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        return R.pipe(
          R.map(function(rank) {
            return R.map(playerRow$(state, rank.rank), rank.players);
          }),
          R.flatten,
          R.chunkAll(10 +
                     (has_player_custom_field ? 1 : 0) +
                     (has_game_custom_field ? 1 : 0), null)
        )(group);
      }
      var groupRows$ = R.curry(groupRows);
      function playerRow(state, rank, player) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);
        
        var row = [ rank, player.name, player.origin, player.faction ];
        if(has_player_custom_field) {
          row = R.concat(row, [player.custom_field]);
        }
        row = R.concat(row, [ player.points.tournament, player.points.sos,
                              player.points.control, player.points.army,
                              player.points.assassination
                            ]);
        if(has_game_custom_field) {
          row = R.concat(row, [player.points.custom_field]);
        }
        row = R.concat(row, [ playerService.hasDropedInRound(null, player) ?
                              'After Round '+player.droped :
                              ''
                            ]);
        return row;
      }
      var playerRow$ = R.curry(playerRow);

      function roundsSummaryHeadersForGroup(state, group_index) {
        var headers = R.mapIndexed(function(round, round_index) {
          return ( stateService.isBracketTournament(group_index, round_index, state) ?
                   stateService.bracketRoundOf(group_index, round_index, state) :
                   'Round'+(round_index+1)
                 );
        }, state.rounds);
        return R.concat([ 'Player', 'Lists Played' ], headers);
      }
      function roundsSummaryRowsForGroup(state, group) {
        return R.map(roundsSummaryRowForPlayer$(state), group);
      }
      function roundsSummaryRowForPlayer(state, player) {
        var row = [ player.name,
                    R.length(player.lists_played)+'/'+R.length(player.lists)
                  ];
        R.forEachIndexed(function(round, round_index) {
          if(playerService.hasDropedInRound(round_index, player)) {
            row.push('DROPPED');
            return;
          }
          
          var game = roundService.gameForPlayer(player.name, round);
          if(R.isNil(game)) {
            row.push('-');
            return;
          }
            
          row.push( (gameService.winForPlayer(player.name, game) ? 'W' : 'L') +
                    ' - ' +
                    gameService.opponentForPlayer(player.name, game) );
        }, state.rounds);
        return row;
      }
      var roundsSummaryRowForPlayer$ = R.curry(roundsSummaryRowForPlayer);

      R.curryService(stateService);
      return stateService;
    }
  ]);
