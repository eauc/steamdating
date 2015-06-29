'use strict';

angular.module('srApp.services')
  .factory('round', [
    'game',
    'games',
    'lists',
    function(gameService,
             gamesService,
             listsService) {
      var roundService = {
        create: function(players) {
          var table = 1;
          return {
            bracket: R.map(R.always(undefined), players),
            scenario: null,
            games: R.map(function(group) {
              return R.pipe(
                R.range(0),
                R.map(function() {
                  return gameService.create({
                    table: table++
                  });
                })
              )(group.length/2);
            }, players)
          };
        },
        createSubGames: function roundCreateSubGames(team_size, round) {
          return R.assoc('games', R.map(R.map(gameService.createSubGames$(team_size)),
                                        round.games),
                         round);
        },
        gameForPlayer: function(player_name, coll) {
          return R.pipe(
            R.prop('games'),
            R.defaultTo([]),
            R.flatten,
            R.map(gameService.forPlayer$(player_name)),
            R.find(R.exists)
          )(coll);
        },
        hasGamesGroups: function(coll) {
          return coll.games.length > 1;
        },
        gamesForGroup: function(group_index, coll) {
          return R.nth(group_index, coll.games);
        },
        pairedPlayers: function(coll) {
          return gamesService.pairedPlayers(coll.games);
        },
        isPlayerPaired: function(player, coll) {
          return gamesService.isPlayerPaired(player, coll.games);
        },
        allGamesHaveResult: function(coll) {
          return R.pipe(
            R.prop('games'),
            R.flatten,
            R.all(gameService.hasResult)
          )(coll);
        },
        groupIsInBracket: function(group_index, coll) {
          return R.exists(coll.bracket[group_index]);
        },
        bracketForGroup: function(group_index, coll) {
          return R.nth(group_index, coll.bracket);
        },
        setBracketForGroup: function(group_index, previous_bracket, coll) {
          var new_bracket = R.clone(coll.bracket);
          new_bracket[group_index] = ( R.isNil(previous_bracket) ?
                                       1 :
                                       previous_bracket+1
                                     );
          return R.assoc('bracket', new_bracket, coll);
        },
        resetBracketForGroup: function(group_index, coll) {
          var new_bracket = R.clone(coll.bracket);
          new_bracket[group_index] = undefined;
          return R.assoc('bracket', new_bracket, coll);
        },
        groupBracketRoundOf: function(group_index, coll) {
          if(!roundService.groupIsInBracket(group_index, coll)) {
            return 'Not in bracket';
          }
          var group_size = coll.games[group_index].length * 2;
          var bracket_size = group_size >> coll.bracket[group_index];
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
        random: function(getPlayer, getMembers, players, coll) {
          R.forEach(function(games_group) {
            R.forEach(function(game) {
              var m1_options = R.pipe(
                getMembers(game.p1.name),
                R.pluck('name')
              )(players);
              var m2_options = R.pipe(
                getMembers(game.p2.name),
                R.pluck('name')
              )(players);

              var lists_options = {};
              getCastersForPlayerName(getPlayer, players, lists_options, game.p1.name);
              getCastersForPlayerName(getPlayer, players, lists_options, game.p2.name);
              R.forEach(getCastersForPlayerName(getPlayer, players, lists_options),
                        R.concat(m1_options,
                                 m2_options));
              return gameService.random(m1_options, m2_options, lists_options, game);
            }, games_group);
          }, coll.games);
          return coll;
        }
      };
      var getCastersForPlayerName = R.curry(function _getCastersForPlayerName(getPlayer,
                                                                              players,
                                                                              casters,
                                                                              player_name) {
        casters[player_name] = casters[player_name] || R.pipe(
          getPlayer(player_name),
          // playersService.playerFull$(player_name),
          R.defaultTo({ lists: [] }),
          R.prop('lists'),
          listsService.casters
        )(players);
      });
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
        registerNextRound: function(next, coll) {
          return R.append(next, coll);
        },
        drop: function(round_index, coll) {
          return R.remove(round_index, 1, coll);
        },
        pointsForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(roundService.gameForPlayer$(player_name)),
            R.map(function(game) {
              // replace undefined with dummy game
              // it's important to keep the games indices correct in regards to rounds
              // otherwise bracket calculation is not possible
              if(R.isNil(game)) {
                return { p1: { name: player_name,
                               team_tournament: 0,
                               tournament: 0, control: 0,
                               army: 0, custom_field: 0 } };
              }
              return game;
            }),
            gamesService.pointsForPlayer$(player_name)
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
        },
        nbRoundsNeededForNPlayers: function(n_players) {
          var n_rounds = 1;
          var max_players = 2;
          while(n_rounds < 10 &&
                max_players < n_players) {
            n_rounds++;
            max_players *= 2;
          }
          return n_rounds;
        }
      };
      R.curryService(roundsService);
      return roundsService;
    }
  ]);
