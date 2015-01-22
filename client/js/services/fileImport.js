'use strict';

angular.module('srApp.services')
  .factory('fileImport', [
    '$window',
    '$q',
    't3Parser',
    'fkParser',
    function($window,
             $q,
             t3Parser,
             fkParser) {
      var parsers = {
        't3': t3Parser,
        'fk': fkParser,
        'json': {
          parse: function(string) {
            return [JSON.parse(string), []];
          }
        }
      };
      return {
        read: function(type, file, factions) {
          var reader = new $window.FileReader();
          var defer = $q.defer();
          reader.onload = function(e) {
            var data;
            try {
              data = parsers[type].parse(e.target.result, factions);
              defer.resolve(data);
            }
            catch (event) {
              defer.reject(['invalid file : '+event.message]);
            }
          };
          reader.onerror = function(e) {
            defer.reject(['error reading file']);
          };
          reader.onabort = function(e) {
            defer.reject(['abort reading file']);
          };
          reader.readAsText(file);
          return defer.promise;
        }
      };
    }
  ]);
