'use strict';

angular.module('srApp.services')
  .factory('fileExport', [
    '$window',
    'fkStringifier',
    'csvStringifier',
    'bbStringifier',
    function($window,
             fkStringifier,
             csvStringifier,
             bbStringifier) {
      $window.URL = $window.URL || $window.webkitURL;
      var jsonStringifier = {
        stringify: function(data) {
          return JSON.stringify(data, function(key,value) {
            if(s.startsWith(key, '$$')) {
              return undefined;
            }
            return value;
          });
        }
      };
      var stringifiers = {
        fk: fkStringifier,
        csv: csvStringifier,
        bb: bbStringifier,
        json: jsonStringifier
      };
      return {
        generate: function(type, data) {
          return _.chain(data)
            .apply(stringifiers[type].stringify)
            .apply(function(string) {
              return new $window.Blob([string], {type: 'text/plain'});
            })
            .apply($window.URL.createObjectURL)
            .value();
        },
        cleanup: function(url) {
          if(_.exists(url)) {
            $window.URL.revokeObjectURL(url);
          }
        }
      };
    }
  ]);
