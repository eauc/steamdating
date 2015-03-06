'use strict';

angular.module('srApp.services')
  .factory('bbStringifier', [
    function() {
      var EOL = '\r\n';
      function inTag(string, tag) {
        return '['+tag+']'+string+'[/'+tag+']';
      }
      function stringifyCell(cell) {
        return _.isArray(cell) ? cell.join(EOL) : cell;
      }
      function stringifyRow(row, row_index) {
        return _.chain(row)
          .map(function(col) { return _.exists(col) ? col : ''; })
          .map(stringifyCell)
          .map(function(col) { return row_index === 0 ? inTag(col, 'b') : col; })
          .mapWith(inTag, 'center')
          .mapWith(inTag, 'td')
          .join('')
          .apply(inTag, 'tr')
          .value();
      }
      function stringifyGroup(group, group_index) {
        var rows = _.chain(group)
            .rest()
            .map(stringifyRow)
            .join(EOL)
            .apply(inTag, 'table')
            .value();
        return _.cat([inTag(_.first(group).join(' '), 'b')],
                     rows).join(EOL);
      }
      var bbStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .mapcat(stringifyGroup)
            .join(EOL+EOL)
            .value();
        }
      };
      return bbStringifier;
    }
  ]);
