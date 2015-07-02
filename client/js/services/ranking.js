'use strict';

angular.module('srApp.services')
  .factory('ranking', [
    function() {
      var rankingService = {
        criterions: {
          SR: {
            'Baseline': {
              player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
              team: '(((ttp*n_players*n_players+sos)*team_size*n_rounds+tp)*5*n_rounds+cp)*100*n_rounds+ap',
            },
            'Assassin Scoring': {
              player: '(tp*n_rounds+ck)*5*n_rounds+cp',
              team: '((ttp*team_size*n_rounds+tp)*n_rounds+ck)*5*n_rounds+cp',
            },
            'Control Points Scoring': {
              player: '((tp*5*n_rounds+cp)*100*n_rounds+ap)*n_players*n_players+sos',
              team: '(((ttp*team_size*n_rounds+tp)*5*n_rounds+cp)*100*n_rounds+ap)*n_players*n_players+sos',
            },
            'Destruction Scoring': {
              player: '((tp*100*n_rounds+ap)*5*n_rounds+cp)*n_players*n_players+sos',
              team: '(((ttp*team_size*n_rounds+tp)*100*n_rounds+ap)*5*n_rounds+cp)*n_players*n_players+sos',
            }
          },
        },
        buildPlayerCritFunction: function(body, n_rounds, n_players, team_size) {
          var baseCritFun;
          var critFun;
          try {
            baseCritFun = new Function('n_rounds', 'n_players', 'team_size',
                                       'player_custom', 'ttp', 'tp',
                                       'sos', 'cp', 'ap', 'ck', 'game_custom',
                                       [
                                         // 'console.log("ranking", arguments);',
                                         'var rank='+body+';',
                                         // 'console.log("rank", rank);',
                                         'return rank;',
                                       ].join(''));
            critFun = R.partial(baseCritFun, n_rounds, n_players, team_size);
          }
          catch(e) {
            return "Error : " + e.message;
          }
          return critFun;
        }
      };
      R.curryService(rankingService);
      return rankingService;
    }
  ]);
