'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('list', function() {
    var list;

    beforeEach(inject([ 'list', function(_list) {
      list = _list;
    }]));

    describe('create(<data>)', function() {
      it('should create a list object', function() {
        expect(list.create({ faction: 'faction',
                             caster: 'caster',
                             theme: 'theme',
                             fk: 'fk' })).toEqual({
          faction: 'faction',
          caster: 'caster',
          theme: 'theme',
          fk: 'fk'
        });
      });
    });
    
    describe('references()', function() {
      using([
        [ 'fk' ],
        // FK
        [ 'Saeryn, Omen of Everblight (*6pts)\r\n'+
          // blank lines are ignored
          '\t \r\n'+
          '* Angelius (9pts)\r\n'+
          '* Angelius (9pts)\r\n'+
          'Cylena Raefyll & Nyss Hunters (Cylena and 9 Grunts) (10pts)\r\n'+
          'Objective: Fuel cache\r\n'+
          'Specialists:\r\n'+
          '* Raek (4pts)\r\n'+
          'Hex Hunters (Leader and 5 Grunts) (5pts)\r\n'+
          '* Bayal, Hound of Everblight (3pts)\r\n'+
          'Tiers : +2" deployement\r\n'+
          'Tiers Bonus : +1 starting roll\r\n'+
          'Tiers 4 : spell martyrs gain AD\r\n' ],
        // WHAC
        [ 'Saeryn, Omen of Everblight(*6points)\r\n'+
          '* Angelius(9points)\r\n'+
          '* Angelius(9points)\r\n'+
          'Cylena Raefyll & Nyss Hunters(10points)(10models)\r\n'+
          'Objective: Fuel cache\r\n'+
          'Specialists:\r\n'+
          '* Raek(4points)\r\n'+
          'Hex Hunters(5points)(6models)\r\n'+
          '* UA Bayal, Hound of Everblight(3points)\r\n' ],
        // Warroom
        [ 'Saeryn, Omen of Everblight - WB: 6\r\n'+
          '-    Angelius - PC: 9\r\n'+
          '-    Angelius - PC: 9\r\n'+
          'Cylena Raefyll & Nyss Hunters - Cylena & 9 Grunts: 10\r\n'+
          'Objective: Fuel cache\r\n'+
          'Specialists:\r\n'+
          '-    Raek - PC: 4\r\n'+
          'Hex Hunters - Leader and 5 Grunts - PC: 5\r\n'+
          '-    Bayal, Hound of Everblight - PC: 3\r\n' ]
      ], function(e,d) {
        it('should parse references in FK list, '+d, function() {
          expect(list.references({
            fk: ''
          })).toEqual([]);
          expect(list.references({
            fk: e.fk
          })).toEqual([
            // titleize
            'Saeryn Omen Of Everblight',
            'Angelius',
            'Angelius',
            'Cylena Raefyll & Nyss Hunters',
            'Fuel Cache',
            'Raek',
            'Hex Hunters',
            // titleize
            'Bayal Hound Of Everblight'
          ]);
        });
      });
    });
  });

  describe('lists', function() {
    var lists;

    beforeEach(inject([ 'lists', function(_lists) {
      lists = _lists;
    }]));

    describe('add(<l>)', function() {
      it('should append list to collection', function() {
        expect(lists.add({ caster: '3' },
                         [ { caster: '1' }, { caster: '2' } ]))
          .toEqual([
            { caster: '1' },
            { caster: '2' },
            { caster: '3' }
          ]);
      });
    });

    describe('drop(<i>)', function() {
      it('should drop index <i> from collection', function() {
        expect(lists.drop(1, [ { caster: '1' },
                               { caster: '2' },
                               { caster: '3' }
                             ]))
          .toEqual([
            { caster: '1' },
            { caster: '3' }
          ]);
      });
    });

    describe('casters()', function() {
      it('should return caster names list', function() {
        expect(lists.casters([
          { caster: '1' },
          { caster: '2' },
          { caster: '3' }
        ])).toEqual([ '1', '2', '3' ]);
      });
    });

    describe('listForcaster(<c>)', function() {
      using([
        [ 'c' , 'list' ],
        [ '1' , { caster: '1', list: 1 } ],
        [ '3' , { caster: '3', list: 3 } ],
        [ '4' , undefined ]
      ], function(e, d) {
        it('should return caster list, '+d, function() {
          expect(lists.listForCaster(e.c, [
            { caster: '1', list: 1 },
            { caster: '2', list: 2 },
            { caster: '3', list: 3 }
          ])).toEqual(e.list);
        });
      });
    });

    describe('themeForcaster(<c>)', function() {
      using([
        [ 'c' , 'theme'   ],
        [ '1' , 'Theme1'  ],
        [ '3' , null      ],
        [ '4' , undefined ]
      ], function(e, d) {
        it('should return caster Theme name, '+d, function() {
          expect(lists.themeForCaster(e.c, [
            { caster: '1', theme: 'Theme1' },
            { caster: '2', theme: 'Theme2' },
            { caster: '3', theme: null }
          ])).toEqual(e.theme);
        });
      });
    });

    describe('containsCaster(<c>)', function() {
      using([
        [ 'c' , 'contains' ],
        [ '1' , true       ],
        [ '3' , true       ],
        [ '4' , false      ]
      ], function(e, d) {
        it('should check whether lists contains caster, '+d, function() {
          expect(lists.containsCaster(e.c, [
            { caster: '1' },
            { caster: '2' },
            { caster: '3' }
          ])).toEqual(e.contains);
        });
      });
    });
  });
 
});
