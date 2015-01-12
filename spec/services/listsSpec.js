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

    describe('casters(<l>)', function() {
      it('should return caster names list', function() {
        expect(lists.casters([
          { caster: '1' },
          { caster: '2' },
          { caster: '3' }
        ])).toEqual([ '1', '2', '3' ]);
      });
    });
  });
 
});
