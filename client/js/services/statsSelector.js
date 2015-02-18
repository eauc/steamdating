'use strict';

angular.module('srApp.services')
  .factory('statsFactionSelector', [
    'players',
    'rounds',
    function(players,
             rounds) {
      var statsFactionSelector = {
        select: function(st, f) {
          var ps = players.forFaction(st.players, f);
          return _.chain(ps)
            .mapWith(function(p) {
              return [p.name, rounds.gamesForPlayer(st.rounds, p.name)];
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
    function(players,
             rounds) {
      var statsPlayerSelector = {
        select: function(st, p) {
          return [[p, rounds.gamesForPlayer(st.rounds, p)]];
        }
      };
      return statsPlayerSelector;
    }
  ])
  .factory('statsCasterSelector', [
    'players',
    'rounds',
    'games',
    function(players,
             rounds,
             games) {
      var statsCasterSelector = {
        select: function(st, c) {
          var ps = players.forCaster(st.players, c);
          return _.chain(ps)
            .map(function(p) {
              return [ p.name, rounds.gamesForPlayer(st.rounds, p.name) ];
            })
            .map(function(gs) {
              return [ gs[0], games.forCaster(gs[1], gs[0], c) ];
            })
            .filter(function(gs) { return !_.isEmpty(gs[1]); })
            .value();
        }
      };
      return statsCasterSelector;
    }
  ]);
