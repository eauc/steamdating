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
          player.create({ name: 'toto', faction: 'Cryx', origin: 'chambery' }),
          player.create({ name: 'tata', faction: 'Menoth', origin: 'lyon' }),
        ];
        var res = fkStringifier.stringify(players);

        expect(res).toMatch(/Player: toto(\r\n)Origin: chambery(\r\n)Faction: Cryx(\r\n){2,}Player: tata(\r\n)Origin: lyon(\r\n)Faction: Menoth(\r\n)+/);
      });

      it('should export <players> lists', function() {
        var players = [
          player.create({ name: 'toto', faction: 'Cryx', origin: 'chambery' }),
          player.create({ name: 'tata', faction: 'Menoth', origin: 'lyon' }),
        ];
        players[0].lists = [
          list.create({ faction: 'Cryx', caster: 'gaspy1', theme: 'Theme qui tue', fk: 'GaspyContent' }),
          list.create({ faction: 'Cryx', caster: 'gaspy2', theme: null, fk: 'GaspyALaPlage' }),
        ];
        var res = fkStringifier.stringify(players);

        expect(res).toMatch(/Player: toto(\r\n)Origin: chambery(\r\n)Faction: Cryx(\r\n){2,}List:(\r\n)Theme: Theme qui tue(\r\n)GaspyContent(\r\n){2,}List:(\r\n)GaspyALaPlage(\r\n){2,}Player: tata(\r\n)Origin: lyon(\r\n)Faction: Menoth(\r\n)+/);
      });
    });
  });

});
