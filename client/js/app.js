'use strict';

angular.module('srApp.services', []);
//   .value('version', '0.1');
// angular.module('srApp.filters', []);
angular.module('srApp.controllers', []);
// angular.module('srApp.directives', []);
angular.module('srApp', [
  'ui.router',
  'srApp.controllers',
  // 'srApp.filters',
  'srApp.services',
  // 'srApp.directives'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('start', {
        url: '/',
        templateUrl: 'partials/start.html',
        controller: 'startCtrl',
        data: {}
      });
  }
]).config([
  '$compileProvider',
  function($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
]);
