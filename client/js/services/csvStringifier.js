'use strict';

angular.module('srApp.services')
  .factory('csvStringifier', [
    function() {
      var EOL = '\r\n';
      var csvStringifier = {
        stringify: function(tables) {
          return _.chain(tables)
            .map(function(gr, i) {
              return _.cat([ '', 'Group '+(i+1) ],
                           _.map(gr, function(row) {
                             return row.join(',');
                           }));
            })
            .flatten()
            .join(EOL)
            .value();
        }
      };
      return csvStringifier;
    }
  ]);
