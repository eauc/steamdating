'use strict';

angular.module('srApp.services')
 .factory('round', [
    'game',
    function(gameService) {
      var round = {
        gameForPlayer: function(coll, player_name) {
          if(!_.isArray(coll) ||
             coll.length === 0) return;

          return _.chain(coll)
            .map(_.partial(gameService.forPlayer, _, player_name))
            .without(undefined)
            .first()
            .value();
        },
        gamesForGroup: function(coll, players, group_index) {
          var start_index = Math.ceil(_.chain(players)
                                      .slice(0, group_index)
                                      .flatten()
                                      .value()
                                      .length / 2);
          var end_index = Math.ceil(start_index +
                                    players[group_index].length / 2);
          return _.chain(coll)
            .slice(start_index, end_index)
            .value();
        },
        pairedPlayers: function(coll) {
          return _.chain(coll)
            .flatten()
            .mapcat(function(game) {
              return [ game.p1.name, game.p2.name ];
            })
            .uniq()
            .without(null, undefined)
            .value();
        },
        isPlayerPaired: function(coll, player) {
          return (0 <= _.chain(coll)
                  .apply(round.pairedPlayers)
                  .indexOf(player.name)
                  .value());
        },
        updatePlayer: function(coll, index, key) {
          var name = coll[index][key].name;
          return _.chain(coll)
            .map(function(game, game_index) {
              if(game_index === index && key === 'p1') return game;
              if(game.p1.name === name) {
                var new_game = _.snapshot(game);
                new_game.p1.name = null;
                return new_game;
              }
              return game;
            })
            .map(function(game, game_index) {
              if(game_index === index && key === 'p2') return game;
              if(game.p2.name === name) {
                var new_game = _.snapshot(game);
                new_game.p2.name = null;
                return new_game;
              }
              return game;
            })
            .value();
        },
        updateTable: function(coll, index, min_table) {
          var table = coll[index].table;
          var other_index = table - min_table;
          
          coll[other_index] = _.snapshot(coll[other_index]);
          coll[other_index].table = min_table + index;
          
          return _.chain(coll)
            .sortBy('table')
            .value();
        },
        allGamesHaveResult: function(coll) {
          return _.chain(coll)
            .map(gameService.hasResult)
            .spy('hasres')
            .all()
            .spy('all')
            .value();
        },
        winners: function(coll) {
          return _.map(coll, gameService.winner);
        },
        losers: function(coll) {
          return _.map(coll, gameService.loser);
        }
      };
      return round;
    }
  ])
  .factory('rounds', [
    'round',
    'game',
    'games',
    function(roundService,
             gameService,
             gamesService) {
      var roundsService = {
        lastRoundIsComplete: function(coll) {
          return ( _.isEmpty(coll) ||
                   _.chain(coll)
                   .last()
                   .apply(roundService.allGamesHaveResult)
                   .value() );
        },
        createNextRound: function(players) {
          var table = 1;
          return _.map(players, function(group) {
            return _.chain(group.length/2)
              .range()
              .map(function() {
                return gameService.create({ table: table++ });
              })
              .value();
          });
        },
        registerNextRound: function(coll, next) {
          return _.cat(coll, [_.flatten(next)]);
        },
        drop: function(coll, round_index) {
          var new_coll = _.clone(coll);
          new_coll.splice(round_index, 1);
          return new_coll;
        },
        pointsForPlayer: function(coll, player_name, bracket_start, base_weight) {
          return _.chain(coll)
            .mapWith(roundService.gameForPlayer, player_name)
            .map(function(game) {
              // replace undefined with dummy game
              // it's important to keep the games indices correct in regards to rounds
              // otherwise bracket calculation is not possible
              if(!_.exists(game)) {
                return { p1: { name: player_name,
                               tournament: 0, control: 0,
                               army: 0, custom_field: 0 } };
              }
              return game;
            })
            .apply(gamesService.pointsForPlayer, player_name, bracket_start, base_weight)
            .value();
        },
        gamesForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(roundService.gameForPlayer, player_name)
            .without(undefined)
            .value();
        },
        opponentsForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(roundService.gameForPlayer, player_name)
            .without(undefined)
            .apply(gamesService.opponentsForPlayer, player_name)
            .value();
        },
        pairAlreadyExists: function(coll, game) {
          if(!_.exists(_.getPath(game, 'p1.name')) ||
             !_.exists(_.getPath(game, 'p2.name'))) return false;
          return (_.chain(coll)
                  .apply(roundsService.opponentsForPlayer, game.p1.name)
                  .indexOf(game.p2.name)
                  .value() >= 0);
        },
        listsForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(roundService.gameForPlayer, player_name)
            .apply(gamesService.listsForPlayer, player_name)
            .value();
        },
        tablesForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .mapWith(roundService.gameForPlayer, player_name)
            .apply(gamesService.tablesForPlayer, player_name)
            .value();
        }
      };
      return roundsService;
    }
  ]);
