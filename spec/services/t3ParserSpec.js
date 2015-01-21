'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('t3Parser', function() {

    var t3Parser;

    beforeEach(inject([ 't3Parser', function(_t3Parser) {
      t3Parser = _t3Parser;
    }]));

    describe('parse(<string>, <factions>)', function() {
      beforeEach(function() {
        this.factions = {
          'Cryx': { name: 'Cryx', t3: 'Cryx' },
          'The Protectorate of Menoth': { name: 'The Protectorate of Menoth', t3: 'Menoth' },
          'Legion of Everblight': { name: 'Legion of Everblight', t3: 'Everblight' }
        };
      });

      it('should ignore first line', function() {
        var string =
"Place;Prénom;Nom de famille;Pseudo;Armée;Origine;Équipe;Liste d'armée;Note de compo;Payé\n";
        var res = t3Parser.parse(string, this.factions);

        expect(res[0].length).toBe(0);
        expect(res[1].length).toBe(0);
      });

      it('should extract players names, city and faction', function() {
        var string =
"Place;Prénom;Nom de famille;Pseudo;Armée;Origine;Équipe;Liste d'armée;Note de compo;Payé\n"+
"1;Vladimir;Bobroff;SunHunter;Protectorat de Menoth;Talence;GUILD;oui;;Oui\n"+
"2;Alexandre;Rey;elrey22;Cryx;Toulouse;;oui;;Oui\n"+
"6;Sylvester;Staline;communiste;Légion d'Everblight;Moscul;31 décapsule;oui;;Oui\n";
        var res = t3Parser.parse(string, this.factions);

        expect(res[0].length).toBe(3);
        expect(res[1].length).toBe(0);

        expect(res[0][0].name).toBe('SunHunter');
        expect(res[0][0].city).toBe('Talence');
        expect(res[0][0].faction).toBe('The Protectorate of Menoth');

        expect(res[0][1].name).toBe('elrey22');
        expect(res[0][1].city).toBe('Toulouse');
        expect(res[0][1].faction).toBe('Cryx');

        expect(res[0][2].name).toBe('communiste');
        expect(res[0][2].city).toBe('Moscul');
        expect(res[0][2].faction).toBe('Legion of Everblight');
      });

      it('should silently ignore empty lines', function() {
        var string =
"Place;Prénom;Nom de famille;Pseudo;Armée;Origine;Équipe;Liste d'armée;Note de compo;Payé\n"+
"1;Vladimir;Bobroff;SunHunter;Protectorat de Menoth;Talence;GUILD;oui;;Oui\n"+
"\n"+
"6;Sylvester;Staline;communiste;Légion d'Everblight;Moscul;31 décapsule;oui;;Oui\n";
        var res = t3Parser.parse(string, this.factions);

        expect(res[0].length).toBe(2);
        expect(res[1].length).toBe(0);

        expect(res[0][0].name).toBe('SunHunter');
        expect(res[0][0].city).toBe('Talence');
        expect(res[0][0].faction).toBe('The Protectorate of Menoth');

        expect(res[0][1].name).toBe('communiste');
        expect(res[0][1].city).toBe('Moscul');
        expect(res[0][1].faction).toBe('Legion of Everblight');
      });

      it('should log error when number of field is incorrect', function() {
        var string =
"Place;Prénom;Nom de famille;Pseudo;Armée;Origine;Équipe;Liste d'armée;Note de compo;Payé\n"+
// too short
"1;Vladimir;Bobroff;SunHunter;Protectorat de Menoth;Talence;GUILD;oui;\n"+
// too long
"2;Alexandre;Rey;elrey22;Cryx;Toulouse;;oui;;Oui;toto;\n"+
"6;Sylvester;Staline;communiste;Légion d'Everblight;Moscul;31 décapsule;oui;;Oui\n";
        var res = t3Parser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(2);

        expect(res[0][0].name).toBe('communiste');
        expect(res[0][0].city).toBe('Moscul');
        expect(res[0][0].faction).toBe('Legion of Everblight');

        expect(res[1][0]).toMatch(/line 2 invalid fields number/);
        expect(res[1][1]).toMatch(/line 3 invalid fields number/);
      });

      it('should log error when player name is invalid', function() {
        var string =
"Place;Prénom;Nom de famille;Pseudo;Armée;Origine;Équipe;Liste d'armée;Note de compo;Payé\n"+
"1;Vladimir;Bobroff;SunHunter;Protectorat de Menoth;Talence;GUILD;oui;;Oui\n"+
"2;Alexandre;Rey;;Cryx;Toulouse;;oui;;Oui\n"+
"6;Sylvester;Staline;SunHunter;Légion d'Everblight;Moscul;31 décapsule;oui;;Oui\n";
        var res = t3Parser.parse(string, this.factions);

        expect(res[0].length).toBe(1);
        expect(res[1].length).toBe(2);

        expect(res[0][0].name).toBe('SunHunter');
        expect(res[0][0].city).toBe('Talence');
        expect(res[0][0].faction).toBe('The Protectorate of Menoth');

        expect(res[1][0]).toMatch(/line 3 empty player name/);
        expect(res[1][1]).toMatch(/line 4 player name ".*" already exists/);
      });
    });
  });

});
