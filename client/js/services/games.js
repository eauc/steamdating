'use strict';

angular.module('srApp.services')
  .factory('game', [
    function() {
      var gameService = {
        create: function(data) {
          return R.deepExtend({
            table: null,
            victory: null,
            p1: {
              name: null,
              list: null,
              team_tournament: null,
              tournament: null,
              control: null,
              army: null,
              custom_field: null
            },
            p2: {
              name: null,
              list: null,
              team_tournament: null,
              tournament: null,
              control: null,
              army: null,
              custom_field: null
            },
            games: []
          }, data);
        },
        updatePointsFromSubGames: function gameUpdatePointsFromSubGame(game) {
          var ret = R.pipe(
            R.assoc('p1', reducePlayerPointsFromSubGames('p1', game)),
            R.assoc('p2', reducePlayerPointsFromSubGames('p2', game))
          )(game);
          var all_sub_games_have_result = R.all(gameService.hasResult, game.games);
          ret.p1.team_tournament = null;
          ret.p2.team_tournament = null;
          if(all_sub_games_have_result) {
            if(ret.p1.tournament > ret.p2.tournament) {
              ret.p1.team_tournament = 1;
              ret.p2.team_tournament = 0;
            }
            else if(ret.p1.tournament < ret.p2.tournament) {
              ret.p1.team_tournament = 0;
              ret.p2.team_tournament = 1;
            }
            else {
              ret.p1.team_tournament = 0;
              ret.p2.team_tournament = 0;
            }
          }
          // console.log('ret', ret, all_sub_games_have_result);
          return ret;
        },
        updatePoints: function(game) {
          if(gameService.hasSubGames(game)) {
            var ret = R.assoc('games', R.map(gameService.updatePoints, game.games), game);
            return gameService.updatePointsFromSubGames(ret);
          }
          return R.pipe(
            R.assoc('p1',
                    R.assoc('assassination', ( gameService.isAssassination$(game) ?
                                               game.p1.tournament : 0),
                            game.p1)
                   ),
            R.assoc('p2',
                    R.assoc('assassination', ( gameService.isAssassination$(game) ?
                                               game.p2.tournament : 0),
                            game.p2
                           )
                   )
          )(game);
        },
        playerNames: function(game) {
          return R.ap([ R.path(['p1','name']), R.path(['p2','name']) ])([game]);
        },
        forPlayer: function(player_name, game) {
          if(player_name === game.p1.name ||
             player_name === game.p2.name) return game;
        },
        player: function(player_name, game) {
          game = R.defaultTo({}, game);
          var p1_name = R.path(['p1','name'], game);
          return ( p1_name === player_name ?
                   R.prop('p1', game) :
                   R.prop('p2', game) );
        },
        opponentForPlayer: function(player_name, game) {
          var p1_name = R.path(['p1','name'], game);
          return ( p1_name === player_name ?
                   R.path(['p2','name'], game) :
                   p1_name );
        },
        hasResult: function(game) {
          return ( R.type(game.p1.tournament) === 'Number' &&
                   R.type(game.p2.tournament) === 'Number' );
        },
        winForPlayer: function(player_name, game) {
          var tournament_point = R.pipe(
            gameService.player$(player_name),
            R.defaultTo({}),
            R.prop('tournament')
          )(game);
          return ( tournament_point === 1 ?
                   true :
                   ( tournament_point === 0 ?
                     false :
                     undefined
                   )
                 );
        },
        lossForPlayer: function(player_name, game) {
          var tournament_point = R.pipe(
            gameService.player$(player_name),
            R.defaultTo({}),
            R.prop('tournament')
          )(game);
          return ( tournament_point === 0 ?
                   true :
                   ( tournament_point === 1 ?
                     false :
                     undefined
                   )
                 );
        },
        listForPlayer: function(player_name, game) {
          return R.prop('list', gameService.player(player_name, game));
        },
        tableForPlayer: function(player_name, game) {
          game = R.defaultTo({}, game);
          return R.prop('table', game);
        },
        isValid: function(game) {
          return ( R.type(R.path(['p1','name'], game)) === 'String' &&
                   R.type(R.path(['p2','name'], game)) === 'String' );
        },
        isAssassination$: R.propEq('victory', 'assassination'),
        winner: function(game) {
          return ( R.pathEq(['p1','tournament'], 1, game) ?
                   game.p1.name :
                   ( R.pathEq(['p2','tournament'], 1, game) ?
                     game.p2.name :
                     undefined
                   )
                 );
        },
        loser: function(game) {
          return ( R.pathEq(['p1','tournament'], 0, game) ?
                   game.p1.name :
                   ( R.pathEq(['p2','tournament'], 0, game) ?
                     game.p2.name :
                     undefined
                   )
                 );
        },
        toArray: function(with_custom_field, game) {
          var ret = [
            game.table,
            { value: game.p1.name,
              color: game.p1.tournament === 1 ? 'limegreen':'red'
            },
            { value: game.p2.name,
              color: game.p2.tournament === 1 ? 'limegreen':'red'
            },
            game.p1.list, game.p2.list,
            game.p1.tournament, game.p2.tournament,
            game.p1.control, game.p2.control,
            game.p1.army, game.p2.army,
            gameService.isAssassination$(game) ? 1 : 0
          ];
          if(with_custom_field) {
            ret = R.concat(ret, [game.p1.custom_field, game.p2.custom_field]);
          }
          return ret;
        },
        random: function gameRandom(m1_options, m2_options, lists_options, game) {
          m1_options = R.defaultTo([], m1_options);
          m2_options = R.defaultTo([], m2_options);
          lists_options = R.defaultTo([], lists_options);
          if(gameService.hasSubGames(game)) {
            R.forEach(function(game) {
              var p1 = R.head(R.shuffle(m1_options));
              m1_options = R.reject(R.eq(p1), m1_options);
              var p2 = R.head(R.shuffle(m2_options));
              m2_options = R.reject(R.eq(p2), m2_options);

              game.p1.name = p1;
              game.p2.name = p2;
              gameService.random$([], [], lists_options, game);
            }, game.games);
            R.extend(game, gameService.updatePointsFromSubGames(game));
            return;
          }
          game.victory = R.head(R.shuffle(['assassination', null]));
          game.p1.list = R.pipe(
            R.defaultTo([]),
            R.shuffle,
            R.head
          )(lists_options[game.p1.name]);
          game.p2.list = R.pipe(
            R.defaultTo([]),
            R.shuffle,
            R.head
          )(lists_options[game.p2.name]);
          var winner_loser = R.shuffle(['p1', 'p2']);
          game[winner_loser[0]].tournament = 1;
          game[winner_loser[1]].tournament = 0;
          game.p1.control = Math.floor(Math.random() * 6);
          game.p2.control = Math.floor(Math.random() * 6);
          game.p1.army = Math.floor(Math.random() * 51);
          game.p2.army = Math.floor(Math.random() * 51);
        }
      };
      function reducePlayerPointsFromSubGames(player, game) {
        return R.reduce(function(mem, sg) {
          return R.pipe(
            R.assoc('tournament', (mem.tournament || 0) + (sg[player].tournament || 0)),
            R.assoc('control', (mem.control || 0) + (sg[player].control || 0)),
            R.assoc('army', (mem.army || 0) + (sg[player].army || 0)),
            R.assoc('custom_field', (mem.custom_field || 0) + (sg[player].custom_field || 0)),
            R.assoc('assassination', (mem.assassination || 0) + (sg[player].assassination || 0))
          )(mem);
        }, R.pick(['name','list'], game[player]), game.games);
      }
      R.curryService(gameService);
      return gameService;
    }
  ])
  .factory('games', [
    'game',
    function(gameService) {
      var gamesService = {
        pointsForPlayer: function(player_name, brackets, bracket_weight, games) {
          var ret = R.pipe(
            R.map(gameService.player$(player_name)),
            gamesService.reducePoints$(brackets, bracket_weight)
          )(games);
          ret.assassination = R.pipe(
            R.filter(gameService.winForPlayer$(player_name)),
            R.filter(gameService.isAssassination$),
            R.length
          )(games);
          return ret;
        },
        pointsAgainstPlayer: function(player_name, brackets, bracket_weight, games) {
          var ret = R.pipe(
            R.map(function(game) {
              var opponent_name = gameService.opponentForPlayer(player_name, game);
              return gameService.player(opponent_name, game);
            }),
            gamesService.reducePoints$(brackets, bracket_weight)
          )(games);
          ret.assassination = R.pipe(
            R.filter(gameService.lossForPlayer$(player_name)),
            R.filter(gameService.isAssassination$),
            R.length
          )(games);
          return ret;
        },
        reducePoints: function(brackets, base_weight, results) {
          return R.reduceIndexed(function(mem, result, result_index) {
            return {
              bracket: ( R.exists(brackets) &&
                         R.exists(brackets[result_index]) ?
                         calculateBracketPoints(mem.bracket, result,
                                                brackets[result_index], base_weight) :
                         mem.bracket
                       ),
              tournament: mem.tournament + (result.tournament || 0),
              control: mem.control + (result.control || 0),
              army: mem.army + (result.army || 0),
              custom_field: mem.custom_field + (result.custom_field || 0),
              sos: 0
            };
          }, {
            bracket: 0,
            tournament: 0,
            control: 0,
            army: 0,
            custom_field: 0,
            sos: 0
          }, results);
        },
        opponentsForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(gameService.opponentForPlayer$(player_name)),
            R.reject(R.isNil)
          )(coll);
        },
        listsForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(gameService.listForPlayer$(player_name)),
            R.uniq,
            R.reject(R.isNil)
          )(coll);
        },
        tablesForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(gameService.tableForPlayer$(player_name)),
            R.reject(R.isNil)
          )(coll);
        },
        forCaster: function(player_name, caster_name, coll) {
          return R.filter(R.compose(R.eq(caster_name),
                                    gameService.listForPlayer$(player_name)),
                          coll);
        },
        updatePlayer: function(index, key, games) {
          var name = games[index][key].name;
          return R.pipe(
            R.mapIndexed(function(game, game_index) {
              if(game_index === index && key === 'p1') return game;
              if(game.p1.name === name) {
                return R.assocPath(['p1','name'], null, game);
              }
              return game;
            }),
            R.mapIndexed(function(game, game_index) {
              if(game_index === index && key === 'p2') return game;
              if(game.p2.name === name) {
                return R.assocPath(['p2','name'], null, game);
              }
              return game;
            })
          )(games);
        },
        updateTable: function(index, min_table, games) {
          var table = games[index].table;
          var other_index = table - min_table;
          
          games[other_index] = R.assoc('table',
                                      min_table + index,
                                      games[other_index]);
          
          return R.sortBy(R.prop('table'), games);
        },
        winners: function(coll) {
          return R.pipe(
            R.map(gameService.winner)
          )(coll);
        },
        losers: function(coll) {
          return R.pipe(
            R.map(gameService.loser)
          )(coll);
        },
        pairedPlayers: function(coll) {
          return R.pipe(
            R.flatten,
            R.chain(function(game) {
              return [ game.p1.name, game.p2.name ];
            }),
            R.reject(R.isNil),
            R.uniq()
          )(coll);
        },
        isPlayerPaired: function(player, coll) {
          return (0 <= R.indexOf(player.name, gamesService.pairedPlayers(coll)));
        },
      };
      function calculateBracketPoints(current_bracket_points,
                                      result, bracket,  bracket_weight) {
        bracket_weight = bracket_weight >> (bracket - 1);
        return current_bracket_points + bracket_weight * result.tournament;
      }
      function isInBracket(result_index, bracket_start) {
        return (!R.isNil(bracket_start) &&
                result_index >= bracket_start);
      }
      R.curryService(gamesService);
      return gamesService;
    }
  ]);
