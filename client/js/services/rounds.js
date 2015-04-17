'use strict';

angular.module('srApp.services')
 .factory('round', [
    'game',
    function(gameService) {
      var roundService = {
        gameForPlayer: function(player_name, coll) {
          if(R.type(coll) !== 'Array' ||
             R.isEmpty(coll)) return;

          return R.pipe(
            R.flatten,
            R.map(gameService.forPlayer$(player_name)),
            R.reject(R.isNil),
            R.head
          )(coll);
        },
        hasGamesGroups: function(coll) {
          return coll.length > 1;
        },
        gamesForGroup: function(players, group_index, coll) {
          return R.nth(group_index, coll);
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
          return (0 <= R.indexOf(player.name, roundService.pairedPlayers(coll)));
        },
        updatePlayer: function(index, key, coll) {
          var name = coll[index][key].name;
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
          )(coll);
        },
        updateTable: function(index, min_table, coll) {
          var table = coll[index].table;
          var other_index = table - min_table;
          
          coll[other_index] = R.assoc('table',
                                      min_table + index,
                                      coll[other_index]);
          
          return R.sortBy(R.prop('table'), coll);
        },
        allGamesHaveResult: function(coll) {
          return R.pipe(
            R.flatten,
            R.map(gameService.hasResult),
            R.all(R.identity)
          )(coll);
        },
        winners: function(coll) {
          return R.pipe(
            R.flatten,
            R.map(gameService.winner)
          )(coll);
        },
        losers: function(coll) {
          return R.pipe(
            R.flatten,
            R.map(gameService.loser)
          )(coll);
        }
      };
      R.curryService(roundService);
      return roundService;
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
          return ( R.isEmpty(coll) ||
                   roundService.allGamesHaveResult(R.last(coll))
                 );
        },
        createNextRound: function(players) {
          var table = 1;
          return R.map(function(group) {
            return R.pipe(
              R.range(0),
              R.map(function() {
                return gameService.create({ table: table++ });
              })
            )(group.length/2);
          }, players);
        },
        registerNextRound: function(next, coll) {
          return R.append(next, coll);
        },
        drop: function(round_index, coll) {
          return R.remove(round_index, 1, coll);
        },
        pointsForPlayer: function(player_name, bracket_start, base_weight, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.map(function(game) {
              // replace undefined with dummy game
              // it's important to keep the games indices correct in regards to rounds
              // otherwise bracket calculation is not possible
              if(R.isNil(game)) {
                return { p1: { name: player_name,
                               tournament: 0, control: 0,
                               army: 0, custom_field: 0 } };
              }
              return game;
            }),
            gamesService.pointsForPlayer$(player_name, bracket_start, base_weight)
          )(coll);
        },
        gamesForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.reject(R.isNil)
          )(coll);
        },
        opponentsForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.reject(R.isNil),
            gamesService.opponentsForPlayer$(player_name)
          )(coll);
        },
        pairAlreadyExists: function(game, coll) {
          if( R.isNil(R.path(['p1','name'], game)) ||
              R.isNil(R.path(['p2','name'], game))
            ) return false;
          return ( 0 <= R.pipe(
            roundsService.opponentsForPlayer$(game.p1.name),
            R.indexOf(game.p2.name)
          )(coll)
                 );
        },
        listsForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.reject(R.isNil),
            gamesService.listsForPlayer$(player_name)
          )(coll);
        },
        tablesForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.reject(R.isNil),
            gamesService.tablesForPlayer$(player_name)
          )(coll);
        },
        tableAlreadyPlayed: function(game, tables_groups_size, coll) {
          return R.pipe(
            gameService.playerNames,
            R.chain(function(name) {
              return R.isNil(name) ? [] : roundsService.tablesForPlayer(name, coll);
            }),
            R.map(roundsService.tableGroup$(tables_groups_size)),
            R.indexOf(roundsService.tableGroup(tables_groups_size, game.table)),
            R.lte(0)
          )(game);
        },
        tablesGroups: function(tables_groups_size, tables) {
          return R.pipe(
            R.map(roundsService.tableGroup$(tables_groups_size)),
            R.uniq
          )(tables);
        },
        tableGroup: function(groups_size, table_number) {
          return Math.floor((table_number-1) / groups_size)+1;
        }
      };
      R.curryService(roundsService);
      return roundsService;
    }
  ]);
