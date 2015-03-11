'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('games', function() {

    var games;

    beforeEach(inject([ 'games', function(_games) {
      games = _games;
    }]));

    describe('pointsForPlayer(<player>, <bracket_start>, <bracket_end>)', function() {
      beforeEach(function() {
        this.coll = [
          { victory: 'assassination',
            p1: { name: 'toto', tournament: 1, control: 2, army: 3, custom_field: 3 },
            p2: { name: 'opp', tournament: 0, control: 5, army: 6, custom_field: 9 } },
          { victory: 'assassination',
            p1: {name: 'toto', tournament: 0, control: 20, army: 30, custom_field: 34 },
            p2: { name: 'opp', tournament: 1, control: 0, army: 0, custom_field: 24 } },
          { victory: null,
            p1: { name: 'toto', tournament: 1, control: 0, army: 0, custom_field: 0 },
            p2: { name: 'opp', tournament: 0, control: 50, army: 60, custom_field: 13 } },
          { victory: null,
            p1: { name: 'toto', tournament: 0, control: 200, army: 300, custom_field: 45 },
            p2: { name: 'opp', tournament: 1, control: 500, army: 600, custom_field: 0 } }
        ];
      });

      when('bracket is not defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          // uniq
          expect(games.pointsForPlayer(this.coll, 'toto', undefined, 32)).toEqual({
            bracket: 0,
            tournament : 2,
            control: 222,
            army: 333,
            custom_field: 82,
            sos: 0,
            assassination: 1
          });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          expect(games.pointsForPlayer(this.coll, 'toto', 2, 32))
            .toEqual({
              bracket: 32,
              tournament : 2,
              control: 222,
              army: 333,
              custom_field : 82,
              sos: 0,
              assassination: 1
            });
        });
      });
    });

    describe('pointsAgainsPlayer(<player>, <bracket_start>, <bracket_end>)', function() {
      beforeEach(function() {
        this.coll = [
          { victory: 'assassination',
            p1: { name: 'toto', tournament: 1, control: 2, army: 3, custom_field: 3 },
            p2: { name: 'opp', tournament: 0, control: 5, army: 6, custom_field: 9 } },
          { victory: 'assassination',
            p1: {name: 'toto', tournament: 0, control: 20, army: 30, custom_field: 34 },
            p2: { name: 'opp', tournament: 1, control: 0, army: 0, custom_field: 24 } },
          { victory: null,
            p1: { name: 'toto', tournament: 1, control: 0, army: 0, custom_field: 0 },
            p2: { name: 'opp', tournament: 0, control: 50, army: 60, custom_field: 13 } },
          { victory: null,
            p1: { name: 'toto', tournament: 0, control: 200, army: 300, custom_field: 45 },
            p2: { name: 'opp', tournament: 1, control: 500, army: 600, custom_field: 0 } }
        ];
      });

      when('bracket is not defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          // uniq
          expect(games.pointsAgainstPlayer(this.coll, 'toto', undefined, 32)).toEqual({
            bracket: 0,
            tournament : 2,
            control: 555,
            army: 666,
            custom_field: 46,
            sos: 0,
            assassination: 1
          });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        it('should sum points for <name>', function() {
          expect(games.pointsAgainstPlayer(this.coll, 'toto', 2, 32))
            .toEqual({
              bracket: 16,
              tournament : 2,
              control: 555,
              army: 666,
              custom_field: 46,
              sos: 0,
              assassination: 1
            });
        });
      });
    });

    describe('reducePoints(<player_games>, <bracket_start>, <bracket_end>)', function() {
      beforeEach(function() {
        this.coll = [
          { name: 'toto', tournament: 1, control: 2, army: 3, custom_field: 6 },
          { name: 'toto', tournament: 10, control: 20, army: 30, custom_field: 60 },
          { name: 'toto', tournament: 0, control: 0, army: 0, custom_field: 600 },
          { name: 'toto', tournament: 100, control: 200, army: 300, custom_field: 0 }
        ];
      });

      when('bracket is not defined', function() {
      }, function(){
        it('should sum points', function() {
          // uniq
          expect(games.reducePoints(this.coll, undefined, 32)).toEqual({
            bracket: 0,
            tournament : 111,
            control: 222,
            army: 333,
            custom_field: 666,
            sos: 0
          });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        using([
          [ 'bracket_start' , 'points' ],
          // bracket from start
          [ 0               , { bracket: 592,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0 } ],
          // started after a few rounds
          [ 2               , { bracket: 1600,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0 } ],
          // not yet started
          [ 4               , { bracket: 0,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0 } ],
        ], function(e, d) {
          it('should sum points, '+d, function() {
            expect(games.reducePoints(this.coll, e.bracket_start, 32))
              .toEqual(e.points);
          });
        });
      });
    });

    describe('opponentsForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'toto' }, p2: { name: 'tata' }, games: [] },
          { p1: { name: 'tutu' }, p2: { name: 'toto' }, games: [] },
        ];
      });

      using([
        [ 'name'    , 'opponents'      ],
        [ 'toto'    , ['tata', 'tutu'] ],
      ], function(e, d) {
        it('should return opponents played by <name>, '+d, function() {
          expect(games.opponentsForPlayer(this.coll, e.name))
            .toEqual(e.opponents);
        });
      });
    });

    describe('tablesForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { table: 1, p1: { name: 'toto' }, p2: { name: 'tata' }, games: [] },
          { table: 3, p1: { name: 'toto' }, p2: { name: 'tutu' }, games: [] },
        ];
      });

      using([
        [ 'name'    , 'tables' ],
        [ 'toto'    , [1, 3]   ],
      ], function(e, d) {
        it('should return tables played on by <name>, '+d, function() {
          expect(games.tablesForPlayer(this.coll, e.name))
            .toEqual(e.tables);
        });
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
          // ignored
          { p1: { name: 'toto', list: null }, p2: {name: 'tata' }, games: [] },
          // uniq
          { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
          { p1: { name: 'toto', list: 'caster3' }, p2: {name: 'tata' }, games: [] },
        ];
      });

      using([
        [ 'name'   , 'lists'                ],
        [ 'toto'   , ['caster1', 'caster3'] ],
      ], function(e, d) {
        it('should return lists played by <name>, '+d, function() {
          expect(games.listsForPlayer(this.coll, e.name))
            .toEqual(e.lists);
        });
      });
    });

    describe('forCaster(<c>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
          // ignored
          { p1: { name: 'toto', list: null }, p2: {name: 'tata' }, games: [] },
          // uniq
          { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' }, games: [] },
          { p1: { name: 'toto', list: 'caster3' }, p2: {name: 'tata' }, games: [] },
        ];
      });

      using([
        [ 'p'    , 'c'       , 'games' ],
        [ 'toto' , 'caster1' , [{ p1 : { name : 'toto', list : 'caster1' },
                                  p2 : { name : 'tata' }, games : [  ] },
                                { p1 : { name : 'toto', list : 'caster1' },
                                  p2 : { name : 'tata' }, games : [  ] }] ],
        [ 'toto' , 'caster2' , [] ],
        [ 'toto' , 'caster3' , [{ p1 : { name : 'toto', list : 'caster3' },
                                  p2 : { name : 'tata' }, games : [  ] }] ],
      ], function(e, d) {
        it('should filter list where <p> played list <c>, '+d, function() {
          expect(games.forCaster(this.coll, e.p, e.c))
            .toEqual(e.games);
        });
      });
    });
  });

});
