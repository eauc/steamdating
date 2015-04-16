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
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: 'caster5'  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
          [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: null  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
        ];
      });

      using([
        [ 'name'   , 'games' ],
        // uniq
        [ 'toto'   , [{ p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' } },
                      { p1 : { name : 'toto', list : 'caster1' },
                        p2 : { name : 'tata' } }
                     ] ],
        // without null
        [ 'titi'   , [{ p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : 'caster5' } },
                      { p1 : { name : 'tutu' },
                        p2 : { name : 'titi', list : null } }
                     ] ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return games played by <name>, '+d, function() {
          expect(rounds.gamesForPlayer(e.name, this.coll)).toEqual(e.games);
        });
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: 'caster5'  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
          [
            { p1: { name: 'toto', list: 'caster1' }, p2: {name: 'tata' } },
            { p1: { name: 'tutu'}, p2: {name: 'titi', list: null  } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
        ];
      });

      using([
        [ 'name'   , 'lists'                ],
        // uniq
        [ 'toto'   , ['caster1']            ],
        // without null
        [ 'titi'   , ['caster5']            ],
        // undefined player
        [ 'unkown' , []                     ],
      ], function(e, d) {
        it('should return lists played by <name>, '+d, function() {
          expect(rounds.listsForPlayer(e.name, this.coll)).toEqual(e.lists);
        });
      });
    });

    describe('drop(<index>)', function() {
      it('should remove <index> from collection', function() {
        expect(rounds.drop(1, [ 'r1', 'r2', 'r3' ])).toEqual([ 'r1', 'r3' ]);
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
          expect(rounds.pointsForPlayer('toto',undefined, 32,
                                        this.coll))
            .toEqual({
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
            expect(rounds.pointsForPlayer('toto', e.bracket_start, 32,
                                          this.coll))
              .toEqual(e.points);
          });
        });
      });
    });

    describe('opponentsForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto' }, p2: { name: 'tata' } },
            { p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
          [
            { p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { p1: { name: 'tata' }, p2: { name: undefined } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
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
        // undefined player
        [ 'unknown' , []               ],
      ], function(e, d) {
        it('should return opponents played by <name>, '+d, function() {
          expect(rounds.opponentsForPlayer(e.name, this.coll))
            .toEqual(e.opponents);
        });
      });
    });

    describe('pairAlreadyExist(<game>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { p1: { name: 'toto' }, p2: { name: 'tata' } },
            { p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
          [
            { p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { p1: { name: 'tata' }, p2: { name: undefined } },
            { p1: { name: 't1' }, p2: { name: 't2' } }
          ],
        ];
      });

      using([
        [ 'game'                                         , 'already' ],
        [ { p1: { name: 'toto' }, p2: { name: null } }   , false     ],
        [ { p1: { name: null }, p2: { name: 'tata' } }   , false     ],
        [ { p1: { name: 'toto' }, p2: { name: 'tata' } } , true      ],
        [ { p1: { name: 'toto' }, p2: { name: 'titi' } } , false     ],
      ], function(e, d) {
        it('should check whether the players of <game> have already beeen paired, '+d, function() {
          expect(rounds.pairAlreadyExists(e.game, this.coll))
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
        expect(rounds.registerNextRound([ ['group1'], ['group2'] ],
                                        [ ['round1'], ['round2'] ]))
          .toEqual([
            ['round1'],
            ['round2'],
            [ ['group1'], ['group2'] ]
          ]);
      });
    });

    describe('tablesForPlayer(<name>)', function() {
      beforeEach(function() {
        this.coll = [
          [
            { table: 1, p1: { name: 'toto' }, p2: { name: 'tata' } },
            { table: 2, p1: { name: 'tutu' }, p2: { name: 'titi' } },
            { table: 3, p1: { name: 't1' }, p2: { name: 't2' } }
          ],
          [
            { table: 3, p1: { name: 'toto' }, p2: { name: 'tutu' } },
            { table: 2, p1: { name: 'tata' }, p2: { name: undefined } },
            { table: 1, p1: { name: 't1' }, p2: { name: 't2' } }
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
        // undefined player
        [ 'unknown' , []       ],
      ], function(e, d) {
        it('should return tables played on by <name>, '+d, function() {
          expect(rounds.tablesForPlayer(e.name, this.coll))
            .toEqual(e.tables);
        });
      });
    });
  });

});
