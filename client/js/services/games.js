'use strict';

angular.module('srApp.services')
  .factory('game', [
    function() {
      var gameService = {
        create: function(data) {
          return _.deepExtend({
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
            },
            games: []
          }, data);
        },
        forPlayer: function(game, player_name) {
          if(player_name === game.p1.name ||
             player_name === game.p2.name) return game;
          if(0 === game.games.length) return;
          return _.chain(game.games)
            .filter(_.partial(gameService.forPlayer, _, player_name))
            .first()
            .value();
        },
        player: function(game, player_name) {
          var p1_name = _.getPath(game, 'p1.name');
          return ( p1_name === player_name ?
                   _.getPath(game, 'p1') :
                   _.getPath(game, 'p2') );
        },
        opponentForPlayer: function(game, player_name) {
          var p1_name = _.getPath(game, 'p1.name');
          return ( p1_name === player_name ?
                   _.getPath(game, 'p2.name') :
                   p1_name );
        },
        hasResult: function(game) {
          return ( _.isNumber(game.p1.tournament) &&
                   _.isNumber(game.p2.tournament) );
        },
        winForPlayer: function(game, player_name) {
          var tournament_point = _.chain(game)
            .apply(gameService.player, player_name)
            .getPath('tournament')
            .value();
          return (tournament_point === 1 ? true :
                  (tournament_point === 0 ? false : undefined));
        },
        lossForPlayer: function(game, player_name) {
          var tournament_point = _.chain(game)
            .apply(gameService.player, player_name)
            .getPath('tournament')
            .value();
          return (tournament_point === 0 ? true :
                  (tournament_point === 1 ? false : undefined));
        },
        listForPlayer: function(game, player_name) {
          return _.chain(game)
            .apply(gameService.player, player_name)
            .getPath('list')
            .value();
        },
        tableForPlayer: _.partial(_.getPath, _, 'table'),
        isValid: function(game) {
          return (_.isString(game.p1.name) &&
                  _.isString(game.p2.name));
        },
        isAssassination: function(game) {
          return game.victory === 'assassination';
        },
        winner: function(game) {
          return (game.p1.tournament === 1 ? game.p1.name :
                  game.p2.tournament === 1 ? game.p2.name :
                  undefined);
        },
        loser: function(game) {
          return _.chain(game)
            .apply(gameService.winner)
            .apply(function(winner) {
              return ( _.exists(winner) ?
                       gameService.opponentForPlayer(game, winner) :
                       undefined );
            })
            .value();
        },
        toArray: function(game, with_custom_field) {
          var ret = [ game.table,
                      game.p1.name, game.p2.name,
                      game.p1.list, game.p2.list,
                      game.p1.tournament, game.p2.tournament,
                      game.p1.control, game.p2.control,
                      game.p1.army, game.p2.army,
                      gameService.isAssassination(game) ? 1 : 0
                    ];
          if(with_custom_field) {
            ret = _.cat(ret, [game.p1.custom_field, game.p2.custom_field]);
          }
          return ret;
        }
      };
      return gameService;
    }
  ])
  .factory('games', [
    'game',
    function(gameService) {
      var gamesService = {
        pointsForPlayer: function(games, player_name, bracket_start, base_weight) {
          var ret = _.chain(games)
            .mapWith(gameService.player, player_name)
            .apply(gamesService.reducePoints, bracket_start, base_weight)
              .value();
          ret.assassination = _.chain(games)
            .filter(_.partial(gameService.winForPlayer, _, player_name))
            .filter(gameService.isAssassination)
            .size()
            .value();
          return ret;
        },
        pointsAgainstPlayer: function(games, player_name, bracket_start, base_weight) {
          var ret = _.chain(games)
            .map(function(game) {
              var opponent_name = gameService.opponentForPlayer(game, player_name);
              return gameService.player(game, opponent_name);
            })
            .apply(gamesService.reducePoints, bracket_start, base_weight)
            .value();
          ret.assassination = _.chain(games)
            .filter(_.partial(gameService.lossForPlayer, _, player_name))
            .filter(gameService.isAssassination)
            .size()
            .value();
          return ret;
        },
        reducePoints: function(results, bracket_start, base_weight) {
          return _.chain(results)
            .reduce(function(mem, result, result_index) {
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
            })
            .value();
        },
        opponentsForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(gameService.opponentForPlayer, player_name)
            .without(undefined)
            .value();
        },
        listsForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(gameService.listForPlayer, player_name)
            .uniq()
            .without(undefined, null)
            .value();
        },
        tablesForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(gameService.tableForPlayer, player_name)
            .without(undefined, null)
            .value();
        },
        forCaster: function(coll, player_name, caster_name) {
          return _.filter(coll, function(game) {
            return _.chain(game)
              .apply(gameService.listForPlayer, player_name)
              .value() === caster_name;
          });
        },
      };
      function isInBracket(result_index, bracket_start) {
        return (_.exists(bracket_start) &&
                result_index >= bracket_start);
      }
      function calculateBracketPoints(current_bracket_points,
                                      result, result_index,
                                      bracket_start,  base_weight) {
        var bracket_weight = base_weight >> (result_index - bracket_start);
        return ( isInBracket(result_index, bracket_start) ?
                 current_bracket_points + bracket_weight * result.tournament :
                 current_bracket_points );
      }
      return gamesService;
    }
  ]);
