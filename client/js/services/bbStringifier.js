'use strict';

angular.module('srApp.services')
  .factory('bbStringifier', [
    function() {
      var EOL = '\r\n';
      function inTag(string, tag) {
        return '['+tag+']'+string+'[/'+tag+']';
      }
      function stringifyRow(row, row_index) {
        return _.chain(row)
          .map(function(col) { return row_index === 0 ? inTag(col, 'b') : col; })
          .mapWith(inTag, 'td')
          .join('')
          .apply(inTag, 'tr')
          .value();
      }
      function stringifyGroup(group, group_index) {
        var rows = _.chain(group)
            .map(stringifyRow)
            .join(EOL)
            .apply(inTag, 'table')
            .value();
        return _.cat([ '',
                       inTag('Group '+(group_index+1), 'b') ],
                     rows);
      }
      var bbStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .mapcat(stringifyGroup)
            .join(EOL)
            .value();
        }
      };
      return bbStringifier;
    }
  ]);
