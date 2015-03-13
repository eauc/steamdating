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
    function($window,
             jsonStringifier,
             playerService,
             playersService,
             gameService,
             listService,
             listsService,
             ranking,
             roundService,
             roundsService) {
      var STORAGE_KEY = 'sdApp.state';
      var stateService = {
        isEmpty: function(state) {
          return (_.flatten(state.players).length === 0 &&
                  _.flatten(state.rounds).length === 0);
        },
        init: function() {
          var stored_state = $window.localStorage.getItem(STORAGE_KEY);
          if(_.exists(stored_state)) {
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
          var _st = _.clone(state);
          var faction = [ 'Faction1', 'Faction2', 'Faction3', 'Faction4' ];
          var city = [ 'City1', 'City2', 'City3', 'City4' ];
          var team = [ 'Team1', 'Team2', 'Team3', 'Team4' ];

          _st.players = [[],[]];
          _.range(8).map(function(i) {
            var f = _.chain(faction).shuffle().first().value();
            _st.players[i >> 2].push(playerService.create({
              name: 'Player'+(i+1),
              faction: f,
              origin: _.chain(city).shuffle().first().value(),
              team: _.chain(team).shuffle().first().value()
            }));
            _st.players[i >> 2][i%4].lists.push(
              listService.create({ faction: f, caster: 'Caster1' }),
              listService.create({ faction: f, caster: 'Caster2' })
            );
            _st.players[i >> 2][i%4].custom_field = (Math.random()*50)>>0;
          });
          _.range(2).map(function(i) {
            _st.rounds.push([]);
            var table = 1;
            _.each(_st.players, function(gr) {
              var names = _.shuffle(playersService.names(gr));
              _.range(names.length/2).map(function(j) {
                var p1 = _.first(names);
                names = _.rest(names);
                var p2 = _.first(names);
                names = _.rest(names);

                var g = gameService.create({
                  table: table++,
                  victory: _.chain(['assassination', null, null]).shuffle().first().value(),
                  p1: { name: p1 },
                  p2: { name: p2 }
                });
                g.p1.list = _.chain(_st.players)
                  .apply(playersService.player, p1)
                  .getPath('lists')
                  .apply(listsService.casters)
                  .shuffle()
                  .first()
                  .value();
                g.p2.list = _.chain(_st.players)
                  .apply(playersService.player, p2)
                  .getPath('lists')
                  .apply(listsService.casters)
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
                g.p1.custom_field = (Math.random()*50)>>0;
                g.p2.custom_field = (Math.random()*50)>>0;
                _st.rounds[i].push(g);
              });
            });
          });
          _st.bracket = [undefined, 1];
          _st.custom_fields.player = 'PCustom';
          _st.custom_fields.game = 'GCustom';
          _st = stateService.updatePlayersPoints(_st);
          return _st;
        },
        create: function(data) {
          var state = _.deepExtend({
            bracket: [],
            players: [[]],
            rounds: [],
            ranking: {
              player: ranking.criterions.SR.Baseline.player,
              team: ranking.criterions.SR.Baseline.team
            },
            custom_fields: {
              player: null,
              game: null
            },
            tables_groups_size: null
          }, data);
          state.players = _.map(state.players, function(group) {
            return _.map(group, playerService.create);
          });
          state.rounds = _.map(state.rounds, function(round) {
            return _.map(round, gameService.create);
          });
          state = stateService.updatePlayersPoints(state);
          stateService.store(state);
          console.log('state', state);
          return state;
        },
        store: function(state) {
          $window.localStorage.setItem(STORAGE_KEY,
                                       jsonStringifier.stringify(state));
          console.log('state stored');
        },
        hasPlayers: function(state) {
          return _.flatten(state.players).length !== 0;
        },
        hasPlayerGroups: function(state) {
          return state.players.length > 1;
        },
        isTeamTournament: function(state) {
          return _.flatten(state.teams).length !== 0;
        },
        hasPlayerCustomField: function(state) {
          return !s.isBlank(state.custom_fields.player);
        },
        hasGameCustomField: function(state) {
          return !s.isBlank(state.custom_fields.game);
        },
        hasDropedPlayers: function(state) {
          return _.chain(state)
            .apply(stateService.playersDroped)
            .apply(playersService.size)
            .value() > 0;
        },
        playersDroped: function(state) {
          return playersService.dropedInRound(state.players);
        },
        playersNotDroped: function(state) {
          return playersService.notDropedInRound(state.players);
        },
        playersNotDropedInLastRound: function(state) {
          return playersService.notDropedInRound(state.players, state.rounds.length);
        },
        createNextRound: function(state) {
          return _.chain(state)
            .apply(stateService.playersNotDropedInLastRound)
            .apply(roundsService.createNextRound)
            .value();
        },
        clearBracket: function(state) {
          return _.repeat(state.players.length, undefined);
        },
        setBracketLength: function(state, length) {
          return state.bracket.length >= length ? _.clone(state.bracket) :
            _.cat(state.bracket, _.repeat(length - state.bracket.length, undefined));
        },
        setBracket: function(state, group_index) {
          var bracket = stateService.setBracketLength(state, group_index+1);
          bracket[group_index] = ( _.exists(bracket[group_index]) ?
                                   bracket[group_index] :
                                   state.rounds.length );
          return bracket;
        },
        resetBracket: function(state, group_index) {
          var bracket = stateService.setBracketLength(state, group_index+1);
          bracket[group_index] = undefined;
          return bracket;
        },
        canBeBracketTournament: function(state, group_index) {
          var group_size = _.chain(state)
              .apply(stateService.playersNotDropedInLastRound)
              .nth(group_index)
              .size()
              .spy('group_size')
              .value();
          if(group_size === 0) return false;
          while(0 === (group_size & 0x1)) group_size = group_size >> 1;
          return (group_size === 1);
        },
        isBracketTournament: function(state, group_index, round_index) {
          round_index = ( _.exists(round_index) ?
                          round_index :
                          state.rounds.length );
          var bracket = stateService.setBracketLength(state, group_index+1);
          return (_.exists(state.bracket[group_index]) &&
                  round_index >= state.bracket[group_index]);
        },
        bracketNbRounds: function(state, group_index) {
          var bracket = stateService.setBracketLength(state, group_index+1);
          return ( _.exists(bracket[group_index]) ?
                   state.rounds.length - bracket[group_index] :
                   0 );
        },
        bracketRoundOf: function(state, group_index, round_index) {
          if(!_.exists(state.bracket[group_index])) return 'Not in bracket';
          round_index = _.exists(round_index) ? round_index : state.rounds.length;
          var players_not_droped = stateService.playersNotDroped(state);
          var bracket_size = players_not_droped[group_index].length >>
              (round_index - state.bracket[group_index] + 1);
          switch(bracket_size) {
          case 0:
            {
              return 'Ended';
            }
          case 1:
            {
              return 'Final';
            }
          case 2:
            {
              return 'Semi-finals';
            }
          case 4:
            {
              return 'Quarter-finals';
            }
          default:
            {
              return 'Round of '+bracket_size;
            }
          }
        },
        updatePlayersPoints: function(state) {
          var _state = _.clone(state);
          
          var bracket = stateService.setBracketLength(_state, _state.players.length);
          var bracket_weights = _.map(_state.players,
                                      function(group) { return group.length/2; });
          _state.players = playersService.updatePoints(_state.players, _state.rounds,
                                                       bracket, bracket_weights);
          return _state;
        },
        updateBestsPlayers: function(state) {
          var _state = _.clone(state);
          _state.bests = playersService.bests(state.players, _.size(state.rounds));
          _state.bests_in_faction = bestsInFaction(_state);
          return _state;
        },
        isPlayerBest: function(state, type, player) {
          return 0 <= _.indexOf(_.getPath(state.bests, type), _.getPath(player, 'name'));
        },
        isPlayerBestInFaction: function(state, player) {
          return player.name === _.chain(state)
            .getPath('bests_in_faction.'+player.faction)
            .first()
            .value();
        },
        sortPlayersByName: function(state) {
          return _.map(state.players, function(group) {
            return _.sortBy(group, 'name');
          });
        },
        sortPlayersByRank: function(state) {
          var is_bracket = _.map(state.players, function(group, group_index) {
            return stateService.isBracketTournament(state, group_index);
          });
          return playersService.sort(state.players, state, is_bracket);
        },
        rankingTables: function(state) {
          var bests_table = bestsTable(state);
          // console.log('bests_table', bests_table);
          var bests_in_faction_table = bestsInFactionTable(state);
          // console.log('bests_in_faction_table', bests_table);
          var players_tables = playersTables(state);
          // console.log('players_tables', players_tables);

          var ret = _.cat([bests_table], bests_in_faction_table, players_tables);
          // console.log('ret', ret);
          return ret;
        },
        roundsSummaryTables: function(state) {
          return _.chain(state)
            .apply(stateService.sortPlayersByName)
            .map(function(group, group_index) {
              var headers = roundsSummaryHeadersForGroup(state, group_index);
              var rows = roundsSummaryRowsForGroup(state, group);
              return _.cat([ ['Group'+(group_index+1)],
                             headers
                           ], rows);
            })
            .value();
        },
        roundTables: function(state, round_index) {
          var has_game_custom_field = stateService.hasGameCustomField(state);
          var round = state.rounds[round_index];
          return _.chain(state.players)
            .map(function(group, group_index) {
              return roundService.gamesForGroup(round, state.players, group_index);
            })
            .map(function(games) {
              return _.mapWith(games, gameService.toArray, has_game_custom_field);
            })
            .map(function(group) {
              var headers = [ 'Table',
                              'Player1', 'Player2',
                              'Player1.list', 'Player2.list',
                              'Player1.tp', 'Player2.tp',
                              'Player1.cp', 'Player2.cp',
                              'Player1.ap', 'Player2.ap',
                              'CasterKill'
                            ];
              if(has_game_custom_field) {
                headers = _.cat(headers, ['Player1.'+state.custom_fields.game,
                                          'Player2.'+state.custom_fields.game
                                         ]);
              }
              return _.cat([headers], group);
            })
            .value();
        }
      };

      function bestsInFaction(state) {
        return _.chain(state)
          .apply(stateService.sortPlayersByRank)
          .first()
          .map(function(rank) {
            return _.map(rank.players, function(player) {
              // player_array
              return [player.faction, player.name, rank.rank];
            });
          })
          .flatten(true)
          .uniq(false, _.first)
          .reduce(function(mem, player_array) {
            mem[_.first(player_array)] = _.rest(player_array);
            return mem;
          }, {})
          .value();
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
      function bestsInFactionTable(state) {
        var values = _.chain(state)
            .getPath('bests_in_faction')
            .pairs()
            .map(function(pair) {
              return _.cat(pair[0], pair[1]);
            })
            .sortBy(_.partial(_.nth, _, 2))
            .value();
        return [_.cat([
          ['Bests In Faction'],
          ['Faction', 'Player', 'Rank'],
        ], values)];
      }
      function bestsTableHeaders(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Undefeated'];
        if(has_player_custom_field) {
          headers.push(state.custom_fields.player);
        }
        headers = _.cat(headers, ['SoS', 'Scenario', 'Destruction', 'Assassin']);
        if(has_game_custom_field) {
          headers.push(state.custom_fields.game);
        }

        return headers;
      }
      function bestsTableValues(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var values = [_.getPath(state, 'bests.undefeated')];
        if(has_player_custom_field) {
          values.push(_.getPath(state, 'bests.custom_field'));
        }
        values = _.cat(values, [ _.getPath(state, 'bests.points.sos'),
                                 _.getPath(state, 'bests.points.control'),
                                 _.getPath(state, 'bests.points.army'),
                                 _.getPath(state, 'bests.points.assassination')
                               ]);
        if(has_game_custom_field) {
          values.push(_.getPath(state, 'bests.points.custom_field'));
        }

        return values;
      }
      
      function playersTables(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        return _.chain(state)
          .apply(stateService.sortPlayersByRank)
          .map(_.partial(groupRows, _, state))
          .map(_.partial(groupTable, _, _, state))
          .value();
      }
      function groupTable(group_rows, group_index, state) {
        var headers = groupHeaders(state);
        return _.cat([
          ['Group'+(group_index+1)],
          headers
        ], group_rows);
      }
      function groupHeaders(state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        var headers = ['Rank', 'Name', 'Origin', 'Faction'];
        if(has_player_custom_field) {
          headers = _.cat(headers, [state.custom_fields.player]);
        }
        headers = _.cat(headers, ['TP', 'SoS', 'CP', 'AP', 'CK']);
        if(has_game_custom_field) {
          headers = _.cat(headers, [state.custom_fields.game]);
        }
        headers = _.cat(headers, ['Drop']);
        return headers;
      }
      function groupRows(group, state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);

        return _.chain(group)
          .map(function(rank) {
            var rankPlayerRow = _.partial(playerRow, _, rank.rank, state);
            return _.map(rank.players, rankPlayerRow);
          })
          .flatten()
          .chunk(10 +
                 (has_player_custom_field ? 1 : 0) +
                 (has_game_custom_field ? 1 : 0))
          .value();
      }
      function playerRow(player, rank, state) {
        var has_player_custom_field = stateService.hasPlayerCustomField(state);
        var has_game_custom_field = stateService.hasGameCustomField(state);
        
        var row = [ rank, player.name, player.origin, player.faction ];
        if(has_player_custom_field) {
          row = _.cat(row, [player.custom_field]);
        }
        row = _.cat(row, [player.points.tournament, player.points.sos,
                          player.points.control, player.points.army,
                          player.points.assassination ]);
        if(has_game_custom_field) {
          row = _.cat(row, [player.points.custom_field]);
        }
        row = _.cat(row, [ playerService.hasDropedInRound(player, null) ?
                           'After Round '+player.droped :
                           ''
                         ]);
        return row;
      }

      function roundsSummaryHeadersForGroup(state, group_index) {
        var headers = [ 'Player', 'Lists Played' ];
        _.each(state.rounds, function(round, round_index) {
          headers.push(stateService.isBracketTournament(state, group_index, round_index) ?
                       stateService.bracketRoundOf(state, group_index, round_index) :
                       'Round'+(round_index+1));
        });
        return headers;
      }
      function roundsSummaryRowsForGroup(state, group) {
        return _.map(group, _.partial(roundsSummaryRowForPlayer, state));
      }
      function roundsSummaryRowForPlayer(state, player) {
        var row = [ player.name, _.size(player.lists_played)+'/'+_.size(player.lists) ];
        _.each(state.rounds, function(round, round_index) {
          if(playerService.hasDropedInRound(player, round_index)) {
            row.push('DROPPED');
            return;
          }
          
          var game = roundService.gameForPlayer(round, player.name);
          row.push( (gameService.winForPlayer(game, player.name) ? 'W' : 'L') +
                    ' - ' +
                    gameService.opponentForPlayer(game, player.name) );
        });
        return row;
      }
      return stateService;
    }
  ]);
