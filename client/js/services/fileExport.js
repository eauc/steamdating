'use strict';

angular.module('srApp.services')
  .factory('jsonStringifier', [
    function() {
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
      return jsonStringifier;
    }
  ])
  .factory('fileExport', [
    '$window',
    'fkStringifier',
    'csvStringifier',
    'bbStringifier',
    'jsonStringifier',
    function($window,
             fkStringifierService,
             csvStringifierService,
             bbStringifierService,
             jsonStringifierService) {
      $window.URL = $window.URL || $window.webkitURL;
      var stringifiers = {
        fk: fkStringifierService,
        csv: csvStringifierService,
        bb: bbStringifierService,
        json: jsonStringifierService
      };
      var fileExportService = {
        generate: function(type, data) {
          return R.pipe(
            stringifiers[type].stringify,
            function(string) {
              return new $window.Blob([string], {type: 'text/plain'});
            },
            $window.URL.createObjectURL
          )(data);
        },
        cleanup: function(url) {
          if(!R.isNil(url)) {
            $window.URL.revokeObjectURL(url);
          }
        }
      };
      R.curryService(fileExportService);
      return fileExportService;
    }
  ]);
