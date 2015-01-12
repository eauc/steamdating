'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('round', function() {

    var round;

    beforeEach(inject([ 'round', function(_round) {
      round = _round;
    }]));

    describe('gameForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'toto'}, p2: {name: 'tata' }, games: [] },
          { p1: { name: 'tutu'}, p2: {name: 'titi' }, games: [] },
          { p1: { name: 't1' }, p2: { name: 't2' },
            games: [ { p1: { name: 'p1'}, p2: {name: 'p2' }, games: [] },
                     { p1: { name: 'p3'}, p2: {name: 'p4' }, games: [] } ] }
        ];
      });

      it('should return game involving <name>', function() {
        expect(round.gameForPlayer(this.coll, 'toto')).toBe(this.coll[0]);
        expect(round.gameForPlayer(this.coll, 'titi')).toBe(this.coll[1]);

        expect(round.gameForPlayer(this.coll, 't2')).toBe(this.coll[2]);

        expect(round.gameForPlayer(this.coll, 'p1')).toBe(this.coll[2].games[0]);
        expect(round.gameForPlayer(this.coll, 'p4')).toBe(this.coll[2].games[1]);

        expect(round.gameForPlayer(this.coll, 'unknown')).toBe(undefined);
      });
    });

  });

});
