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

    describe('create(<...>)', function() {
      it('should create a list object', function() {
        expect(list.create('faction','caster','theme','fk')).toEqual({
          faction: 'faction',
          caster: 'caster',
          theme: 'theme',
          fk: 'fk'
        });
      });
    });

    describe('references()', function() {
      it('should parse references in FK list', function() {
        expect(list.references({
          fk: ''
        })).toEqual([]);
        expect(list.references({
          fk: 'Saeryn, Omen of Everblight (*6pts)\r\n'+
            // blank lines are ignored
            '\t \r\n'+
            '* Angelius (9pts)\r\n'+
            '* Angelius (9pts)\r\n'+
            'Hex Hunters (Leader and 5 Grunts) (8pts)\r\n'
        })).toEqual([
          'Saeryn, Omen of Everblight',
          'Angelius',
          'Angelius',
          'Hex Hunters'
        ]);
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
        expect(lists.add([ { caster: '1' }, { caster: '2' } ],
                         { caster: '3' })).toEqual([
                           { caster: '1' },
                           { caster: '2' },
                           { caster: '3' }
                         ]);
      });
    });

    describe('drop(<i>)', function() {
      it('should drop index <i> from collection', function() {
        expect(lists.drop([ { caster: '1' },
                            { caster: '2' },
                            { caster: '3' }
                          ], 1)).toEqual([
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
          expect(lists.listForCaster([
            { caster: '1', list: 1 },
            { caster: '2', list: 2 },
            { caster: '3', list: 3 }
          ], e.c)).toEqual(e.list);
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
          expect(lists.themeForCaster([
            { caster: '1', theme: 'Theme1' },
            { caster: '2', theme: 'Theme2' },
            { caster: '3', theme: null }
          ], e.c)).toEqual(e.theme);
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
          expect(lists.containsCaster([
            { caster: '1' },
            { caster: '2' },
            { caster: '3' }
          ], e.c)).toEqual(e.contains);
        });
      });
    });
  });
 
});
