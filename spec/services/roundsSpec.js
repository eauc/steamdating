'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('rounds', function() {

    var rounds;

    beforeEach(inject([ 'rounds', function(_rounds) {
      rounds = _rounds;
    }]));

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: 'caster5'  }, games: [] },
            { p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { p1: { name: 'p1'}, p2: {name: 'p2' }, games: [] },
                       { p1: { name: 'p3', list: 'caster1' }, p2: {name: 'p4' }, games: [] } ] }
          ],
          [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: null  }, games: [] },
            { p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { p1: { name: 'p1'}, p2: {name: 'p2' }, games: [] },
                       { p1: { name: 'p3', list: 'caster3' }, p2: {name: 'p4' }, games: [] } ] }
          ],
        ];
      });

      it('should return lists played by <name>', function() {
        // uniq
        expect(rounds.listsForPlayer(this.coll, 'toto')).toEqual(['caster1']);
        // without null
        expect(rounds.listsForPlayer(this.coll, 'titi')).toEqual(['caster5']);
        // sub-games
        expect(rounds.listsForPlayer(this.coll, 'p3')).toEqual(['caster1','caster3']);
        // undefined player
        expect(rounds.listsForPlayer(this.coll, 'unknown')).toEqual([]);
      });
    });

    describe('drop(<index>)', function() {
      it('should remove <index> from collection', function() {
        expect(rounds.drop([ 'r1', 'r2', 'r3' ], 1)).toEqual([ 'r1', 'r3' ]);
      });
    });
  });

});
