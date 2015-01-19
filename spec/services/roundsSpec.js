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

    describe('pointsForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto', tournament: 1, control: 2, army: 3 } }
          ],
          [
            { p1: { name: 'other' }, p2: { name: 'toto', tournament: 10, control: 20, army: 30 } }
          ],
          [
            /* round without a game for this player */
            { p1: { name: 'other' }, p2: { name: 'another' }, games: [] }
          ],
          [ /* empty round */ ],
          [
            { p1: { name: 'toto', tournament: 100, control: 200, army: 300 } }
          ],
        ];
      });

      when('bracket is not defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          // uniq
          expect(rounds.pointsForPlayer(this.coll, 'toto',
                                        undefined, 32)).toEqual({
                                          bracket: 0,
                                          tournament : 111,
                                          control: 222,
                                          army: 333,
                                          sos: 0
                                        });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          // bracket from start
          expect(rounds.pointsForPlayer(this.coll, 'toto',
                                        0, 32)).toEqual({
                                          bracket: 392,
                                          tournament : 111,
                                          control: 222,
                                          army: 333,
                                          sos: 0
                                        });
          // started after a few rounds
          expect(rounds.pointsForPlayer(this.coll, 'toto',
                                        2, 32)).toEqual({
                                          bracket: 800,
                                          tournament : 111,
                                          control: 222,
                                          army: 333,
                                          sos: 0
                                        });
          // not yet started
          expect(rounds.pointsForPlayer(this.coll, 'toto',
                                        6, 32)).toEqual({
                                          bracket: 0,
                                          tournament : 111,
                                          control: 222,
                                          army: 333,
                                          sos: 0
                                        });
        });
      });
    });

    describe('opponentsForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto' }, p2: { name: 'tata' }, games: [] },
            { p1: { name: 'tutu' }, p2: { name: 'titi' }, games: [] },
            { p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { p1: { name: 'p1'}, p2: { name: 'p2' }, games: [] },
                       { p1: { name: 'p3'}, p2: { name: 'p4' }, games: [] } ] }
          ],
          [
            { p1: { name: 'toto' }, p2: { name: 'tutu' }, games: [] },
            { p1: { name: 'tata' }, p2: { name: undefined }, games: [] },
            { p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { p1: { name: 'p1' }, p2: { name: 'p3' }, games: [] },
                       { p1: { name: 'p2' }, p2: { name: 'p4' }, games: [] } ] }
          ],
        ];
      });

      it('should return opponents played by <name>', function() {
        expect(rounds.opponentsForPlayer(this.coll, 'toto'))
          .toEqual(['tata', 'tutu']);
        // without null
        expect(rounds.opponentsForPlayer(this.coll, 'tata'))
          .toEqual(['toto']);
        // missing a game
        expect(rounds.opponentsForPlayer(this.coll, 'titi'))
          .toEqual(['tutu']);
        // sub-games
        expect(rounds.opponentsForPlayer(this.coll, 'p3'))
          .toEqual(['p4','p1']);
        // undefined player
        expect(rounds.opponentsForPlayer(this.coll, 'unknown'))
          .toEqual([]);
      });
    });
    
    describe('createNextRound(<players>)', function() {
      beforeEach(inject(function(game) {
        spyOn(game, 'create').and.callFake(function(t) { return 'table'+t ; });
        this.game = game;
      }));

      it('should create new games for each player groups', function() {
        var round = rounds.createNextRound([
          [ 'player1', 'player2', 'player3', 'player4' ],
          [ ],
          [ 'player5', 'player6' ],
        ]);
        expect(round).toEqual([
          [ 'table1', 'table2' ],
          [ ],
          [ 'table3' ],
        ]);
        expect(this.game.create).toHaveBeenCalled();
        expect(this.game.create.calls.count()).toBe(3);
      });
    });

    describe('registerNextRound(<next_round>)', function() {
      it('should append flattened <next_round> to <coll>', function() {
        expect(rounds.registerNextRound([ ['round1'], ['round2'] ],
                                        [ ['group1'], ['group2'] ]))
          .toEqual([ ['round1'], ['round2'], ['group1', 'group2'] ]);
      });
    });

    describe('tablesForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { table: 1, p1: { name: 'toto' }, p2: { name: 'tata' }, games: [] },
            { table: 2, p1: { name: 'tutu' }, p2: { name: 'titi' }, games: [] },
            { table: 3, p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { table: 31, p1: { name: 'p1'}, p2: { name: 'p2' }, games: [] },
                       { table: 32, p1: { name: 'p3'}, p2: { name: 'p4' }, games: [] } ] }
          ],
          [
            { table: 3, p1: { name: 'toto' }, p2: { name: 'tutu' }, games: [] },
            { table: 2, p1: { name: 'tata' }, p2: { name: undefined }, games: [] },
            { table: 1, p1: { name: 't1' }, p2: { name: 't2' },
              games: [ { table: 31, p1: { name: 'p1' }, p2: { name: 'p3' }, games: [] },
                       { table: 32, p1: { name: 'p2' }, p2: { name: 'p4' }, games: [] } ] }
          ],
        ];
      });

      it('should return tables played on by <name>', function() {
        expect(rounds.tablesForPlayer(this.coll, 'toto'))
          .toEqual([1, 3]);
        // without null
        expect(rounds.tablesForPlayer(this.coll, 'tata'))
          .toEqual([1, 2]);
        // missing a game
        expect(rounds.tablesForPlayer(this.coll, 'titi'))
          .toEqual([2]);
        // sub-games
        expect(rounds.tablesForPlayer(this.coll, 'p3'))
          .toEqual([32, 31]);
        // undefined player
        expect(rounds.tablesForPlayer(this.coll, 'unknown'))
          .toEqual([]);
      });
    });
  });

});
