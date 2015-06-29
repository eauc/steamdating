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
          ret.members = R.pipe(
            R.defaultTo([]),
            R.map(playerService.create)
          )(ret.members);
          ret.lists = R.map(listService.create, ret.lists);
          return ret;
        },
        is: function(name, player) {
          return R.propEq('name', name, player);
        },
        hasMembers: function(player) {
          return !R.pipe(
            R.prop('members'),
            R.defaultTo([]),
            R.isEmpty
          )(player);
        },
        members: function(player) {
          return R.defaultTo([], player.members);
        },
        addMember: function(member, player) {
          player.members = R.pipe(
            R.defaultTo([]),
            R.append(member)
          )(player.members);
          return player;
        },
        dropMember: function(member, player) {
          player.members = R.pipe(
            R.defaultTo([]),
            R.reject(playerService.is$(member.name))
          )(player.members);
          return player;
        },
        rank: function(critFn, player) {
          var rank;
          try {
            rank = critFn(player.custom_field,
                          player.points.team_tournament,
                          player.points.tournament,
                          player.points.sos,
                          player.points.control,
                          player.points.army,
                          player.points.assassination,
                          player.points.custom_field);
          }
          catch(e) {
            console.log('error ranking player', player, e);
            return "Error : " + e.message;
          }
          return rank;
        },
        updateListsPlayed: function(rounds, player) {
          return R.pipe(
            R.assoc('lists_played',
                    roundsService.listsForPlayer(player.name, rounds)),
            R.assoc('members',
                    R.map(playerService.updateListsPlayed$(rounds),
                          playerService.members(player)))
          )(player);
        },
        allListsHaveBeenPlayed: function(player) {
          return R.pipe(R.prop('lists'),
                        listsService.casters,
                        R.flip(R.difference)(player.lists_played),
                        R.isEmpty)(player);
        },
        updatePoints: function(rounds, player) {
          var ret = player;
          if(playerService.hasMembers(player)) {
            ret = R.assoc('members',
                          R.map(playerService.updatePoints$(rounds),
                                player.members),
                          ret);
          }
          return R.assoc('points',
                         roundsService.pointsForPlayer(player.name, rounds),
                         ret);
        },
        updateSoS: function playerUpdateSos(sosFromPlayers, rounds, players, player) {
          if(playerService.hasMembers(player)) {
            player = R.assoc('members',
                             R.map(playerService.updateSoS$(sosFromPlayers, rounds, players),
                                   player.members),
                             player);
          }
          var sos_key = ( playerService.hasMembers(player) ?
                          'team_tournament' : 'tournament'
                        );
          var opponents = roundsService.opponentsForPlayer(player.name, rounds);
          player.points.sos = sosFromPlayers(opponents,
                                             sos_key,
                                             players);
          return player;
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
    'games',
    'round',
    'rounds',
    'ranking',
    'lists',
    function(playerService,
             factionsService,
             gameService,
             gamesService,
             roundService,
             roundsService,
             rankingService,
             listsService) {
      var playersService = {
        add: function playersAdd(group_index, player, coll) {
          var new_group = R.append(player, coll[group_index]);
          var ret = R.remove(group_index, 1, coll);
          return R.insert(group_index, new_group, ret);
        },
        simplePlayers: function playersSimplePlayers(coll) {
          return R.pipe(
            R.flatten,
            R.chain(function(player) {
              return ( playerService.hasMembers(player) ?
                       playerService.members(player) :
                       [player]
                     );
            })
          )(coll);
        },
        hasTeam: function playersHasTeam(coll) {
          return !!R.pipe(
            R.flatten,
            R.find(playerService.hasMembers)
          )(coll);
        },
        maxTeamSize: function playersMaxTeamSize(coll) {
          return R.pipe(
            R.flatten,
            R.map(playerService.members),
            R.map(R.length),
            R.max,
            // R.max returns -Infinity if list is empty
            function(max) {
              return Math.max(max, 0);
            }
          )(coll);
        },
        addToTeam: function playersAddToTeam(team, member, coll) {
          R.pipe(
            playersService.player$(team),
            playerService.addMember$(member)
          )(coll);
          return coll;
        },
        switchPlayerToTeamMember: function playersSwitchPlayerToTeamMember(team_name, player,
                                                                           coll) {
          R.pipe(
            playersService.player$(team_name),
            playerService.addMember$(player)
          )(coll);
          return playersService.drop(player, coll);
        },
        switchTeamMemberToPlayer: function playersSwitchTeamMemberToPlayer(team_name, group_index,
                                                                           member, coll) {
          R.pipe(
            playersService.player$(team_name),
            playerService.dropMember$(member)
          )(coll);
          return playersService.add(group_index, member, coll);
        },
        switchMemberBetweenTeams: function playersSwitchMemberBetweenTeams(old_team_name,
                                                                           new_team_name,
                                                                           member, coll) {
          R.pipe(
            playersService.player$(old_team_name),
            playerService.dropMember$(member)
          )(coll);
          R.pipe(
            playersService.player$(new_team_name),
            playerService.addMember$(member)
          )(coll);
          return coll;
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
          return R.pipe(
            R.flatten,
            R.find(playerService.is$(name))
          )(coll);
        },
        member: function(name, coll) {
          return R.pipe(
            R.flatten,
            R.chain(playerService.members),
            R.find(playerService.is$(name))
          )(coll);
        },
        playerFull: function(name, coll) {
          return ( playersService.player(name, coll) ||
                   playersService.member(name, coll)
                 );
        },
        dropedInRound: function(round_index, coll) {
          return R.map(R.filter(playerService.hasDropedInRound$(round_index)))(coll);
        },
        notDropedInRound: function(round_index, coll) {
          return R.map(R.reject(playerService.hasDropedInRound$(round_index)))(coll);
        },
        names: function playersNames(coll) {
          return R.pipe(R.flatten,
                        R.pluck('name'),
                        R.sortBy(R.identity)
                       )(coll);
        },
        namesMembers: function playersNamesMembers(coll) {
          return R.pipe(R.flatten,
                        R.chain(playerService.members),
                        R.pluck('name'),
                        R.sortBy(R.identity)
                       )(coll);
        },
        namesFull: function playersNamesFull(coll) {
          return R.concat(playersService.names(coll),
                          playersService.namesMembers(coll));
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
        factionForMember: function(player_name, coll) {
          return R.pipe(
            playersService.member$(player_name),
            R.defaultTo({ faction: null }),
            R.prop('faction')
          )(coll);
        },
        factionForFull: function(player_name, coll) {
          return R.pipe(
            playersService.playerFull$(player_name),
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
            team_undefeated: playersService.withPoints('points.team_tournament',
                                                       nb_rounds,
                                                       coll),
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
        bestsSimples: function playersBestsSimples(nb_rounds, coll) {
          return R.pipe(
            playersService.simplePlayers,
            playersService.bests$(nb_rounds)
          )(coll);
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
            R.map(function(group) {
              return R.map(playerService.updatePoints$(rounds),
                           group);
            }),
            playersService.updateBracketPoints$(rounds),
            R.mapIndexed(function(group, group_index, updated_players_without_sos) {
              return R.map(function(player) {
                return playerService.updateSoS(playersService.sosFromPlayers,
                                               rounds, updated_players_without_sos,
                                               player);
              }, group);
            })
          )(coll);
        },
        updateBracketPoints: function(rounds, coll) {
          var players_not_droped = playersService.notDropedInRound(R.length(rounds)-1, coll);
          return R.mapIndexed(function(group, group_index) {
            if(R.isEmpty(rounds)) return group;
            
            var nb_bracket_rounds = roundService.bracketForGroup(group_index, R.last(rounds));
            if(R.isNil(nb_bracket_rounds)) return group;
            
            var games_groups_bracket_size = players_not_droped[group_index].length >>
                (nb_bracket_rounds);
            
            R.pipe(
              R.last,
              roundService.gamesForGroup$(group_index),
              R.chunkAll(games_groups_bracket_size, null),
              R.chain(function(chunk) {
                var winners = R.reject(R.isNil, gamesService.winners(chunk));
                var losers = R.reject(R.isNil, gamesService.losers(chunk));
                return [winners, losers];
              }),
              R.mapIndexed(function(chunk, index, chunks) {
                var bracket_point = R.length(chunks) - index;
                R.forEach(function(name) {
                  var player = R.find(playerService.is$(name), group);
                  player.points = R.assoc('bracket', bracket_point,
                                          player.points);
                }, chunk);
                return chunk;
              }),
              R.flatten,
              R.difference(R.pluck('name', group)),
              function(no_result) {
                R.forEach(function(name) {
                  var player = R.find(R.propEq('name', name), group);
                  player.points = R.assoc('bracket', 0,
                                          player.points);
                }, no_result);
              }
            )(rounds);
            return group;
          }, coll);
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
        sosFromPlayers: function(names, key, coll) {
          return R.pipe(R.map(R.flip(playersService.playerFull$)(coll)),
                        R.reject(R.isNil),
                        R.reduce(function(mem, player) {
                          return mem + R.path(['points',key], player);
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
        },
      };
      function buildRankingFunction(state, is_bracket, coll) {
        if(is_bracket) {
          return function(player) { return player.points.bracket; };
        }
        else {
          var crit = ( playersService.hasTeam(coll) ?
                       state.ranking.team :
                       state.ranking.player
                     );
          var max_team_size = playersService.maxTeamSize(coll);
          var critFn = rankingService.buildPlayerCritFunction(crit,
                                                              state.rounds.length,
                                                              coll.length,
                                                              max_team_size);
          if(R.type(critFn) !== 'Function') {
            console.error('Error create ranking function', critFn);
            return null;
          }
          return playerService.rank$(critFn);
        }
      }
      R.curryService(playersService);
      return playersService;
    }
  ]);
