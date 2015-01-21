'use strict';

angular.module('srApp.services')
  .factory('bbStringifier', [
    function() {
      var EOL = '\r\n';
      function inTag(string, tag) {
        return '['+tag+']'+string+'[/'+tag+']';
      }
      var bbStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .map(function(gr, i) {
              var rows = _.chain(gr)
                .map(function(row, j) {
                  return _.chain(row)
                    .map(function(c) { return j === 0 ? inTag(c, 'b') : c; })
                    .mapWith(inTag, 'td')
                    .join('')
                    .apply(inTag, 'tr')
                    .value();
                })
                .join(EOL)
                .apply(inTag, 'table')
                .value();
              return _.cat([ '',
                             inTag('Group '+(i+1), 'b') ],
                           rows);
            })
            .flatten()
            .join(EOL)
            .value();
        }
      };
      return bbStringifier;
    }
  ]);
