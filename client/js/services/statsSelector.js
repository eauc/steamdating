'use strict';

angular.module('srApp.services')
  .factory('statsFactionSelector', [
    'players',
    'rounds',
    function(playersService,
             roundsService) {
      var statsFactionSelectorService = {
        select: function(state, faction_name) {
          var players = R.pipe(
            playersService.simplePlayers,
            playersService.forFaction$(faction_name)
          )(state.players);
          return R.map(function(player) {
            return [ player.name,
                     roundsService.gamesForPlayer(player.name, state.rounds)
                   ];
          }, players);
        }
      };
      R.curryService(statsFactionSelectorService);
      return statsFactionSelectorService;
    }
  ])
  .factory('statsPlayerSelector', [
    'players',
    'rounds',
    function(playersService,
             roundsService) {
      var statsPlayerSelectorService = {
        select: function(state, player_name) {
          return [ [ player_name,
                     roundsService.gamesForPlayer(player_name, state.rounds)
                   ] ];
        }
      };
      R.curryService(statsPlayerSelectorService);
      return statsPlayerSelectorService;
    }
  ])
  .factory('statsCasterSelector', [
    'players',
    'rounds',
    'games',
    function(playersService,
             roundsService,
             gamesService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      var statsCasterSelectorService = {
        select: function(state, caster_name) {
          var players = R.pipe(
            playersService.simplePlayers,
            playersService.forCaster$(caster_name)
          )(state.players);
          return R.pipe(
            R.map(function(player) {
              return [ player.name,
                       roundsService.gamesForPlayer(player.name, state.rounds)
                     ];
            }),
            R.map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       gamesService.forCaster(selPlayer(sel_entry),
                                              caster_name,
                                              selGames(sel_entry))
                     ];
            }),
            R.reject(R.compose(R.isEmpty, selGames))
          )(players);
        }
      };
      R.curryService(statsCasterSelectorService);
      return statsCasterSelectorService;
    }
  ]);
