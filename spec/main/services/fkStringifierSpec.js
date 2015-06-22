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

        expect(res).toMatch(new RegExp([
          'Player: toto(\r\n)',
          'Origin: chambery(\r\n)',
          'Faction: Cryx(\r\n){2,}',
          'Player: tata(\r\n)',
          'Origin: lyon(\r\n)',
          'Faction: Menoth(\r\n)+'
        ].join('')));
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

        expect(res).toMatch(new RegExp([
          'Player: toto(\r\n)',
          'Origin: chambery(\r\n)',
          'Faction: Cryx(\r\n){2,}',
          'List:(\r\n)',
          'Theme: Theme qui tue(\r\n)',
          'GaspyContent(\r\n){2,}',
          'List:(\r\n)',
          'GaspyALaPlage(\r\n){2,}',
          'Player: tata(\r\n)',
          'Origin: lyon(\r\n)',
          'Faction: Menoth(\r\n)+',
        ].join('')));
      });

      it('should handle teams <players>', function() {
        var players = [
          player.create({ name: 'team1', origin: 'chambery' }),
          player.create({ name: 'team2', origin: 'lyon' }),
        ];
        players[0].members = [
          player.create({ name: 'member1', faction: 'Cryx' }),
          player.create({ name: 'member2', faction: 'Menoth' }),
        ];
        players[1].members = [
          player.create({ name: 'member3', faction: 'Cryx' }),
          player.create({ name: 'member4', faction: 'Menoth' }),
        ];
        var res = fkStringifier.stringify(players);

        expect(res).toMatch(new RegExp([
          'Team: team1(\r\n)',
          'Origin: chambery(\r\n){2,}',
          'Player: member1(\r\n)',
          'Faction: Cryx(\r\n){2,}',
          'Player: member2(\r\n)',
          'Faction: Menoth(\r\n){2,}',
          'Team: team2(\r\n)',
          'Origin: lyon(\r\n){2,}',
          'Player: member3(\r\n)',
          'Faction: Cryx(\r\n){2,}',
          'Player: member4(\r\n)',
          'Faction: Menoth(\r\n)',
        ].join('')));
      });
      
    });
  });

});
