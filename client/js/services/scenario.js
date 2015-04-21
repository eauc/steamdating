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
        clear: function(length, scenario) {
          return R.repeat(null, length);
        },
        setLength: function(length, scenario) {
          scenario = R.defaultTo([], scenario);
          return ( scenario.length >= length ?
                   R.clone(scenario) :
                   R.concat(scenario,
                            R.repeat(null, length - scenario.length)
                           )
                 );
        },
        set: function(round_index, name, scenario) {
          scenario = scenarioService.setLength(round_index+1, scenario);
          scenario[round_index] = name;
          return scenario;
        },
        reset: function(round_index, scenario) {
          scenario = scenarioService.setLength(round_index+1, scenario);
          scenario[round_index] = null;
          return scenario;
        },
        hasScenario: function(round_index, scenario) {
          scenario = scenarioService.setLength(round_index+1, scenario);
          return ( R.exists(scenario[round_index]) &&
                   !R.isNil(scenario[round_index]) &&
                   0 !== R.length(scenario[round_index])
                 );
        }
      };

      R.curryService(scenarioService);
      return scenarioService;
    }
  ]);
