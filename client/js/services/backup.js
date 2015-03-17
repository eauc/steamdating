'use strict';

angular.module('srApp.services')
  .factory('backup', [
    '$window',
    '$q',
    function($window,
             $q) {
      $window.URL = $window.URL || $window.webkitURL;
      return {
        read: function backupRead(file) {
          var reader = new $window.FileReader();
          var defer = $q.defer();
          reader.onload = function(e) {
            var data;
            try {
              data = JSON.parse(e.target.result);
              defer.resolve(data);
            }
            catch (event) {
              defer.reject('invalid file');
            }
          };
          reader.onerror = function(e) {
            defer.reject('error reading file');
          };
          reader.onabort = function(e) {
            defer.reject('abort reading file');
          };
          reader.readAsText(file);
          return defer.promise;
        },
        generate: function(data) {
          return R.pipe(
            JSON.stringify,
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
    }
  ]);
