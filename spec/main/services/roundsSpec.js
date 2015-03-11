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

    describe('lastRoundIsComplete(<name>)', function() {
      beforeEach(function() {
        this.roundService = spyOnService('round');
      });

      when('<coll> is empty', function() {
      }, function() {
        it('should return true', function() {
          expect(rounds.lastRoundIsComplete([])).toBe(true);
        });
      });

      when('<coll> is empty', function() {
        this.coll = [ 'first', 'last' ];
      }, function() {
        it('should check whether last round is complete', function() {
          expect(rounds.lastRoundIsComplete(this.coll))
            .toBe('round.allGamesHaveResult.returnValue');
          expect(this.roundService.allGamesHaveResult)
            .toHaveBeenCalledWith('last');
        });
      });
    });

    describe('gamesForPlayer(<name>)', function() {
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

      using([
        [ 'name'   , 'games' ],
        // uniq
        [ 'toto'   , [{ p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' }, games : [  ] },
                      { p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' }, games : [  ] }] ],
        // without null
        [ 'titi'   , [{ p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : 'caster5' }, games : [  ] },
                      { p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : null }, games : [  ] }] ],
        // sub-games
        [ 'p3'     , [{ p1 : { name : 'p3', list : 'caster1' },
                        p2 : { name : 'p4' }, games : [  ] },
                      { p1 : { name : 'p3', list : 'caster3' },
                        p2 : { name : 'p4' }, games : [  ] }] ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return games played by <name>, '+d, function() {
          expect(rounds.gamesForPlayer(this.coll, e.name)).toEqual(e.games);
        });
      });
    });

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

      using([
        [ 'name'   , 'lists'                ],
        // uniq
        [ 'toto'   , ['caster1']            ],
        // without null
        [ 'titi'   , ['caster5']            ],
        // sub-games
        [ 'p3'     , ['caster1', 'caster3'] ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return lists played by <name>, '+d, function() {
          expect(rounds.listsForPlayer(this.coll, e.name)).toEqual(e.lists);
        });
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
            { victory: 'assassination',
              p1: { name: 'toto', tournament: 1,
                    control: 2, army: 3, custom_field: 6 } }
          ],
          [
            { victory: 'assassination',
              p1: { name: 'other' },
              p2: { name: 'toto', tournament: 10,
                    control: 20, army: 30, custom_field: 60 } }
          ],
          [
            /* round without a game for this player */
            { victory: 'assassination',
              p1: { name: 'other' },
              p2: { name: 'another' }, games: [] }
          ],
          [ /* empty round */ ],
          [
            { victory: 'assassination',
              p1: { name: 'toto', tournament: 100,
                    control: 200, army: 300, custom_field: 600 } }
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
                                          custom_field: 666,
                                          sos: 0,
                                          assassination: 1
                                        });
        });
      });

      when('bracket is defined', function() {
      }, function(){
        using([
          [ 'bracket_start' , 'points' ],
          // bracket from start
          [ 0               , { bracket: 392,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0,
                                assassination: 1 } ],
          // started after a few rounds
          [ 2               , { bracket: 800,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0,
                                assassination: 1 } ],
          // not yet started
          [ 6               , { bracket: 0,
                                tournament : 111,
                                control: 222,
                                army: 333,
                                custom_field: 666,
                                sos: 0,
                                assassination: 1 } ],
        ], function(e, d) {
          it('should sum points for <name>, '+d, function() {
            expect(rounds.pointsForPlayer(this.coll, 'toto',
                                          e.bracket_start, 32))
              .toEqual(e.points);
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

      using([
        [ 'name'    , 'opponents'      ],
        [ 'toto'    , ['tata', 'tutu'] ],
        // without null
        [ 'tata'    , ['toto']         ],
        // missing a game
        [ 'titi'    , ['tutu']         ],
        // sub-games
        [ 'p3'      , ['p4','p1']      ],
        // undefined player
        [ 'unknown' , []               ],
      ], function(e, d) {
        it('should return opponents played by <name>, '+d, function() {
          expect(rounds.opponentsForPlayer(this.coll, e.name))
            .toEqual(e.opponents);
        });
      });
    });

    describe('pairAlreadyExist(<game>)', function() {
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

      using([
        [ 'game'                                         , 'already' ],
        [ { p1: { name: 'toto' }, p2: { name: null } }   , false     ],
        [ { p1: { name: null }, p2: { name: 'tata' } }   , false     ],
        [ { p1: { name: 'toto' }, p2: { name: 'tata' } } , true      ],
        [ { p1: { name: 'toto' }, p2: { name: 'titi' } } , false     ],
        [ { p1: { name: 'p3' }, p2: { name: 'p4' } }     , true      ],
        [ { p1: { name: 'p3' }, p2: { name: 'p2' } }     , false     ],
      ], function(e, d) {
        it('should check whether the players of <game> have already beeen paired, '+d, function() {
          expect(rounds.pairAlreadyExists(this.coll, e.game))
            .toBe(e.already);
        });
      });
    });
    
    describe('createNextRound(<players>)', function() {
      beforeEach(inject(function(game) {
        spyOn(game, 'create').and.callFake(function(g) { return 'table'+g.table ; });
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

      using([
        [ 'name'    , 'tables' ],
        [ 'toto'    , [1, 3]   ],
        // without null
        [ 'tata'    , [1, 2]   ],
        // missing a game
        [ 'titi'    , [2]      ],
        // sub-games
        [ 'p3'      , [32, 31] ],
        // undefined player
        [ 'unknown' , []       ],
      ], function(e, d) {
        it('should return tables played on by <name>, '+d, function() {
          expect(rounds.tablesForPlayer(this.coll, e.name))
            .toEqual(e.tables);
        });
      });
    });
  });

});
