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
          // name !== key
          'Protectorate of Menoth': { name: 'The Protectorate of Menoth', t3: 'Menoth' },
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

      it('should extract players names, origin and faction', function() {
        var string =
            "Player: Toto\nOrigin: Chambery\nFaction: Legion of Everblight\n\n"+
            "Player: titi\nOrigin: Lyon\nFaction: Cryx\n\n"+
            // parse faction name
            "Player: tatA\nOrigin: Grenoble\nFaction: The Protectorate of Menoth\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(3);
        expect(res[1].length).toBe(0);

        expect(res[0][0].name).toBe('Toto');
        expect(res[0][0].origin).toBe('Chambery');
        expect(res[0][0].faction).toBe('Legion of Everblight');

        // capitalize
        expect(res[0][1].name).toBe('Titi');
        expect(res[0][1].origin).toBe('Lyon');
        expect(res[0][1].faction).toBe('Cryx');

        // capitalize
        expect(res[0][2].name).toBe('TatA');
        expect(res[0][2].origin).toBe('Grenoble');
        // store faction key
        expect(res[0][2].faction).toBe('Protectorate of Menoth');
      });

      it('should log error when player name is invalid', function() {
        var string =
"Player: \nOrigin: Chambery\nFaction: Cryx\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(0);
        expect(res[1].length).toBe(1);

        expect(res[1][0]).toMatch(/line 1 empty player name/);
      });

      it('should log error when player name already exists', function() {
        var string =
"Player: Toto\nOrigin: Chambery\nFaction: Cryx\n\n"+
"Player: Toto\nOrigin: Chambery\nFaction: Cryx\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[1][0]).toMatch(/line 5 player name .*already exists/);
      });

      it('should warn about unknown player factions', function() {
        var string =
"Player: Toto\nOrigin: Chambery\nFaction: Unknown\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[0][0].name).toBe('Toto');
        expect(res[0][0].origin).toBe('Chambery');
        expect(res[0][0].faction).toBe('Unknown');

        expect(res[1][0]).toMatch(/line 3.*unknown faction/);
      });

      using([
        [ 'list1', 'list2' ],
        // FK
        [ 'Thagrosh, the Messiah (*3pts)\n'+
          '* Carnivean (11pts)\n'+
          'Objective: Fuel Cache\n'+
          'Specialists:\n'+
          '* Raek (4pts)',
          'Saeryn, Omen of Everblight (*5pts)\n'+
          '* Shredder (2pts)' ],
        // WHAC
        [ 'Thagrosh, the Messiah(*3points)\n'+
          '* Carnivean(11points)\n'+
          'Objective: Fuel Cache\n'+
          'Specialists:\n'+
          '* Raek(4points)',
          'Saeryn, Omen of Everblight(*5points)\n'+
          '* Shredder(2points)' ],
        // Warroom
        [ 'Thagrosh, the Messiah - WB: 3\n'+
          '* Carnivean - PC: 11\n'+
          'Objective: Fuel Cache\n'+
          'Specialists:\n'+
          '* Raek - PC: 4',
          'Saeryn, Omen of Everblight - WB: 5\n'+
          '* Shredder - PC: 2' ],
      ], function(e, d) {
        it('should extract players lists, '+d, function() {
          var string = 'Player: Toto\nOrigin: Chambery\nFaction: Legion of Everblight\n'+
              '\nList:\n'+e.list1+
              '\n\nList:\nTheme: Saeryn - Fallen Angels\n'+e.list2+
              '\n\n';
          var res = fkParser.parse(this.factions, string);

          expect(res[0].length).toBe(1);
          expect(res[1].length).toBe(0);

          expect(res[0][0].lists.length).toBe(2);
          
          expect(res[0][0].lists[0].faction).toBe('Legion of Everblight');
          expect(res[0][0].lists[0].caster).toBe('thagrosh2');
          expect(res[0][0].lists[0].theme).toBe(undefined);
          expect(res[0][0].lists[0].fk).toBe(e.list1);

          expect(res[0][0].lists[1].faction).toBe('Legion of Everblight');
          expect(res[0][0].lists[1].caster).toBe('saeryn1');
          expect(res[0][0].lists[1].theme).toBe('Saeryn - Fallen Angels');
          expect(res[0][0].lists[1].fk).toBe(e.list2);
        });
      });

      it('should warn about unknown list casters', function() {
        var string =
"Player: Toto\nOrigin: Chambery\nFaction: Legion of Everblight\n\n"+
"List:\nToto le gros\n* Carnivean\n\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(1);

        expect(res[0][0].lists.length).toBe(1);

        expect(res[0][0].lists[0].faction).toBe('Legion of Everblight');
        expect(res[0][0].lists[0].caster).toBe('Toto le gros');
        expect(res[0][0].lists[0].theme).toBe(undefined);
        expect(res[0][0].lists[0].fk).toBe('Toto le gros\n* Carnivean');

        expect(res[1][0]).toMatch(/line \d+.*unknown caster/);
      });

      it('should skip lists for invalid players', function() {
        var string =
"Player: Toto\nOrigin: Chambery\nFaction: Legion of Everblight\n\n"+
"Player: \nOrigin: Chambery\nFaction: Cryx\n\n"+
"List:\nToto le gros\n* Carnivean\n\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(2);

        expect(res[0][0].lists.length).toBe(0);

        expect(res[1][0]).toMatch(/line \d+.*empty player name/);
        expect(res[1][1]).toMatch(/line \d+.*unexpected list definition/);
      });

      it('should warn about unknown parameters', function() {
        var string =
"Player: Toto\nOrigin: Chambery\nFaction: Legion of Everblight\nNew: blah\n\n"+
"List:\nUnknown: X\n"+
"Toto le gros\n* Carnivean\nFaction: Toto\n\n\n";
        var res = fkParser.parse(this.factions, string);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(3);

        expect(res[1][0]).toMatch(/line \d+.*parameter .*New.*ignored/);
        expect(res[1][1]).toMatch(/line \d+.*parameter .*Unknown.*ignored/);
        expect(res[1][2]).toMatch(/line \d+.*unknown caster/);
      });
    });
  });

});
