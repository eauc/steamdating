'use strict';

angular.module('srApp.services')
  // .factory('export_keys', [
  //   function() {
  //     return {
  //       team: [
  //         'name',
  //         'city',
  //         'points.team_tournament',
  //         'points.tournament',
  //         'points.sos',
  //         'points.control',
  //         'points.army'
  //       ],
  //       player: [
  //         'name',
  //         'team',
  //         'city',
  //         'faction',
  //         'lists',
  //         'points.tournament',
  //         'points.sos',
  //         'points.control',
  //         'points.army'
  //       ],
  //       team_game: [
  //         'table',
  //         't1.tournament',
  //         't1.control',
  //         't1.army',
  //         'p1.list',
  //         't1.name',
  //         't1.team_tournament',
  //         't2.team_tournament',
  //         't2.name',
  //         'p2.list',
  //         't2.army',
  //         't2.control',
  //         't2.tournament'
  //       ],
  //       game: [
  //         'table',
  //         'p1.control',
  //         'p1.army',
  //         'p1.list',
  //         'p1.name',
  //         'p1.tournament',
  //         'p2.tournament',
  //         'p2.name',
  //         'p2.list',
  //         'p2.army',
  //         'p2.control'
  //       ]
  //     };
  //   }
  // ])
  // .factory('CSV', [
  //   'export_keys',
  //   'teams',
  //   'players',
  //   'lists',
  //   function(export_keys,
  //            teams,
  //            players,
  //            lists) {
  //     var CSV = {
  //       stringifyObject: function(o, keys) {
  //         var res = '';
  //         res += _.reduce(keys, function(mem, k) {
  //           var data = _.getPath(o, k);
  //           return mem + (_.exists(data) ? data : '') + ',';
  //         }, '') + '\r\n';
  //         return res;
  //       },
  //       stringifyPlayers: function(ps, is_team_tournament) {
  //         var res = '';
  //         res += 'Players\r\n';
  //         res += _.reduce(export_keys.player, function(mem, k) {
  //           return mem + k + ',';
  //         }, '') + '\r\n';
  //         res += _.chain(ps)
  //           .apply(function(c) {
  //             if(is_team_tournament) {
  //               return _.sortBy(c, _.partial(_.getPath, _, 'team'));
  //             }
  //             return c;
  //           })
  //           .reduce(function(mem, p) {
  //             return mem + CSV.stringifyObject(p, export_keys.player);
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringifyTeams: function(ts) {
  //         var res = '';
  //         res += 'Teams\r\n';
  //         res += _.reduce(export_keys.team, function(mem, k) {
  //           return mem + k + ',';
  //         }, '') + '\r\n';
  //         res += _.chain(ts)
  //           .reduce(function(mem, t) {
  //             return mem + CSV.stringifyObject(t, export_keys.team);
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringifyGames: function(gs) {
  //         var res = '';
  //         res += _.reduce(export_keys.game, function(mem, k) {
  //           return mem + k + ',';
  //         }, '') + '\r\n';
  //         res += _.chain(gs)
  //           .reduce(function(mem, g) {
  //             return mem + CSV.stringifyObject(g, export_keys.game);
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringifyTeamGames: function(gs) {
  //         var res = '';
  //         res += _.reduce(export_keys.team_game, function(mem, k) {
  //           return mem + k + ',';
  //         }, '') + '\r\n';
  //         res += _.chain(gs)
  //           .reduce(function(mem, g) {
  //             mem += CSV.stringifyObject(g, export_keys.team_game);
  //             mem += _.reduce(g.games, function(mem, g) {
  //               return mem + ',' + CSV.stringifyObject(g, export_keys.game);
  //             }, '');
  //             return mem;
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringifyRounds: function(rs, is_team_tournament) {
  //         var res = '';
  //         res += 'Rounds\r\n';
  //         res += _.chain(rs)
  //           .reduce(function(mem, p, i) {
  //             mem += 'Round'+(i+1)+'\r\n';
  //             if(is_team_tournament) {
  //               mem += CSV.stringifyTeamGames(p);
  //             }
  //             else {
  //               mem += CSV.stringifyGames(p);
  //             }
  //             return mem;
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringify: function(state) {
  //         var is_team_tournament = (state.teams.length !== 0);
  //         var res = '';
  //         if(is_team_tournament) {
  //           res += CSV.stringifyTeams(teams.sort(state.teams, state)) + '\r\n';
  //         }
  //         var sorted_players = _.chain(state.players)
  //             .snapshot()
  //             .apply(players.sort, state)
  //             .each(function(p) {
  //               p.lists = lists.casters(p.lists).join(' ');
  //             })
  //             .value();
  //         res += CSV.stringifyPlayers(sorted_players,
  //                                     is_team_tournament) + '\r\n';
  //         res += CSV.stringifyRounds(state.rounds, is_team_tournament) + '\r\n';
  //         return res;
  //       }
  //     };
  //     return CSV;
  //   }
  // ])
  // .factory('BB', [
  //   'export_keys',
  //   'teams',
  //   'players',
  //   'lists',
  //   function(export_keys,
  //            teams,
  //            players,
  //            lists) {
  //     var BB = {
  //       stringifyObject: function(o, keys, prefix) {
  //         prefix = prefix || '';
  //         var res = '';
  //         res += '[tr]' + prefix + _.reduce(keys, function(mem, k) {
  //           var data = _.getPath(o, k);
  //           return mem + '[td]' + (_.exists(data) ? data : '') + '[/td]';
  //         }, '') + '[/tr]\r\n';
  //         return res;
  //       },
  //       stringifyPlayers: function(ps, is_team_tournament) {
  //         var res = '';
  //         res += '[b]Players[/b]\r\n';
  //         res += '[table]\r\n';
  //         res += '[tr]' + _.reduce(export_keys.player, function(mem, k) {
  //           return mem + '[td][b]' + k + '[/b][/td]';
  //         }, '') + '[/tr]\r\n';
  //         res += _.chain(ps)
  //           .apply(function(c) {
  //             if(is_team_tournament) {
  //               return _.sortBy(c, _.partial(_.getPath, _, 'team'));
  //             }
  //             return c;
  //           })
  //           .reduce(function(mem, p) {
  //             return mem + BB.stringifyObject(p, export_keys.player);
  //           }, '')
  //           .value();
  //         res += '[/table]\r\n';
  //         return res;
  //       },
  //       stringifyTeams: function(ts) {
  //         var res = '';
  //         res += '[b]Teams[/b]\r\n';
  //         res += '[table]\r\n';
  //         res += '[tr]' + _.reduce(export_keys.team, function(mem, k) {
  //           return mem + '[td][b]' + k + '[/b][/td]';
  //         }, '') + '[/tr]\r\n';
  //         res += _.chain(ts)
  //           .reduce(function(mem, t) {
  //             return mem + BB.stringifyObject(t, export_keys.team);
  //           }, '')
  //           .value();
  //         res += '[/table]\r\n';
  //         return res;
  //       },
  //       stringifyGames: function(gs) {
  //         var res = '';
  //         res += '[table]\r\n';
  //         res += '[tr]' + _.reduce(export_keys.game, function(mem, k) {
  //           return mem + '[td][b]' + k + '[/b][/td]';
  //         }, '') + '[/tr]\r\n';
  //         res += _.chain(gs)
  //           .reduce(function(mem, g) {
  //             return mem + BB.stringifyObject(g, export_keys.game);
  //           }, '')
  //           .value();
  //         res += '[/table]\r\n';
  //         return res;
  //       },
  //       stringifyTeamGames: function(gs) {
  //         var res = '';
  //         res += '[table]\r\n';
  //         res += '[tr]' + _.reduce(export_keys.team_game, function(mem, k) {
  //           return mem + '[td][b]' + k + '[/b][/td]';
  //         }, '') + '[/tr]\r\n';
  //         res += _.chain(gs)
  //           .reduce(function(mem, g) {
  //             mem += BB.stringifyObject(g, export_keys.team_game);
  //             mem += _.reduce(g.games, function(mem, g) {
  //               return mem + BB.stringifyObject(g, export_keys.game, '[td][/td]');
  //             }, '');
  //             return mem;
  //           }, '')
  //           .value();
  //         res += '[/table]\r\n';
  //         return res;
  //       },
  //       stringifyRounds: function(rs, is_team_tournament) {
  //         var res = '';
  //         res += '[b]Rounds[/b]\r\n';
  //         res += _.chain(rs)
  //           .reduce(function(mem, p, i) {
  //             mem += 'Round'+(i+1)+'\r\n';
  //             if(is_team_tournament) {
  //               mem += BB.stringifyTeamGames(p);
  //             }
  //             else {
  //               mem += BB.stringifyGames(p);
  //             }
  //             return mem;
  //           }, '')
  //           .value();
  //         return res;
  //       },
  //       stringify: function(state) {
  //         var is_team_tournament = (state.teams.length !== 0);
  //         var res = '';
  //         if(is_team_tournament) {
  //           res += BB.stringifyTeams(teams.sort(state.teams, state)) + '\r\n';
  //         }
  //         var sorted_players = _.chain(state.players)
  //             .snapshot()
  //             .apply(players.sort, state)
  //             .each(function(p) {
  //               p.lists = lists.casters(p.lists).join(' ');
  //             })
  //             .value();
  //         res += BB.stringifyPlayers(sorted_players,
  //                                    is_team_tournament) + '\r\n';
  //         res += BB.stringifyRounds(state.rounds, is_team_tournament) + '\r\n';
  //         return res;
  //       }
  //     };
  //     return BB;
  //   }
  // ])
  .factory('fileExport', [
    '$window',
    'fkStringifier',
    'csvStringifier',
    'bbStringifier',
    function($window,
             fkStringifier,
             csvStringifier,
             bbStringifier) {
      $window.URL = $window.URL || $window.webkitURL;
      var stringifiers = {
        fk: fkStringifier,
        csv: csvStringifier,
        bb: bbStringifier,
      };
      return {
        generate: function(type, data) {
          return _.chain(data)
            .apply(stringifiers[type].stringify)
            .apply(function(string) {
              return new $window.Blob([string], {type: 'text/plain'});
            })
            .apply($window.URL.createObjectURL)
            .value();
        },
        cleanup: function(url) {
          if(_.exists(url)) {
            $window.URL.revokeObjectURL(url);
          }
        }
      };
    }
  ]);
