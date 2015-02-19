'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('fkParser', function() {

    var fkParser;

    beforeEach(inject([ 'fkParser', function(_fkParser) {
      fkParser = _fkParser;
    }]));

    describe('parse(<string>, <factions>)', function() {
      beforeEach(function() {
        this.factions = {
          'Cryx': { name: 'Cryx', t3: 'Cryx' },
          'The Protectorate of Menoth': { name: 'The Protectorate of Menoth', t3: 'Menoth' },
          'Legion of Everblight': {
            name: 'Legion of Everblight',
            t3: 'Everblight',
            casters: {
              'saeryn1': { name: 'Saeryn, Omen of Everblight' },
              'thagrosh2': { name: 'Thagrosh, the Messiah' }
            }
          }
        };
      });

      it('should extract players names, city and faction', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Legion of Everblight\n\n"+
"Player: Titi\nCity: Lyon\nFaction: Cryx\n\n"+
"Player: Tata\nCity: Grenoble\nFaction: The Protectorate of Menoth\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(3);
        expect(res[1].length).toBe(0);

        expect(res[0][0].name).toBe('Toto');
        expect(res[0][0].city).toBe('Chambery');
        expect(res[0][0].faction).toBe('Legion of Everblight');

        expect(res[0][1].name).toBe('Titi');
        expect(res[0][1].city).toBe('Lyon');
        expect(res[0][1].faction).toBe('Cryx');

        expect(res[0][2].name).toBe('Tata');
        expect(res[0][2].city).toBe('Grenoble');
        expect(res[0][2].faction).toBe('The Protectorate of Menoth');
      });

      it('should log error when player name is invalid', function() {
        var string =
"Player: \nCity: Chambery\nFaction: Cryx\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(0);
        expect(res[1].length).toBe(1);

        expect(res[1][0]).toMatch(/line 1 empty player name/);
      });

      it('should log error when player name already exists', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Cryx\n\n"+
"Player: Toto\nCity: Chambery\nFaction: Cryx\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[1][0]).toMatch(/line 5 player name .*already exists/);
      });

      it('should warn about unknown player factions', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Unknown\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[0][0].name).toBe('Toto');
        expect(res[0][0].city).toBe('Chambery');
        expect(res[0][0].faction).toBe('Unknown');

        expect(res[1][0]).toMatch(/line 3.*unknown faction/);
      });

      it('should extract players lists', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Legion of Everblight\n\n"+
"System: Hordes\nFaction: Legion of Everblight\nThagrosh, the Messiah\n* Carnivean\n\n\n"+
"System: Hordes\nFaction: Fallen Angels\nSaeryn, Omen of Everblight\n* Shredder\n\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(0);

        expect(res[0][0].lists.length).toBe(2);

        expect(res[0][0].lists[0].faction).toBe('Legion of Everblight');
        expect(res[0][0].lists[0].caster).toBe('thagrosh2');
        expect(res[0][0].lists[0].theme).toBe(null);
        expect(res[0][0].lists[0].fk).toBe('Thagrosh, the Messiah\n* Carnivean');

        expect(res[0][0].lists[1].faction).toBe('Legion of Everblight');
        expect(res[0][0].lists[1].caster).toBe('saeryn1');
        expect(res[0][0].lists[1].theme).toBe('Fallen Angels');
        expect(res[0][0].lists[1].fk).toBe('Saeryn, Omen of Everblight\n* Shredder');
      });

      it('should warn about unknown list casters', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Legion of Everblight\n\n"+
"System: Hordes\nFaction: Legion of Everblight\nToto le gros\n* Carnivean\n\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[0][0].lists.length).toBe(1);

        expect(res[0][0].lists[0].faction).toBe('Legion of Everblight');
        expect(res[0][0].lists[0].caster).toBe('Toto le gros');
        expect(res[0][0].lists[0].theme).toBe(null);
        expect(res[0][0].lists[0].fk).toBe('Toto le gros\n* Carnivean');

        expect(res[1][0]).toMatch(/line \d+.*unknown caster/);
      });

      it('should skip lists for invalid players', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Legion of Everblight\n\n"+
"Player: \nCity: Chambery\nFaction: Cryx\n\n"+
"System: Hordes\nFaction: Legion of Everblight\nToto le gros\n* Carnivean\n\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(2);

        expect(res[0][0].lists.length).toBe(0);

        expect(res[1][0]).toMatch(/line \d+.*empty player name/);
        expect(res[1][1]).toMatch(/line \d+.*unexpected list definition/);
      });

      it('should warn about unknown parameters', function() {
        var string =
"Player: Toto\nCity: Chambery\nFaction: Legion of Everblight\nNew: blah\n\n"+
"System: Hordes\nFaction: Legion of Everblight\nUnknown: X\n"+
"Toto le gros\n* Carnivean\nFaction: Toto\n\n\n";
        var res = fkParser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(4);

        expect(res[1][0]).toMatch(/line \d+.*parameter .*New.*ignored/);
        expect(res[1][1]).toMatch(/line \d+.*parameter .*Unknown.*ignored/);
        expect(res[1][2]).toMatch(/line \d+.*unknown caster/);
        expect(res[1][3]).toMatch(/line \d+.*parameter .*Faction.*ignored/);
      });
    });
  });

});
