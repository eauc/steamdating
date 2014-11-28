'use strict';

angular.module('srApp.services', []);
//   .value('version', '0.1');
angular.module('srApp.filters', []);
angular.module('srApp.controllers', []);
// angular.module('srApp.directives', []);
angular.module('srApp', [
  'ui.router',
  'srApp.controllers',
  'srApp.filters',
  'srApp.services',
  // 'srApp.directives'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/players');
    $stateProvider
      .state('file', {
        url: '/file',
        templateUrl: 'partials/file.html',
        controller: 'fileCtrl',
        data: {}
      })
      .state('players', {
        url: '/players',
        templateUrl: 'partials/players.html',
        controller: 'playersCtrl',
        data: {}
      })
      .state('player_edit', {
        // url: '/players_add',
        templateUrl: 'partials/player_edit.html',
        controller: 'playerEditCtrl',
        data: {}
      })
      .state('rounds', {
        url: '/rounds/:pane',
        templateUrl: 'partials/rounds.html',
        controller: 'roundsCtrl',
        data: {}
      })
      .state('game_edit', {
        // url: '/game_edit',
        templateUrl: 'partials/game_edit.html',
        controller: 'gameEditCtrl',
        data: {}
      });
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
