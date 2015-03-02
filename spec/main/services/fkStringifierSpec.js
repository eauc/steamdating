'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('fkStringifier', function() {

    var fkStringifier;
    var player;
    var list;

    beforeEach(inject([
      'fkStringifier',
      'player',
      'list',
      function(_fkStringifier, _player, _list) {
        fkStringifier = _fkStringifier;
        player = _player;
        list = _list;
      }
    ]));

    describe('stringify(<players>)', function() {
      it('should export <players>', function() {
        var players = [
          player.create('toto', 'Cryx', 'chambery'),
          player.create('tata', 'Menoth', 'lyon'),
        ];
        var res = fkStringifier.stringify(players);

        expect(res).toMatch(/Player: toto(\r\n)Origin: chambery(\r\n)Faction: Cryx(\r\n){2,}Player: tata(\r\n)Origin: lyon(\r\n)Faction: Menoth(\r\n)+/);
      });

      it('should export <players> lists', function() {
        var players = [
          player.create('toto', 'Cryx', 'chambery'),
          player.create('tata', 'Menoth', 'lyon'),
        ];
        players[0].lists = [
          list.create('Cryx', 'gaspy1', 'Theme qui tue', 'GaspyContent'),
          list.create('Cryx', 'gaspy2', null, 'GaspyALaPlage'),
        ];
        var res = fkStringifier.stringify(players);

        expect(res).toMatch(/Player: toto(\r\n)Origin: chambery(\r\n)Faction: Cryx(\r\n){2,}System: Warmachordes(\r\n)Faction: Theme qui tue(\r\n)GaspyContent(\r\n){2,}System: Warmachordes(\r\n)Faction: Cryx(\r\n)GaspyALaPlage(\r\n){2,}Player: tata(\r\n)Origin: lyon(\r\n)Faction: Menoth(\r\n)+/);
      });
    });
  });

});
