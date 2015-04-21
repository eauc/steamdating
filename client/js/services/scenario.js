'use strict';

angular.module('srApp.services')
  .factory('scenario', [
    '$http',
    function($http) {
      var scenarioService = {
        init: function() {
          return $http.get('/data/scenarios.json')
            .then(function(response) {
              return response.data;
            }, function(response) {
              console.log('error get scenarios', response);
            });
        },
      };

      R.curryService(scenarioService);
      return scenarioService;
    }
  ]);
