'use strict';

angular.module('srApp.services')
  .factory('t3', [
    'factions',
    'player',
    function(factions,
             player) {
      var factions_keys = {};
      factions.baseFactions()
        .then(function(base_factions) {
          _.each(base_factions, function(f) {
            factions_keys[f.t3] = f.name;
          });
        });
      return {
        parse: function(string) {
          return _.chain(string)
            .apply(function(s) {
              return s.split('\n');
            })
            .rest()
            .map(function(line) {
              return line.split(';');
            })
            .filter(function(line) {
              return (line.length === 10 &&
                      line[3].length > 0);
            })
            .map(function(line) {
              var obj = {
                name: line[3],
                city: line[5],
              };
              _.each(factions_keys, function(f, k) {
                if(line[4].indexOf(k) > -1) {
                  obj.faction = f;
                }
              });
              return obj;
            })
            .map(function(o) {
              return player.create(o.name, o.faction, o.city);
            })
            .value();
        }
      };
    }
  ])
  .factory('t3Import', [
    '$window',
    '$q',
    't3',
    function($window,
             $q,
             t3) {
      return {
        read: function(file) {
          var reader = new $window.FileReader();
          var defer = $q.defer();
          reader.onload = function(e) {
            var data;
            try {
              data = t3.parse(e.target.result);
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
        }
      };
    }
  ]);
