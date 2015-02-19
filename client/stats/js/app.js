'use strict';

angular.module('srApp.services', []);
angular.module('srAppStats.services', []);
//   .value('version', '0.1');
angular.module('srApp.filters', []);
angular.module('srApp.controllers', []);
angular.module('srAppStats.controllers', []);
angular.module('srApp.directives', []);
angular.module('srAppStats', [
  'ui.router',
  'srAppStats.controllers',
  'srApp.filters',
  'srApp.services',
  'srAppStats.services',
  'srApp.directives'
]).config([
  '$stateProvider',
  '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/file');
    $stateProvider
      .state('file', {
        url: '/file',
        templateUrl: 'partials/file.html',
        controller: 'fileCtrl',
        data: {}
      })
      .state('stats', {
        url: '/stats',
        templateUrl: '/partials/stats.html',
        controller: 'statsCtrl',
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
