'use strict';

angular.module('srApp.services')
  .factory('fkStringifier', [
    'player',
    function(playerService) {
      var EOL = '\r\n';
      var fkStringifierService = {
        stringify: function(players) {
          return R.pipe(
            R.flatten,
            R.chain(stringifyPlayer),
            R.join(EOL)
          )(players);
        }
      };
      function stringifyPlayer(player) {
        var team_player = playerService.hasMembers(player) ? 'Team' : 'Player';
        var ret = [ team_player+': '+player.name ];
        if(!R.isNil(player.origin)) ret.push( 'Origin: '+player.origin );
        if(playerService.hasMembers(player)) {
          ret.push('');
          ret = R.concat(ret, R.chain(stringifyPlayer, playerService.members(player)));
        }
        else {
          if(!R.isNil(player.faction)) ret.push( 'Faction: '+player.faction );
          ret.push('');
          if(player.lists.length > 0) {
            ret = R.concat(ret, R.chain(stringifyList, player.lists));
          }
        }
        return ret;
      }
      function stringifyList(list) {
        var ret = ['List:'];
        if(!R.isNil(list.theme)) ret.push('Theme: '+list.theme);
        ret.push(list.fk);
        ret.push('');
        return ret;
      }
      R.curryService(fkStringifierService);
      return fkStringifierService;
    }
  ]);
