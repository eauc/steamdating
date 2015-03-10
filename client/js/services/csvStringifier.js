'use strict';

angular.module('srApp.services')
  .factory('csvStringifier', [
    function() {
      var EOL = '\r\n';
      function stringifyCell(cell) {
        return _.isArray(cell) ? cell.join(' ') : cell;
      }
      function stringifyRow(row, row_index) {
        return _.map(row, stringifyCell).join(',');
      }
      function stringifyGroup(group, group_index) {
        return _.chain(group)
          .map(stringifyRow)
          .join(EOL)
          .value();
      }
      var csvStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .map(stringifyGroup)
            .join(EOL+EOL)
            .value();
        }
      };
      return csvStringifier;
    }
  ]);
