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
    function($window,
             jsonStringifier,
             playerService,
             playersService,
             gameService,
             listService,
             listsService,
             ranking,
             roundService) {
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
            _st.players[i >> 2].push(playerService.create(
              'Player'+(i+1),
              f,
              _.chain(city).shuffle().first().value(),
              _.chain(team).shuffle().first().value()
            ));
            _st.players[i >> 2][i%4].lists.push(
              listService.create(f, 'Caster1'),
              listService.create(f, 'Caster2')
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

                var g = gameService.create(table++, p1, p2);
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
          _st.players = stateService.updatePlayersPoints(_st);
          return _st;
        },
        create: function(data) {
          var _data = _.clone(data || {});
          var state = _.defaults(_data, {
            bracket: [],
            players: [[]],
            rounds: [],
            ranking: {
              player: ranking.srPlayerCrit(),
              team: ranking.srTeamCrit()
            },
            custom_fields: {
              player: null,
              game: null
            }
          });
          state.players = stateService.updatePlayersPoints(state);
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
          var group_size = state.players[group_index].length;
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
          var bracket_size = state.players[group_index].length >>
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
          var bracket = stateService.setBracketLength(state, state.players.length);
          var bracket_weights = _.map(state.players,
                                      function(group) { return group.length/2; });
          return playersService.updatePoints(state.players, state.rounds,
                                             bracket, bracket_weights);
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
          var has_player_custom_field = stateService.hasPlayerCustomField(state);
          var has_game_custom_field = stateService.hasGameCustomField(state);
          return _.chain(state)
            .apply(stateService.sortPlayersByRank)
            .map(function(group) {
              return _.chain(group)
                .map(function(rank) {
                  return _.map(rank.players, function(player) {
                    var ret = [ rank.rank, player.name, player.origin, player.faction ];
                    if(has_player_custom_field) {
                      ret = _.cat(ret, [player.custom_field]);
                    }
                    ret = _.cat(ret, [player.points.tournament, player.points.sos,
                                      player.points.control, player.points.army ]);
                    if(has_game_custom_field) {
                      ret = _.cat(ret, [player.points.custom_field]);
                    }
                    return ret;
                  });
                })
                .flatten()
                .chunk(8 +
                       (has_player_custom_field ? 1 : 0) +
                       (has_game_custom_field ? 1 : 0))
                .value();
            })
            .map(function(group) {
              var headers = ['Rank', 'Name', 'Origin', 'Faction'];
              if(has_player_custom_field) {
                headers = _.cat(headers, [state.custom_fields.player]);
              }
              headers = _.cat(headers, ['TP', 'SoS', 'CP', 'AP']);
              if(has_game_custom_field) {
                headers = _.cat(headers, [state.custom_fields.game]);
              }
              return _.cat([headers], group);
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
      return stateService;
    }
  ]);
