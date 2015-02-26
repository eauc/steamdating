'use strict';

angular.module('srApp.services')
  .factory('csvStringifier', [
    function() {
      var EOL = '\r\n';
      function stringifyRow(row, row_index) {
        return row.join(',');
      }
      function stringifyGroup(group, group_index) {
        return _.cat([ '', 'Group '+(group_index+1) ],
                     _.map(group, stringifyRow));
      }
      var csvStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .mapcat(stringifyGroup)
            .join(EOL)
            .value();
        }
      };
      return csvStringifier;
    }
  ]);
