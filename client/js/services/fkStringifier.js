'use strict';

angular.module('srApp.services')
  .factory('fkStringifier', [
    function() {
      var EOL = '\r\n';
      var fkStringifierService = {
        stringify: function(players) {
          return R.pipe(
            R.flatten,
            R.map(stringifyPlayer),
            R.join(EOL)
          )(players);
        }
      };
      function stringifyPlayer(player) {
        var ret = [ 'Player: '+player.name ];
        if(!R.isNil(player.origin)) ret.push( 'Origin: '+player.origin );
        if(!R.isNil(player.faction)) ret.push( 'Faction: '+player.faction );
        if(player.lists.length > 0) {
          ret.push('');
          ret.push(R.pipe(
            R.map(stringifyList),
            R.join(EOL)
          )(player.lists));
        }
        return R.join(EOL, ret) + EOL;
      }
      function stringifyList(list) {
        var ret = ['List:'];
        if(!R.isNil(list.theme)) ret.push('Theme: '+list.theme);
        ret.push(list.fk);
        ret.push('');
        return R.join(EOL, ret);
      }
      R.curryService(fkStringifierService);
      return fkStringifierService;
    }
  ]);
