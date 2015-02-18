'use strict';

angular.module('srApp.services')
  .factory('statsGroupByTotal', [
    function() {
      var statsGroupByTotal = {
        group: function(st, sel) {
          return [['Total', sel]];
        }
      };
      return statsGroupByTotal;
    }
  ])
  .factory('statsGroupByOppFaction', [
    'game',
    'players',
    function(game,
             players) {
      var statsGroupByOppFaction = {
        group: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return [ gs[0], _.groupBy(gs[1], function(g) {
                var opp_name = game.opponentForPlayer(g, gs[0]);
                // console.log('opp_name', opp_name);
                var opp = players.player(st.players, opp_name);
                // console.log('opp', opp);
                return _.getPath(opp, 'faction') || 'NULL';
              }) ];
            })
            // .spy('groupBy')
            .reduce(function(mem, gs) {
              _.each(gs[1], function(gr, f) {
                if('NULL' === f) return;
                var key = s.capitalize(f);
                mem[key] = mem[key] || [];
                mem[key].push([gs[0], gr]);
              });
              return mem;
            }, {})
            // .spy('reduce')
            .map(function(val, key) {
              return [key, val];
            })
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
    function(game,
             players) {
      var statsGroupByOppCaster = {
        group: function(st, sel) {
          return _.chain(sel)
            .map(function(gs) {
              return [ gs[0], _.groupBy(gs[1], function(g) {
                var opp_name = game.opponentForPlayer(g, gs[0]);
                // console.log('opp_name', opp_name);
                var opp_game = game.player(g, opp_name);
                // console.log('opp_game', opp_game);
                return _.getPath(opp_game, 'list') || 'NULL';
              }) ];
            })
            // .spy('groupBy')
            .reduce(function(mem, gs) {
              _.each(gs[1], function(gr, c) {
                if('NULL' === c) return;
                var key = s.capitalize(c);
                mem[key] = mem[key] || [];
                mem[key].push([gs[0], gr]);
              });
              return mem;
            }, {})
            // .spy('reduce')
            .map(function(val, key) {
              return [key, val];
            })
            .sortBy(_.first)
            .value();
        }
      };
      return statsGroupByOppCaster;
    }
  ]);
