'use strict';

angular.module('srApp.services')
  .factory('player', [
    'rounds',
    'list',
    'lists',
    function(roundsService,
             listService,
             listsService) {
      var playerService = {
        create: function(data) {
          var ret = R.merge({
            name: null,
            droped: null,
            faction: null,
            origin: null,
            team: null,
            custom_field: 0,
            notes: null,
            lists: [],
            lists_played: [],
            points: {
              tournament: 0,
              sos: 0,
              control: 0,
              army: 0,
              custom_field: 0
            }
          }, data);
          ret.lists = R.map(listService.create, ret.lists);
          return ret;
        },
        is: function(name, player) {
          return R.propEq('name', name, player);
        },
        rank: function(critFn, player) {
          var rank;
          try {
            rank = critFn(player.custom_field,
                          player.points.tournament,
                          player.points.sos,
                          player.points.control,
                          player.points.army,
                          player.points.assassination,
                          player.points.custom_field);
          }
          catch(e) {
            return "Error : " + e.message;
          }
          return rank;
        },
        updateListsPlayed: function(rounds, player) {
          return R.assoc('lists_played',
                         roundsService.listsForPlayer(player.name, rounds),
                         player);
        },
        allListsHaveBeenPlayed: function(player) {
          return R.pipe(R.prop('lists'),
                        listsService.casters,
                        R.flip(R.difference)(player.lists_played),
                        R.isEmpty)(player);
        },
        updatePoints: function(group_index, bracket_weight, rounds, player) {
          return R.assoc('points',
                         roundsService.pointsForPlayer(player.name,
                                                       group_index,
                                                       bracket_weight,
                                                       rounds),
                         player);
        },
        drop: function(round_index, player) {
          return R.assoc('droped', round_index, player);
        },
        undrop: function(player) {
          return R.assoc('droped', null, player);
        },
        hasDropedInRound: function(round_index, player) {
          return ( R.type(player.droped) === 'Number' &&
                   ( R.type(round_index) !== 'Number' ||
                     player.droped <= round_index
                   )
                 );
        },
        isDroped: function(player) {
          return playerService.hasDropedInRound(null, player);
        }
      };
      R.curryService(playerService);
      return playerService;
    }
  ])
  .factory('players', [
    'player',
    'factions',
    'game',
    'round',
    'rounds',
    'ranking',
    'lists',
    function(playerService,
             factionsService,
             gameService,
             roundService,
             roundsService,
             rankingService,
             listsService) {
      function buildRankingFunction(state, is_bracket, coll) {
        if(is_bracket) {
          return function(player) { return player.points.bracket; };
        }
        else {
          var critFn = rankingService.buildPlayerCritFunction(state.ranking.player,
                                                              state.rounds.length,
                                                              coll.length);
          if(R.type(critFn) !== 'Function') {
            console.error('Error create ranking function', critFn);
            return null;
          }
          return playerService.rank$(critFn);
        }
      }
      var playersService = {
        add: function playersAdd(group_index, player, coll) {
          var new_group = R.append(player, coll[group_index]);
          var ret = R.remove(group_index, 1, coll);
          return R.insert(group_index, new_group, ret);
        },
        drop: function(player, coll) {
          return R.pipe(R.map(R.reject(playerService.is$(player.name))),
                        R.reject(R.isEmpty),
                        // ensure there is at least one empty group left
                        function(players) {
                          if(R.isEmpty(players)) return [[]];
                          return players;
                        })(coll);
        },
        player: function(name, coll) {
          return R.pipe(R.flatten,
                        R.find(playerService.is$(name))
                       )(coll);
        },
        dropedInRound: function(round_index, coll) {
          return R.map(R.filter(playerService.hasDropedInRound$(round_index)))(coll);
        },
        notDropedInRound: function(round_index, coll) {
          return R.map(R.reject(playerService.hasDropedInRound$(round_index)))(coll);
        },
        names: function(coll) {
          return R.pipe(R.flatten,
                        R.pluck('name'),
                        R.sortBy(R.identity)
                       )(coll);
        },
        factions: function(base_factions, coll) {
          return R.pipe(R.flatten,
                        R.pluck('faction'),
                        R.union(R.keys(R.defaultTo({}, base_factions))),
                        R.reject(R.isNil),
                        R.sortBy(R.identity)
                       )(coll);
        },
        forFaction: function(faction_name, coll) {
          return R.pipe(R.flatten,
                        R.filter(R.propEq('faction', faction_name))
                       )(coll);
        },
        factionFor: function(player_name, coll) {
          return R.pipe(
            playersService.player$(player_name),
            R.defaultTo({ faction: null }),
            R.prop('faction')
          )(coll);
        },
        countByFaction: function(players) {
          return R.pipe(
            R.flatten,
            R.countBy(R.prop('faction'))
          )(players);
        },
        casters: function(coll) {
          return R.pipe(R.flatten,
                        R.chain(R.prop('lists')),
                        R.reject(R.isNil),
                        R.map(function(list) {
                          return (!R.isNil(list.caster) ?
                                  { faction: list.faction || '',
                                    name: list.caster } :
                                  undefined);
                        }),
                        R.reject(R.isNil),
                        R.uniqWith(R.eqProps('name')),
                        R.sort(function(a,b) {
                          var comp = a.faction.localeCompare(b.faction);
                          if(comp !== 0) return comp;
                          return a.name.localeCompare(b.name);
                        })
                       )(coll);
        },
        forCaster: function(caster_name, coll) {
          return R.pipe(R.flatten,
                        R.filter(R.compose(listsService.containsCaster$(caster_name),
                                           R.defaultTo([]),
                                           R.prop('lists')))
                       )(coll);
        },
        origins: function(coll) {
          return R.pipe(R.flatten,
                        R.pluck('origin'),
                        R.uniq,
                        R.reject(R.isNil),
                        R.sortBy(R.identity)
                       )(coll);
        },
        originFor: function(player_name, coll) {
          return R.pipe(
            playersService.player$(player_name),
            R.defaultTo({ origin: null }),
            R.prop('origin')
          )(coll);
        },
        withPoints: function(key, value, coll) {
          var path = R.split('.', key);
          return R.pipe(R.flatten,
                        R.filter(function(player) {
                          return ( R.path(path, player) !== 0 &&
                                   R.path(path, player) === value
                                 );
                        }),
                        R.pluck('name')
                       )(coll);
        },
        maxPoints: function(key, coll) {
          var path = R.split('.', key);
          return R.pipe(R.flatten,
                        R.map(R.path(path)),
                        R.max
                       )(coll);
        },
        bests: function(nb_rounds, coll) {
          var maxes = {
            custom_field: playersService.maxPoints('custom_field', coll),
            points: {
              sos: playersService.maxPoints('points.sos', coll),
              control: playersService.maxPoints('points.control', coll),
              army: playersService.maxPoints('points.army', coll),
              assassination: playersService.maxPoints('points.assassination', coll),
              custom_field: playersService.maxPoints('points.custom_field', coll),
            }
          };
          return {
            undefeated: playersService.withPoints('points.tournament',
                                                  nb_rounds,
                                                  coll),
            custom_field: playersService.withPoints('custom_field',
                                                    maxes.custom_field,
                                                    coll),
            points: {
              sos: playersService.withPoints('points.sos',
                                             maxes.points.sos,
                                             coll),
              control: playersService.withPoints('points.control',
                                                 maxes.points.control,
                                                 coll),
              army: playersService.withPoints('points.army',
                                              maxes.points.army,
                                              coll),
              assassination: playersService.withPoints('points.assassination',
                                                       maxes.points.assassination,
                                                       coll),
              custom_field: playersService.withPoints('points.custom_field',
                                                      maxes.points.custom_field,
                                                      coll),
            }
          };
        },
        gamesForRounds: function(rounds, coll) {
          return R.map(function(group) {
            return R.map(function(player) {
              return R.map(roundService.gameForPlayer$(player.name), rounds);
            }, group);
          }, coll);
        },
        updateListsPlayed: function(rounds, coll) {
          return R.map(R.map(playerService.updateListsPlayed$(rounds)))(coll);
        },
        updatePoints: function(rounds, coll) {
          return R.pipe(
            R.mapIndexed(function(group, group_index) {
              return R.map(playerService.updatePoints$(group_index,
                                                       group.length/2,
                                                       rounds),
                           group);
            }),
            R.mapIndexed(function(group, group_index, updated_players_without_sos) {
              return R.map(function(player) {
                var opponents = roundsService.opponentsForPlayer(player.name, rounds);
                player.points.sos = playersService.sosFromPlayers(opponents,
                                                                  updated_players_without_sos);
                return player;
              }, group);
            })
          )(coll);
        },
        sortGroup: function(state, is_bracket, coll) {
          var rankFn = buildRankingFunction(state, is_bracket, coll);
          if(R.isNil(rankFn)) return coll;
          
          var rank = 0;
          return R.pipe(
            // group players by ranking criterion
            R.groupBy(rankFn),
            function(players_grouped_by_ranking) {
              return R.pipe(
                // get list of rankings and order it decrementally
                R.keys,
                R.sortBy(function(ranking) { return -parseFloat(ranking); }),
                // fold each ranking list into final list
                R.reduce(function(mem, ranking) {
                  mem.push({ rank: rank+1,
                             players: players_grouped_by_ranking[ranking] });
                  rank += players_grouped_by_ranking[ranking].length;
                  return mem;
                }, [])
              )(players_grouped_by_ranking);
            }
          )(coll);
        },
        sort: function(state, is_bracket, coll) {
          return R.mapIndexed(function(group, group_index) {
            return playersService.sortGroup(state, is_bracket[group_index], group);
          }, coll);
        },
        sosFromPlayers: function(names, coll) {
          return R.pipe(R.map(R.flip(playersService.player$)(coll)),
                        R.reject(R.isNil),
                        R.reduce(function(mem, player) {
                          return mem + R.path(['points','tournament'], player);
                        }, 0)
                       )(names);
        },
        areAllPaired: function(round, coll) {
          return R.pipe(playersService.names,
                        R.flip(R.difference)(roundService.pairedPlayers(round)),
                        R.isEmpty
                       )(coll);
        },
        indexRangeForGroup: function(group_index, coll) {
          var first_player = R.pipe(
            R.slice(0, group_index),
            R.flatten,
            R.length
          )(coll);
          var next_player = first_player + coll[group_index].length;
          return [first_player, next_player];
        },
        chunkGroups: function(size, coll) {
          return R.pipe(R.flatten,
                        R.chunkAll(size, null)
                       )(coll);
        },
        splitNewGroup: function(names, coll) {
          var new_group = R.map(R.flip(playersService.player$)(coll))(names);
          return R.pipe(
            R.map(R.flip(R.difference)(new_group)),
            R.append(new_group),
            R.reject(R.isEmpty)
          )(coll);
        },
        groupForPlayer: function(player_name, coll) {
          return R.pipe(
            R.map(R.find(R.propEq('name', player_name))),
            R.findIndex(R.not(R.isNil))
          )(coll);
        },
        movePlayerGroupFront: function(player_name, coll) {
          var group_index = playersService.groupForPlayer(player_name, coll);
          if(0 >= group_index) return coll;
          var player = playersService.player(player_name, coll);
          var old_group = R.difference(coll[group_index], [player]);
          var new_group = R.append(player, coll[group_index-1]);
          return R.pipe(
            R.remove(group_index-1, 2),
            R.insertAll(group_index-1, [new_group, old_group]),
            R.reject(R.isEmpty)
          )(coll);
        },
        movePlayerGroupBack: function(player_name, coll) {
          var group_index = playersService.groupForPlayer(player_name, coll);
          if(0 > group_index ||
             group_index >= coll.length-1) return coll;
          var player = playersService.player(player_name, coll);
          var old_group = R.difference(coll[group_index], [player]);
          var new_group = R.append(player, coll[group_index+1]);
          return R.pipe(
            R.remove(group_index, 2),
            R.insertAll(group_index, [old_group, new_group]),
            R.reject(R.isEmpty)
          )(coll);
        },
        moveGroupFront: function(group_index, coll) {
          if(0 >= group_index) return coll;

          var group = coll[group_index];
          return R.pipe(
            R.remove(group_index, 1),
            R.insert(group_index-1, group)
          )(coll);
        },
        moveGroupBack: function(group_index, coll) {
          if(0 > group_index ||
             group_index >= coll.length-1) return coll;
          var group = coll[group_index];
          return R.pipe(
            R.remove(group_index, 1),
            R.insert(group_index+1, group)
          )(coll);
        },
        size: function(coll) {
          return R.flatten(coll).length;
        },
        nbGroups: function(coll) {
          return coll.length;
        },
        groupSizeIsEven: function(round_index, group) {
          return ( R.pipe(
            R.reject(playerService.hasDropedInRound$(round_index)),
            R.length
          )(group) & 1 ) === 0;
        },
        tableRangeForGroup: function(group_index, coll) {
          var group_range = playersService.indexRangeForGroup(group_index, coll);
          return R.range(Math.round(group_range[0]/2+1),
                         Math.round(group_range[1]/2+1));
        },
        gameSameFactions: function(game, coll) {
          return R.pipe(
            gameService.playerNames,
            R.map(function(name) {
              return R.isNil(name) ? null : playersService.factionFor(name, coll);
            }),
            function(factions) {
              var is_set = R.isSet(factions);
              var is_empty = R.isEmpty(R.reject(R.isNil, factions));
              return ( !is_empty &&
                       !is_set );
            }
          )(game);
        },
        gameSameOrigins: function(game, coll) {
          return R.pipe(
            gameService.playerNames,
            R.map(function(name) {
              return R.isNil(name) ? null : playersService.originFor(name, coll);
            }),
            function(origins) {
              var is_set = R.isSet(origins);
              var is_empty = R.isEmpty(R.reject(R.isNil, origins));
              return ( !is_empty &&
                       !is_set );
            }
          )(game);
        }
      };
      R.curryService(playersService);
      return playersService;
    }
  ]);
