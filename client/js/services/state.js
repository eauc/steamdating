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
        version: function(state) {
          return R.defaultTo(0, R.prop('version', R.defaultTo({}, state)));
        },
        create: function(data) {
          var state = migrate(data);
          state.players = R.map(function(group) {
            return R.map(playerService.create, group);
          }, state.players);
          state.rounds = R.map(function(round) {
            return R.assoc('games', R.map(function(games_group) {
                return R.map(gameService.create, games_group);
            }, round.games), round);
          }, state.rounds);
          state = stateService.updatePlayersPoints(state);
          state.version = LAST_VERSION_NUMBER;
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
            roundService.create
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
        playerRankPairs: function(state) {
          return R.pipe(
            stateService.sortPlayersByRank,
            R.map(function(group) {
              return R.reduce(function(mem_group, rank) {
                return R.reduce(function(mem_rank, player) {
                  return R.assoc(player.name, rank.rank, mem_rank);
                }, mem_group, rank.players);
              }, {}, group);
            })
          )(state);
        },
        evaluateRoundFitness: function(round, state) {
          var games_fitnesses = gamesFitnesses(round, state);
          var summary = gamesFitnessesSummary(games_fitnesses);
          return {
            games: games_fitnesses,
            summary: summary
          };
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
      
      var MIGRATIONS = [
        // v0
        function(data) {
        },
        // v0->1
        function(data) {
          return R.assoc('rounds', R.map(function(round) {
            return [round];
          }, data.rounds), data);
        },
        // v1->2
        function(data) {
          return R.assoc('rounds', R.map(function(round) {
            return { games: round };
          }, data.rounds), data);
        },
      ];
      var LAST_VERSION_NUMBER = MIGRATIONS.length-1;
      function migrate(data) {
        data = R.deepExtend({
          bracket: [],
          scenario: [],
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
        
        var current_version = stateService.version(data);
        if(current_version >= LAST_VERSION_NUMBER) return data;

        var migration_range = R.range(current_version+1,
                                      LAST_VERSION_NUMBER+1);
        return R.reduce(function(state, i) {
          return MIGRATIONS[i](state);
        }, data, migration_range);
      }

      function gamesFitnesses(round, state) {
        var tables_groups_size = R.defaultTo(1, R.prop('tables_groups_size', state));
        return R.map(function(group) {
          return R.map(function(game) {
            return {
              pair: roundsService.pairAlreadyExists(game, state.rounds),
              table: roundsService.tableAlreadyPlayed(game,
                                                      tables_groups_size,
                                                      state.rounds),
              faction: playersService.gameSameFactions(game, state.players),
              origin: playersService.gameSameOrigins(game, state.players),
            };
          }, group);
        }, round);
      }
      function gamesFitnessesSummary(games_fitnesses) {
        var summary = [];

        var nb_already_pairs = fitnessesSum('pair')(games_fitnesses);
        if(nb_already_pairs > 0) {
          summary.push(nb_already_pairs + ' players pair(s) have already been played');
        }

        var nb_already_tables = fitnessesSum('table')(games_fitnesses);
        if(nb_already_tables > 0) {
          summary.push(nb_already_tables + ' players pair(s) have already played on their table (group)');
        }

        var nb_same_factions = fitnessesSum('faction')(games_fitnesses);
        if(nb_same_factions > 0) {
          summary.push(nb_same_factions + ' factions mirror match(s)');
        }

        var nb_same_origins = fitnessesSum('origin')(games_fitnesses);
        if(nb_same_origins > 0) {
          summary.push(nb_same_origins + ' players pair(s) have the same origin');
        }

        return summary;
      }
      function fitnessesSum(prop) {
        return R.pipe(
          R.flatten,
          R.filter(R.propEq(prop, true)),
          R.length
        );
      }
      
      R.curryService(stateService);
      return stateService;
    }
  ]);
