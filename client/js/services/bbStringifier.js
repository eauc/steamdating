'use strict';

angular.module('srApp.services')
  .factory('bbStringifier', [
    function() {
      var EOL = '\r\n';
      function inTag(tag, string) {
        return '['+tag+']'+string+'[/'+tag+']';
      }
      var inTag$ = R.curry(inTag);
      function stringifyCell(cell) {
        return ( R.type(cell) === 'Array' ?
                 cell.join(EOL) :
                 cell
               );
      }
      function stringifyRow(row, row_index) {
        return R.pipe(
          R.map(R.defaultTo('')),
          R.map(stringifyCell),
          R.map(function(col) { return ( row_index === 0 ?
                                         inTag('b', col) :
                                         col
                                       ); }),
          R.map(inTag$('center')),
          R.map(inTag$('td')),
          R.join(''),
          inTag$('tr')
        )(row);
      }
      function stringifyGroup(group, group_index) {
        var rows = R.pipe(
          R.tail,
          R.mapIndexed(stringifyRow),
          R.join(EOL),
          inTag$('table')
        )(group);
        return R.join(EOL, [
          inTag('b', R.head(group).join(' ')),
          rows
        ]);
      }
      var bbStringifier = {
        stringify: function(tables) {
          return R.pipe(
            R.mapIndexed(stringifyGroup),
            R.flatten,
            R.join(EOL+EOL)
          )(tables);
        }
      };
      return bbStringifier;
    }
  ]);
