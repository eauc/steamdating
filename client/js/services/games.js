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
              tournament: null,
              control: null,
              army: null,
              custom_field: null
            },
            p2: {
              name: null,
              list: null,
              tournament: null,
              control: null,
              army: null,
              custom_field: null
            }
          }, data);
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
          var tournament_point = R.prop('tournament',
                                        R.defaultTo({}, gameService.player(player_name, game)));
          return ( tournament_point === 1 ?
                   true :
                   ( tournament_point === 0 ?
                     false :
                     undefined
                   )
                 );
        },
        lossForPlayer: function(player_name, game) {
          var tournament_point = R.prop('tournament',
                                        gameService.player(player_name, game));
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
          return R.pipe(
            gameService.winner,
            function(winner) {
              return ( R.exists(winner) ?
                       gameService.opponentForPlayer(winner, game) :
                       undefined
                     );
            }
          )(game);
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
        }
      };
      R.curryService(gameService);
      return gameService;
    }
  ])
  .factory('games', [
    'game',
    function(gameService) {
      var gamesService = {
        pointsForPlayer: function(player_name, bracket_start, base_weight, games) {
          var ret = R.pipe(
            R.map(gameService.player$(player_name)),
            gamesService.reducePoints$(bracket_start, base_weight)
          )(games);
          ret.assassination = R.pipe(
            R.filter(gameService.winForPlayer$(player_name)),
            R.filter(gameService.isAssassination$),
            R.length
          )(games);
          return ret;
        },
        pointsAgainstPlayer: function(player_name, bracket_start, base_weight, games) {
          var ret = R.pipe(
            R.map(function(game) {
              var opponent_name = gameService.opponentForPlayer(player_name, game);
              return gameService.player(opponent_name, game);
            }),
            gamesService.reducePoints$(bracket_start, base_weight)
          )(games);
          ret.assassination = R.pipe(
            R.filter(gameService.lossForPlayer$(player_name)),
            R.filter(gameService.isAssassination$),
            R.length
          )(games);
          return ret;
        },
        reducePoints: function(bracket_start, base_weight, results) {
          return R.reduceIndexed(function(mem, result, result_index) {
            return {
              bracket: calculateBracketPoints(mem.bracket,
                                              result, result_index,
                                              bracket_start, base_weight),
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
      };
      function calculateBracketPoints(current_bracket_points,
                                      result, result_index,
                                      bracket_start,  base_weight) {
        var bracket_weight = base_weight >> (result_index - bracket_start);
        return ( isInBracket(result_index, bracket_start) ?
                 current_bracket_points + bracket_weight * result.tournament :
                 current_bracket_points );
      }
      function isInBracket(result_index, bracket_start) {
        return (!R.isNil(bracket_start) &&
                result_index >= bracket_start);
      }
      R.curryService(gamesService);
      return gamesService;
    }
  ]);
