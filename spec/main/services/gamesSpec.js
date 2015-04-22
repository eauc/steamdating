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

    describe('pointsForPlayer(<player>, <brackets>, <bracket_weight>)', function() {
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
          expect(games.pointsForPlayer('toto', [null,null,null,null], 32, this.coll))
            .toEqual({
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
          expect(games.pointsForPlayer('toto', [null,1,2,3], 32, this.coll))
            .toEqual({
              bracket: 16,
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

    describe('pointsAgainsPlayer(<player>, <brackets>, <bracket_weight>)', function() {
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
          expect(games.pointsAgainstPlayer('toto', [null,null,null,null], 32, this.coll))
            .toEqual({
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
          expect(games.pointsAgainstPlayer('toto', [null,1,2,3], 32, this.coll))
            .toEqual({
              bracket: 40,
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

    describe('reducePoints(<brackets>, <bracket_weight>, <player_games>)', function() {
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
          expect(games.reducePoints([undefined], 32, this.coll))
            .toEqual({
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
          [ 'brackets'             , 'points' ],
          // bracket from start
          [ [1,2,3,4]              , { bracket: 592,
                                       tournament : 111,
                                       control: 222,
                                       army: 333,
                                       custom_field: 666,
                                       sos: 0 } ],
          // started after a few rounds
          [ [null,null,1,2]        , { bracket: 1600,
                                       tournament : 111,
                                       control: 222,
                                       army: 333,
                                       custom_field: 666,
                                       sos: 0 } ],
          // not yet started
          [ [null,null,null,null]  , { bracket: 0,
                                       tournament : 111,
                                       control: 222,
                                       army: 333,
                                       custom_field: 666,
                                       sos: 0 } ],
        ], function(e, d) {
          it('should sum points, '+d, function() {
            expect(games.reducePoints(e.brackets, 32, this.coll))
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
          expect(games.opponentsForPlayer(e.name, this.coll))
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
          expect(games.tablesForPlayer(e.name, this.coll))
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
          expect(games.listsForPlayer(e.name, this.coll))
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
          expect(games.forCaster(e.p, e.c, this.coll))
            .toEqual(e.games);
        });
      });
    });

    describe('winners()', function() {
      it('should extract list of winners', function() {
        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          { p1: { name: 'p3', tournament: 0 }, p2: { name: null, tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(games.winners(this.coll)).toEqual(['p1', null, 'p5']);
      });
    });

    describe('losers()', function() {
      it('should extract list of losers', function() {
        this.coll = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p2', tournament: 0 } },
          { p1: { name: null, tournament: 0 }, p2: { name: 'p4', tournament: 1 } },
          { p1: { name: 'p5', tournament: 1 }, p2: { name: 'p6', tournament: 0 } }
        ];

        expect(games.losers(this.coll)).toEqual(['p2', null, 'p6']);
      });
    });

    describe('updatePlayer(<game_index>, <player_key>)', function() {
      beforeEach(function() {
        this.coll = [
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: 'p2' }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ];
      });

      it('should remove game[<game_index>][<player_key>] player from all other games', function() {
        expect(games.updatePlayer(1, 'p1', this.coll)).toEqual([
          { p1: { name: 'p1' }, p2: { name: null } },
          { p1: { name: 'p2' }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ]);

        expect(games.updatePlayer(0, 'p2', this.coll)).toEqual([
          { p1: { name: 'p1' }, p2: { name: 'p2' } },
          { p1: { name: null }, p2: { name: null } },
          { p1: { name: 'p5' }, p2: { name: 'p1' } }
        ]);
      });
    });

    describe('updateTable(<game_index>, <min_table>)', function() {
      beforeEach(function() {
        this.coll = [
          { table:4, p1: { name: 'p1' }, p2: { name: 'p2' } },
          { table:5, p1: { name: 'p2' }, p2: { name: null } },
          { table:4, p1: { name: 'p5' }, p2: { name: 'p1' } }
        ];
      });

      it('should reorder tables', function() {
        expect(games.updateTable(2, 4, this.coll)).toEqual([
          { table : 4, p1 : { name : 'p5' }, p2 : { name : 'p1' } },
          { table : 5, p1 : { name : 'p2' }, p2 : { name : null } },
          { table : 6, p1 : { name : 'p1' }, p2 : { name : 'p2' } }
        ]);
      });
    });

    describe('pairedPlayers()', function() {
      it('should return list of paired players', function() {
        expect(games.pairedPlayers([
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p3' }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: 'p6' } } ]
        ])).toEqual([ 'p1', 'p2', 'p3', 'p4', 'p5', 'p6' ]);
        // uniq
        expect(games.pairedPlayers([
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: 'p2' }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: 'p1' } } ]
        ])).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
        // without null/undefined
        expect(games.pairedPlayers([
          [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
            { p1: { name: null }, p2: { name: 'p4' } } ],
          [ { p1: { name: 'p5' }, p2: { name: undefined } } ]
        ])).toEqual([ 'p1', 'p2', 'p4', 'p5' ]);
      });
    });

    describe('isPlayerPaired(<player>)', function() {
      using([
        [ 'name' , 'isPaired' ],
        [ 'p2'   , true       ],
        [ 'p5'   , true       ],
        [ 'p3'   , false      ],
        [ null   , false      ],
      ], function(e, d) {
        it('should check whether <player> is paired, '+d, function() {
          this.coll = [
            [ { p1: { name: 'p1' }, p2: { name: 'p2' } },
              { p1: { name: 'p2' }, p2: { name: null } } ],
            [ { p1: { name: 'p5' }, p2: { name: 'p1' } } ]
          ];

          expect(games.isPlayerPaired({ name: e.name }, this.coll))
            .toBe(e.isPaired);
        });
      });
    });
  });

});
