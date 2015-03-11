'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('game', function() {

    var game;

    beforeEach(inject([ 'game', function(_game) {
      game = _game;
    }]));

    describe('create(<data>)', function() {
      it('should create a default object', function() {
        expect(game.create({ table: 4,
                             p1: { name: 'toto' },
                             p2: { name: 'titi' } }))
          .toEqual({
            table: 4,
            victory: null,
            p1: { name: 'toto', list: null,
                  tournament: null, control: null, army: null, custom_field: null },
            p2: { name: 'titi', list: null,
                  tournament: null, control: null, army: null, custom_field: null },
            games: []
          });
      });
    });

    describe('player(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s info for <name>', function() {
        expect(game.player(this.game, 'toto')).toBe(this.game.p1);
        expect(game.player(this.game, 'titi')).toBe(this.game.p2);
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
        this.game.p1.list = 'caster1';
        this.game.p2.list = 'caster2';
      });

      it('should return player\'s list', function() {
        expect(game.listForPlayer(this.game, 'toto')).toBe('caster1');
        expect(game.listForPlayer(this.game, 'titi')).toBe('caster2');
      });
    });

    describe('forPlayer(<name>)', function() {
      when('<game> involves player', function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      }, function() {
        it('should return <game>', function() {
          expect(game.forPlayer(this.game, 'toto')).toBe(this.game);
          expect(game.forPlayer(this.game, 'titi')).toBe(this.game);

          expect(game.forPlayer(this.game, 'tata')).toBe(undefined);
        });
      });

      when('<game>\'s sub-games involves player', function() {
        var g  = game.create({ table: 4,
                               p1: { name: 'toto' },
                               p2: { name: 'titi' } });
        _.range(3).map(function(i) {
          g.games.push(game.create({ table: i+1,
                                     p1: { name: 'p'+(i+1) },
                                     p2: { name: 'p'+(i+3) } }));
        });
        this.game = g;
      }, function() {
        it('should return <game>\'s sub-game for this player', function() {
          expect(game.forPlayer(this.game, 'p1')).toBe(this.game.games[0]);
          expect(game.forPlayer(this.game, 'p5')).toBe(this.game.games[2]);

          expect(game.forPlayer(this.game, 'tata')).toBe(undefined);
        });
      });
    });

    describe('tableForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s list', function() {
        expect(game.tableForPlayer(this.game, 'toto')).toBe(4);
        expect(game.tableForPlayer(this.game, 'titi')).toBe(4);
      });
    });

    describe('opponentForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      it('should return player\'s list', function() {
        expect(game.opponentForPlayer(this.game, 'toto')).toBe('titi');
        expect(game.opponentForPlayer(this.game, 'titi')).toBe('toto');
      });
    });

    describe('hasResult()', function() {
      using([
        [ 'p1' , 'p2' , 'hasResult' ],
        [ null , null , false       ],
        [ 1    , null , false       ],
        [ null , 1    , false       ],
        [ 1    , 0    , true        ],
      ], function(e, d) {
        it('should check whether the game result is defined, '+d, function() {
          var g = game.create();
          g.p1.tournament = e.p1;
          g.p2.tournament = e.p2;
          expect(game.hasResult(g)).toBe(e.hasResult);
        });
      });
    });

    describe('winForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.winForPlayer(this.game, 'toto')).toBe(undefined);
          expect(game.winForPlayer(this.game, 'titi')).toBe(undefined);
        });
      });

      when('result is defined', function() {
        this.game.p1.tournament = 1;
        this.game.p2.tournament = 0;
      }, function() {
        it('should return whether <name> has won', function() {
          expect(game.winForPlayer(this.game, 'toto')).toBe(true);
          expect(game.winForPlayer(this.game, 'titi')).toBe(false);
        });
      });
    });

    describe('lossForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.lossForPlayer(this.game, 'toto')).toBe(undefined);
          expect(game.lossForPlayer(this.game, 'titi')).toBe(undefined);
        });
      });

      when('result is defined', function() {
        this.game.p1.tournament = 1;
        this.game.p2.tournament = 0;
      }, function() {
        it('should return whether <name> has won', function() {
          expect(game.lossForPlayer(this.game, 'toto')).toBe(false);
          expect(game.lossForPlayer(this.game, 'titi')).toBe(true);
        });
      });
    });

    describe('isValid()', function() {
      using([
        [ 'p1' , 'p2' , 'isValid' ],
        [ null , null , false     ],
        [ 'p1' , null , false     ],
        [ null , 'p2' , false     ],
        [ 'p1' , 'p2' , true      ],
      ], function(e, d) {
        it('should check whether both players are defined, '+d, function() {
          expect(game.isValid(game.create({ table: 3,
                                            p1: { name: e.p1 },
                                            p2: { name: e.p2 } }))).toBe(e.isValid);
        });
      });
    });

    describe('isAssassination()', function() {
      using([
        [ 'victory'       , 'isAssassination' ],
        [ null            , false ],
        [ 'assassination' , true  ],
        [ 'other'         , false ],
      ], function(e, d) {
        it('should check whether both players are defined, '+d, function() {
          expect(game.isAssassination(game.create({ table: 3,
                                                    victory: e.victory,
                                                    p1: { name: e.p1 },
                                                    p2: { name: e.p2 } })))
            .toBe(e.isAssassination);
        });
      });
    });

    describe('winner()', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.winner(this.game)).toBe(undefined);
        });
      });

      when('result is defined', function() {
      }, function() {
        using([
          [ 'p1_tp' , 'p2_tp' , 'winner' ],
          [ 1       , 0       , 'toto'   ],
          [ 0       , 1       , 'titi'   ],
        ], function(e, d) {
          it('should return the winner\'s name, '+d, function() {
            this.game.p1.tournament = e.p1_tp;
            this.game.p2.tournament = e.p2_tp;
            expect(game.winner(this.game)).toBe(e.winner);
          });
        });
      });
    });

    describe('loser()', function() {
      beforeEach(function() {
        this.game = game.create({ table: 4,
                                  p1: { name: 'toto' },
                                  p2: { name: 'titi' } });
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.loser(this.game)).toBe(undefined);
        });
      });

      when('result is defined', function() {
      }, function() {
        using([
          [ 'p1_tp' , 'p2_tp' , 'loser' ],
          [ 1       , 0       , 'titi'  ],
          [ 0       , 1       , 'toto'  ],
        ], function(e, d) {
          it('should return the loser\'s name, '+d, function() {
            this.game.p1.tournament = e.p1_tp;
            this.game.p2.tournament = e.p2_tp;
            expect(game.loser(this.game)).toBe(e.loser);
          });
        });
      });
    });

    describe('toArray()', function() {
      using([
        [ 'withCustom', 'ck'  , 'array' ],
        [ false       , true  , [ 21, 'toto', 'titi', 'list1', 'list2', 1, 0, 2, 4, 3, 5, 1 ] ],
        [ true        , false , [ 21, 'toto', 'titi', 'list1', 'list2', 1, 0, 2, 4, 3, 5, 0, 42, 24 ] ],
      ], function(e, d) {
        it('should convert game to array, '+d, function() {
          expect(game.toArray({
            table: 21,
            victory: e.ck ? 'assassination' : null,
            p1: { name: 'toto', list: 'list1', tournament: 1,
                  control: 2, army: 3, custom_field: 42 },
            p2: { name: 'titi', list: 'list2', tournament: 0,
                  control: 4, army: 5, custom_field: 24 },
            games: []
          }, e.withCustom)).toEqual(e.array);
        });
      });
    });
  });

});
