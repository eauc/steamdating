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
      .state('players', {
        url: '/players',
        templateUrl: 'partials/players.html',
        controller: 'playersCtrl',
        data: {}
      })
      .state('players_add', {
        url: '/players_add',
        templateUrl: 'partials/players_add.html',
        controller: 'playersAddCtrl',
        data: {}
      })
      .state('rounds', {
        url: '/rounds/:pane',
        templateUrl: 'partials/rounds.html',
        controller: 'roundsCtrl',
        data: {}
      })
      .state('game_edit', {
        // url: '/game',
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
