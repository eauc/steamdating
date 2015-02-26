'use strict';

angular.module('srApp.services')
  .factory('statsFactionSelector', [
    'players',
    'rounds',
    function(playersService,
             roundsService) {
      var statsFactionSelector = {
        select: function(state, faction_name) {
          var players = playersService.forFaction(state.players, faction_name);
          return _.chain(players)
            .mapWith(function(player) {
              return [ player.name,
                       roundsService.gamesForPlayer(state.rounds, player.name)
                     ];
            })
            .value();
        }
      };
      return statsFactionSelector;
    }
  ])
  .factory('statsPlayerSelector', [
    'players',
    'rounds',
    function(playersService,
             roundsService) {
      var statsPlayerSelector = {
        select: function(state, player_name) {
          return [ [ player_name,
                     roundsService.gamesForPlayer(state.rounds, player_name)
                   ] ];
        }
      };
      return statsPlayerSelector;
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

      var statsCasterSelector = {
        select: function(state, caster_name) {
          var players = playersService.forCaster(state.players, caster_name);
          return _.chain(players)
            .map(function(player) {
              return [ player.name,
                       roundsService.gamesForPlayer(state.rounds, player.name)
                     ];
            })
            .map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       gamesService.forCaster(selGames(sel_entry),
                                              selPlayer(sel_entry),
                                              caster_name)
                     ];
            })
            .filter(function(sel_entry) { return !_.isEmpty(selGames(sel_entry)); })
            .value();
        }
      };
      return statsCasterSelector;
    }
  ]);
