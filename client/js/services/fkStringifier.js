'use strict';

angular.module('srApp.services')
  .factory('fkStringifier', [
    function() {
      var EOL = '\r\n';
      var fkStringifier = {
        stringify: function(players) {
          return _.chain(players)
            .flatten()
            .map(stringifyPlayer)
            .join(EOL)
            .value();
        }
      };
      function stringifyPlayer(player) {
        var ret = [ 'Player: '+player.name ];
        if(_.exists(player.origin)) ret.push( 'Origin: '+player.origin );
        if(_.exists(player.faction)) ret.push( 'Faction: '+player.faction );
        if(player.lists.length > 0) {
          ret.push('');
          ret.push(_.map(player.lists, stringifyList).join(EOL));
        }
        return ret.join(EOL) + EOL;
      }
      function stringifyList(list) {
        var ret = ['List:'];
        if(_.exists(list.theme)) ret.push('Theme: '+list.theme);
        ret.push(list.fk);
        ret.push('');
        return ret.join(EOL);
      }
      return fkStringifier;
    }
  ]);
