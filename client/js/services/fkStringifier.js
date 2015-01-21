'use strict';

angular.module('srApp.services')
  .factory('fkStringifier', [
    function() {
      var EOL = '\r\n';
      var fkStringifier = {
        stringify: function(players) {
          return _.chain(players)
            .flatten()
            .map(function(p) {
              var ret = [ 'Player: '+p.name ];
              if(_.exists(p.city)) ret.push( 'City: '+p.city );
              if(_.exists(p.faction)) ret.push( 'Faction: '+p.faction );
              if(p.lists.length > 0) {
                ret.push('');
                _.each(p.lists, function(l) {
                  ret.push('System: Warmachordes');
                  ret.push('Faction: '+(_.exists(l.theme) ? l.theme : l.faction));
                  ret.push(l.fk);
                  ret.push('');
                });
              }
              return ret.join(EOL) + EOL;
            })
            .join(EOL)
            .value();
        }
      };
      return fkStringifier;
    }
  ]);
