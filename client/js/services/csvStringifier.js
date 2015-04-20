'use strict';

angular.module('srApp.services')
  .factory('csvStringifier', [
    function() {
      var EOL = '\r\n';
      function stringifyCellValue(cell_value) {
        return R.pipe(
          function(cell) {
            return ( R.type(cell) === 'Array' ?
                     cell.join(' ') :
                     cell
                   );
          },
          function(cell) {
            return ( R.type(cell) === 'String' ?
                     cell.replace(/\"/g, '""') :
                     cell
                   );
          },
          R.defaultTo(''),
          function(cell) {
            return '"'+cell+'"';
          }
        )(cell_value);
      }
      function stringifyCell(cell) {
        if(R.type(cell) === 'Object') {
          return stringifyCellValue(cell.value);
        }          
        return stringifyCellValue(cell);
      }
      function stringifyRow(row, row_index) {
        return R.pipe(
          R.map(stringifyCell),
          R.join(',')
        )(row);
      }
      function stringifyGroup(group, group_index) {
        return R.pipe(
          R.mapIndexed(stringifyRow),
          R.join(EOL)
        )(group);
      }
      var csvStringifier = {
        stringify: function(tables) {
          return R.pipe(
            R.mapIndexed(stringifyGroup),
            R.join(EOL+EOL)
          )(tables);
        }
      };
      return csvStringifier;
    }
  ]);
