'use strict';

angular.module('srApp.services')
  .factory('ranking', [
    function() {
      var ranking = {
        srPlayerCrit: function() {
          return '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap';
        },
        srTeamCrit: function() {
          return '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap';
        },
        buildPlayerCritFunction: function(body, n_rounds, n_players) {
          var baseCritFun;
          var critFun;
          try {
            baseCritFun = new Function('n_rounds', 'n_players',
                                       'player_custom', 'tp', 'sos', 'cp', 'ap', 'game_custom',
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
