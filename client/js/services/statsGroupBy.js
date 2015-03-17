'use strict';

angular.module('srApp.services')
  .factory('statsGroupByTotal', [
    function() {
      var statsGroupByTotalService = {
        group: function(state, selection) {
          return [['Total', selection]];
        }
      };
      R.curryService(statsGroupByTotalService);
      return statsGroupByTotalService;
    }
  ])
  .factory('statsGroupByOppFaction', [
    'game',
    'players',
    function(gameService,
             playersService) {
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var statsGroupByOppFactionService = {
        group: function(state, selection) {
          return R.pipe(
            R.map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       R.pipe(
                         selGames,
                         R.groupBy(function(game) {
                           var opp_name = gameService.opponentForPlayer(selPlayer(sel_entry), game);
                           var opp = playersService.player(opp_name, state.players);
                           return s.capitalize(R.defaultTo('NULL', R.prop('faction', opp)));
                         }),
                         R.omit(['NULL'])
                       )(sel_entry)
                     ];
            }),
            R.reduce(function(mem, fct_entry) {
              var games_by_faction = selGames(fct_entry);
              R.forEach(function(faction) {
                mem[faction] = R.defaultTo([], mem[faction]);
                mem[faction].push([
                  selPlayer(fct_entry),
                  games_by_faction[faction]
                ]);
              }, R.keys(games_by_faction));
              return mem;
            }, {}),
            R.toHeaderList,
            R.sortBy(R.head)
          )(selection);
        }
      };
      R.curryService(statsGroupByOppFactionService);
      return statsGroupByOppFactionService;
    }
  ])
  .factory('statsGroupByOppCaster', [
    'game',
    'players',
    function(gameService,
             playersService) {
      var selPlayer = R.head;
      var selGames = R.nth(1);

      var statsGroupByOppCasterService = {
        group: function(state, selection) {
          return R.pipe(
            R.map(function(sel_entry) {
              return [ selPlayer(sel_entry),
                       R.pipe(
                         selGames,
                         R.groupBy(function(game) {
                           var opp_name = gameService.opponentForPlayer(selPlayer(sel_entry), game);
                           var opp_game = gameService.player(opp_name, game);
                           return s.capitalize(R.defaultTo('NULL', R.prop('list', opp_game)));
                         }),
                         R.omit(['NULL'])
                       )(sel_entry)
                     ];
            }),
            R.reduce(function(mem, fct_entry) {
              var games_by_caster = selGames(fct_entry);
              R.forEach(function(caster) {
                mem[caster] = R.defaultTo([], mem[caster]);
                mem[caster].push([
                  selPlayer(fct_entry),
                  games_by_caster[caster]
                ]);
              }, R.keys(games_by_caster));
              return mem;
            }, {}),
            R.toHeaderList,
            R.sortBy(R.head)
          )(selection);
        }
      };
      R.curryService(statsGroupByOppCasterService);
      return statsGroupByOppCasterService;
    }
  ]);
