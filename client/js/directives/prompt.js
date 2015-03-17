'use strict';

angular.module('srApp.directives')
  .factory('prompt', [
    '$q',
    function($q) {
      var state;
      var defer;
      var state_defers = [];
      function getState() {
        if(R.exists(state)) return state;
        var defer = $q.defer();
        state_defers.push(defer);
        return defer.promise;
      }
      return {
        register: function(st) {
          state = st;
          state.active = false;
          state.message = null;
          state.type = 'alert';
          state.input= null;
          state.doValidate = function() {
            state.close();
            defer.resolve(state.input);
            defer = null;
          };
          state.doCancel = function() {
            state.close();
            defer.reject();
            defer = null;
          };

          R.forEach(function(d) {
            d.resolve(state);
          }, state_defers);
          state_defers = [];
        },
        prompt: function(type, msg) {
          defer = $q.defer();
          $q.when(getState()).then(function(state) {
            state.type = type;
            state.message = (R.type(msg) === 'String') ? [msg] : msg;
            state.input = null;
            state.open();
          });
          return defer.promise;
        }
      };
    }
  ])
  .controller('promptCtrl', [
    '$scope',
    'prompt',
    function($scope,
             prompt) {
      prompt.register($scope);
    }
  ])
  .directive('prompt', [
    '$timeout',
    function($timeout) {
      return {
        restrict: 'E',
        templateUrl: '/partials/directives/prompt.html',
        scope: true,
        controller: 'promptCtrl',
        link: function(scope, element, attrs) {
          var input = element[0].querySelector('input');
          scope.open = function() {
            scope.active = true;
            $timeout(function() {
              input.focus();
            }, 200);
          };
          scope.close = function() {
            scope.active = false;
          };
        }
      };
    }
  ]);
