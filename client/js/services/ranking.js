'use strict';

angular.module('srApp.services')
  .factory('ranking', [
    function() {
      var ranking = {
        criterions: {
          SR: {
            'Baseline': {
              player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
              team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
            },
            'Assassin Scoring': {
              player: '(tp*n_rounds+ck)*5*n_rounds+cp'
            },
            'Control Points Scoring': {
              player: '((tp*5*n_rounds+cp)*100*n_rounds+ap)*n_players*n_players+sos'
            },
            'Destruction Scoring': {
              player: '((tp*100*n_rounds+ap)*5*n_rounds+cp)*n_players*n_players+sos'
            }
          },
        },
        buildPlayerCritFunction: function(body, n_rounds, n_players) {
          var baseCritFun;
          var critFun;
          try {
            baseCritFun = new Function('n_rounds', 'n_players',
                                       'player_custom', 'tp', 'sos', 'cp', 'ap', 'ck', 'game_custom',
                                       'return '+body+';');
            critFun = _.partial(baseCritFun, n_rounds, n_players);
          }
          catch(e) {
            return "Error : " + e.message;
          }
          return critFun;
        }
      };
      return ranking;
    }
  ]);
