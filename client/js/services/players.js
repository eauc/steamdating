'use strict';

angular.module('srApp.services')
  .factory('player', [
    'rounds',
    'lists',
    function(roundsService,
             listsService) {
      return {
        is: function(player, name) {
          return player.name === name;
        },
        rank: function(player, critFn) {
          var rank;
          try {
            rank = critFn(player.points.tournament,
                          player.points.sos,
                          player.points.control,
                          player.points.army);
          }
          catch(e) {
            return "Error : " + e.message;
          }
          return rank;
        },
        create: function(name, faction, city, team) {
          return {
            name: name,
            faction: faction,
            city: city,
            team: team,
            lists: [],
            lists_played: [],
            points: {
              tournament: 0,
              sos: 0,
              control: 0,
              army: 0
            }
          };
        },
        updateListsPlayed: function(player, rounds) {
          return _.chain(player)
            .clone()
            .apply(function(player) {
              player.lists_played = roundsService.listsForPlayer(rounds, player.name);
              return player;
            })
            .value();
        },
        allListsHaveBeenPlayed: function(player) {
          return _.chain(player.lists)
            .apply(listsService.casters)
            .difference(player.lists_played)
            .value().length === 0;
        },
        updatePoints: function(player, rounds, bracket_start, bracket_weight) {
          return _.chain(player)
            .clone()
            .apply(function(player) {
              player.points = roundsService.pointsForPlayer(rounds, player.name,
                                                            bracket_start, bracket_weight);
              return player;
            })
            .value();
        }
      };
    }
  ])
  .factory('players', [
    'player',
    'factions',
    'round',
    'rounds',
    'ranking',
    'lists',
    function(playerService,
             factionsService,
             roundService,
             roundsService,
             rankingService,
             listsService) {
      function buildRankingFunction(coll, state, is_bracket) {
        if(is_bracket) {
          return function(player) { return player.points.bracket; };
        }
        else {
          var critFn = rankingService.buildPlayerCritFunction(state.ranking.player,
                                                              state.rounds.length,
                                                              coll.length);
          if(!_.isFunction(critFn)) {
            console.error('Error create ranking function', critFn);
            return null;
          }
          return _.partial(playerService.rank, _, critFn);
        }
      }
      var playersService = {
        add: function playersAdd(coll, player, group_index) {
          coll[group_index] = _.cat(coll[group_index], player);
          return coll;
        },
        drop: function(coll, player) {
          return _.chain(coll)
            .mapWith(_.reject, _.partial(playerService.is, _, player.name))
            .reject(_.isEmpty)
            .apply(function(players) {
              if(_.isEmpty(players)) return [[]];
              return players;
            })
            .value();
        },
        player: function(coll, name) {
          return _.chain(coll)
            .flatten(true)
            .find(_.partial(playerService.is, _, name))
            .value();
        },
        names: function(coll) {
          return _.chain(coll)
            .flatten(true)
            .mapWith(_.getPath, 'name')
            .sortBy(_.identity)
            .value();
        },
        factions: function(coll, base_factions) {
          return _.chain(coll)
            .flatten(true)
            .mapWith(_.getPath, 'faction')
            .cat(_.keys(base_factions))
            .uniq()
            .without(undefined)
            .sortBy(_.identity)
            .value();
        },
        forFaction: function(coll, faction_name) {
          return _.chain(coll)
            .flatten(true)
            .filter(function(player) {
              return (_.getPath(player, 'faction') === faction_name);
            })
            .value();
        },
        casters: function(coll) {
          return _.chain(coll)
            .flatten(true)
            .mapcatWith(_.getPath, 'lists')
            .without(undefined, null)
            .map(function(list) {
              return (_.exists(list.caster) ?
                      { faction: list.faction || '',
                        name: list.caster } : undefined);
            })
            .without(undefined, null)
            .uniq(false, _.partial(_.getPath, _, 'name'))
            .apply(function(casters) {
              return casters.sort(function(a,b) {
                var comp = a.faction.localeCompare(b.faction);
                if(comp !== 0) return comp;
                return a.name.localeCompare(b.name);
              });
            })
            .value();
        },
        forCaster: function(coll, caster_name) {
          return _.chain(coll)
            .flatten(true)
            .filter(function(player) {
              return listsService.containsCaster(player.lists, caster_name);
            })
            .value();
        },
        cities: function(coll) {
          return _.chain(coll)
            .flatten(true)
            .mapWith(_.getPath, 'city')
            .uniq()
            .without(undefined)
            .sortBy(_.identity)
            .value();
        },
        updateListsPlayed: function(coll, rounds) {
          return _.chain(coll)
            .map(function(group) {
                return _.mapWith(group, playerService.updateListsPlayed, rounds);
            })
            .value();
        },
        updatePoints: function(coll, rounds, bracket_start, bracket_weight) {
          var updated_players_without_sos = _.chain(coll)
            .map(function(group, group_index) {
                return _.mapWith(group, playerService.updatePoints, rounds,
                                 bracket_start[group_index], bracket_weight[group_index]);
            })
            .value();
          return _.chain(updated_players_without_sos)
            .map(function(group) {
              return _.map(group, function(player) {
                var opponents = roundsService.opponentsForPlayer(rounds, player.name);
                player.points.sos = playersService.sosFromPlayers(updated_players_without_sos,
                                                                  opponents);
                return player;
              });
            })
            .value();
        },
        sortGroup: function(coll, state, is_bracket) {
          var rankFn = buildRankingFunction(coll, state, is_bracket);
          if(!_.exists(rankFn)) return coll;
          
          var players_grouped_by_ranking;
          var rank = 0;
          return _.chain(coll)
          // group players by ranking criterion
            .groupBy(rankFn)
          // store grouped players for later
            .tap(function(groups) { players_grouped_by_ranking = groups; })
          // get list of rankings and order it decrementally
            .keys()
            .sortBy(function(ranking) { return -parseFloat(ranking); })
          // fold each ranking list into final list
            .reduce(function(mem, ranking) {
              mem.push({ rank: rank+1,
                         players: players_grouped_by_ranking[ranking] });
              rank += players_grouped_by_ranking[ranking].length;
              return mem;
            }, [])
            // .spy('sort end')
            .value();
        },
        sort: function(coll, state, is_bracket) {
          return _.map(coll, function(group, group_index) {
            return playersService.sortGroup(group, state, is_bracket[group_index]);
          });
        },
        sosFromPlayers: function(coll, opponents) {
          return _.chain(opponents)
            .map(_.partial(playersService.player, coll))
            .without(undefined)
            .reduce(function(mem, opponent) {
              return mem + _.getPath(opponent, 'points.tournament');
            }, 0)
            .value();
        },
        areAllPaired: function(coll, rounds) {
          return _.chain(coll)
            .apply(playersService.names)
            .difference(roundService.pairedPlayers(rounds))
            .isEmpty()
            .value();
        },
        indexRangeForGroup: function(coll, group_index) {
          var first_player = _.chain(coll)
            .slice(0, group_index)
            .flatten(true)
            .value().length;
          var next_player = first_player + coll[group_index].length;
          return [first_player, next_player];
        },
        chunkGroups: function(coll, size) {
          return _.chain(coll)
            .flatten(true)
            .chunkAll(size)
            .value();
        },
        splitNewGroup: function(coll, players) {
          var new_group = _.map(players, _.partial(playersService.player, coll));
          return _.chain(coll)
            .mapWith(_.difference, new_group)
            .cat([new_group])
            .reject(_.isEmpty)
            .value();
        },
        groupForPlayer: function(coll, player_name) {
          return _.chain(coll)
            .map(function(group) {
              return _.findWhere(group, { name: player_name });
            })
            .findIndex(_.exists)
            .value();
        },
        movePlayerGroupFront: function(coll, player_name) {
          var group_index = playersService.groupForPlayer(coll, player_name);
          if(0 >= group_index) return coll;
          var player = playersService.player(coll, player_name);
          var new_coll = _.clone(coll);
          new_coll[group_index] = _.difference(coll[group_index], [player]);
          new_coll[group_index-1] = _.cat(coll[group_index-1], player);
          return _.reject(new_coll, _.isEmpty);
        },
        movePlayerGroupBack: function(coll, player_name) {
          var group_index = playersService.groupForPlayer(coll, player_name);
          if(0 > group_index ||
             group_index >= coll.length-1) return coll;
          var player = playersService.player(coll, player_name);
          var new_coll = _.clone(coll);
          new_coll[group_index] = _.difference(coll[group_index], [player]);
          new_coll[group_index+1] = _.cat(coll[group_index+1], player);
          return _.reject(new_coll, _.isEmpty);
        },
        moveGroupFront: function(coll, group_index) {
          if(0 >= group_index) return coll;
          var new_coll = _.clone(coll);
          new_coll.splice(group_index, 1);
          new_coll.splice(group_index-1, 0, coll[group_index]);
          return new_coll;
        },
        moveGroupBack: function(coll, group_index) {
          if(0 > group_index ||
             group_index >= coll.length-1) return coll;
          var new_coll = _.clone(coll);
          new_coll.splice(group_index, 1);
          new_coll.splice(group_index+1, 0, coll[group_index]);
          return new_coll;
        },
        size: function(coll) {
          return _.flatten(coll).length;
        },
        nbGroups: function(coll) {
          return coll.length;
        },
        groupSizeIsEven: function(group) {
          return (group.length & 1) === 0;
        },
        tableRangeForGroup: function(coll, group_index) {
          var group_range = playersService.indexRangeForGroup(coll, group_index);
          return _.range(Math.round(group_range[0]/2+1),
                         Math.round(group_range[1]/2+1));
        }
      };
      return playersService;
    }
  ]);
