'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('players', function() {

    var players;

    beforeEach(inject([ 'players', function(_players) {
      players = _players;
    }]));

    describe('add(<player>, <group>)', function() {
      beforeEach(function() {
        this.coll = [
          [],
          [],
          []
        ];
      });

      it('should add <player> to <group>', function() {
        expect(players.add(this.coll, {name: 'toto2'}, 1)).toEqual([
          [],
          [
            { name: 'toto2' },
          ],
          []
        ]);
      });
    });

    describe('drop(<player>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ];
      });

      it('should drop <player> from any group', function() {
        expect(players.drop(this.coll, {name: 'toto2'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ]);
        expect(players.drop(this.coll, {name: 'tutu1'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
          ],
          [
            { name: 'tutu2' },
          ]
        ]);
      });

      it('should drop empty groups', function() {
        expect(players.drop(this.coll, {name: 'tata1'})).toEqual([
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tutu1' },
            { name: 'tutu2' },
          ]
        ]);
      });
    });

    describe('names()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { name: 'toto1' },
            { name: 'toto2' },
            { name: 'toto3' },
          ],
          [
            { name: 'tata1' },
            { name: 'tata2' },
          ]
        ];
      });

      it('should return player names list', function() {
        expect(players.names(this.coll)).toEqual([
          'toto1', 'toto2', 'toto3', 'tata1', 'tata2'
        ]);
      });
    });

    describe('cities()', function() {
      beforeEach(function() {
        this.coll = [
          [
            { city: 'toto1' },
            { city: 'toto2' },
            { city: 'toto1' },
          ],
          [
            { city: 'tata1' },
            { city: undefined },
          ],
          [
            { city: 'tata1' },
            { city: 'tutu2' },
          ]
        ];
      });

      it('should return uniq city names list', function() {
        expect(players.cities(this.coll)).toEqual([
          'toto1', 'toto2', 'tata1', 'tutu2'
        ]);
      });
    });

    describe('factions(<base_factions>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { faction: 'toto1' },
            { faction: 'toto2' },
            { faction: 'toto1' },
          ],
          [
            { faction: 'tata1' },
            { faction: undefined },
          ],
          [
            { faction: 'tata1' },
            { faction: 'tutu2' },
          ]
        ];
      });

      it('should return uniq faction names list appended with base factions', function() {
        expect(players.factions(this.coll, { toto2: {}, base1: {} })).toEqual([
          'toto1', 'toto2', 'tata1', 'tutu2', 'base1'
        ]);
      });
    });
  });

});
