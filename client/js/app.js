'use strict';

angular.module('srApp.services', []);
//   .value('version', '0.1');
angular.module('srApp.filters', []);
angular.module('srApp.controllers', []);
angular.module('srApp.directives', []);
angular.module('srApp', [
  'ui.router',
  'srApp.controllers',
  'srApp.filters',
  'srApp.services',
  'srApp.directives'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/players_ranking');
    $stateProvider
      .state('file', {
        url: '/file',
        templateUrl: 'partials/file.html',
        controller: 'fileCtrl',
        data: {}
      })
      .state('players_list', {
        url: '/players_list',
        templateUrl: 'partials/playersList.html',
        controller: 'playersListCtrl',
        data: { sort: 'Name',
                exports: ['fk']
              }
      })
      .state('players_ranking', {
        url: '/players_ranking',
        templateUrl: 'partials/playersRanking.html',
        controller: 'playersListCtrl',
        data: { sort: 'Rank',
                exports: ['csv_rank', 'bb_rank']
              }
      })
      .state('groups_edit', {
        url: '/groups_edit',
        templateUrl: 'partials/groups_edit.html',
        controller: 'groupEditCtrl',
        data: {}
      })
      .state('player_edit', {
        // url: '/players_edit',
        templateUrl: 'partials/player_edit.html',
        controller: 'playerEditCtrl',
        data: {}
      })
      .state('rounds', {
        url: '/rounds',
        templateUrl: 'partials/rounds.html',
        controller: 'roundsCtrl',
        data: {}
      })
      .state('rounds.sum', {
        url: '/sum',
        templateUrl: 'partials/rounds_sum.html',
        controller: 'roundsSumCtrl',
        data: {}
      })
      .state('rounds.next', {
        url: '/next',
        templateUrl: 'partials/rounds_next.html',
        controller: 'roundsNextCtrl',
        data: {}
      })
      .state('rounds.nth', {
        url: '/:pane',
        templateUrl: 'partials/rounds_nth.html',
        controller: 'roundsNthCtrl',
        data: {}
      })
      .state('game_edit', {
        // url: '/game_edit',
        templateUrl: 'partials/game_edit.html',
        controller: 'gameEditCtrl',
        data: {}
      })
      .state('stats', {
        url: '/stats',
        templateUrl: 'partials/stats.html',
        controller: 'statsCtrl',
        data: {}
      })
      .state('settings_edit', {
        url: '/settings_edit',
        templateUrl: 'partials/settings_edit.html',
        controller: 'settingsEditCtrl',
        data: {}
      })
    ;
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
