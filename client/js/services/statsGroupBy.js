'use strict';

angular.module('srApp.services')
  .factory('statsGroupByTotal', [
    function() {
      var statsGroupByTotal = {
        group: function(state, selection) {
          return [['Total', selection]];
        }
      };
      return statsGroupByTotal;
    }
  ])
  .factory('statsGroupByOppFaction', [
    'game',
    'players',
    function(gameService,
             playersService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      var statsGroupByOppFaction = {
        group: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       _.groupBy(selGames(sel_entry), function(game) {
                         var opp_name = gameService.opponentForPlayer(game, selPlayer(sel_entry));
                         var opp = playersService.player(state.players, opp_name);
                         return s.capitalize(_.getPath(opp, 'faction') || 'NULL');
                       })
                     ];
            })
            .omit('NULL')
            .reduce(function(mem, fct_entry) {
              _.each(selGames(fct_entry), function(games, faction) {
                mem[faction] = mem[faction] || [];
                mem[faction].push([selPlayer(fct_entry), games]);
              });
              return mem;
            }, {})
            .toHeaderList()
            .sortBy(_.first)
            .value();
        }
      };
      return statsGroupByOppFaction;
    }
  ])
  .factory('statsGroupByOppCaster', [
    'game',
    'players',
    function(gameService,
             playersService) {
      function selPlayer(entry) { return entry[0]; }
      function selGames(entry) { return entry[1]; }

      var statsGroupByOppCaster = {
        group: function(state, selection) {
          return _.chain(selection)
            .map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       _.groupBy(selGames(sel_entry), function(game) {
                         var opp_name = gameService.opponentForPlayer(game, selPlayer(sel_entry));
                         var opp_game = gameService.player(game, opp_name);
                         return s.capitalize(_.getPath(opp_game, 'list') || 'NULL');
              }) ];
            })
            .omit('NULL')
            .reduce(function(mem, fct_entry) {
              _.each(selGames(fct_entry), function(games, caster) {
                mem[caster] = mem[caster] || [];
                mem[caster].push([selPlayer(fct_entry), games]);
              });
              return mem;
            }, {})
            .toHeaderList()
            .sortBy(_.first)
            .value();
        }
      };
      return statsGroupByOppCaster;
    }
  ]);
