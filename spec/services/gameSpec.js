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

    describe('create(<table>, <p1_name>, <p2_name>', function() {
      it('should create a default object', function() {
        expect(game.create(4, 'toto', 'titi'))
          .toEqual({
            table: 4,
            p1: { name: 'toto', list: null, tournament: null, control: null, army: null },
            p2: { name: 'titi', list: null, tournament: null, control: null, army: null },
            games: []
          });
      });
    });

    describe('player(<name>)', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
      });

      it('should return player\'s info for <name>', function() {
        expect(game.player(this.game, 'toto')).toBe(this.game.p1);
        expect(game.player(this.game, 'titi')).toBe(this.game.p2);
      });
    });

    describe('listForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
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
        this.game = game.create(4, 'toto', 'titi');
      }, function() {
        it('should return <game>', function() {
          expect(game.forPlayer(this.game, 'toto')).toBe(this.game);
          expect(game.forPlayer(this.game, 'titi')).toBe(this.game);

          expect(game.forPlayer(this.game, 'tata')).toBe(undefined);
        });
      });

      when('<game>\'s sub-games involves player', function() {
        var g = game.create(4, 'toto', 'titi');
        _.range(3).map(function(i) {
          g.games.push(game.create(i+1, 'p'+(i+1), 'p'+(i+3)));
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
        this.game = game.create(4, 'toto', 'titi');
      });

      it('should return player\'s list', function() {
        expect(game.tableForPlayer(this.game, 'toto')).toBe(4);
        expect(game.tableForPlayer(this.game, 'titi')).toBe(4);
      });
    });

    describe('opponentForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
      });

      it('should return player\'s list', function() {
        expect(game.opponentForPlayer(this.game, 'toto')).toBe('titi');
        expect(game.opponentForPlayer(this.game, 'titi')).toBe('toto');
      });
    });

    describe('winForPlayer(<name>)', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
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

    describe('isValid()', function() {
      it('should check whether both players are defined', function() {
        expect(game.isValid(game.create(3, null, null))).toBe(false);
        expect(game.isValid(game.create(3, 'p1', null))).toBe(false);
        expect(game.isValid(game.create(3, null, 'p2'))).toBe(false);
        expect(game.isValid(game.create(3, 'p1', 'p2'))).toBe(true);
      });
    });

    describe('winner()', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.winner(this.game)).toBe(undefined);
        });
      });

      when('result is defined', function() {
      }, function() {
        it('should return the winner\'s name', function() {
          this.game.p1.tournament = 1;
          this.game.p2.tournament = 0;
          expect(game.winner(this.game)).toBe('toto');

          this.game.p1.tournament = 0;
          this.game.p2.tournament = 1;
          expect(game.winner(this.game)).toBe('titi');
        });
      });
    });

    describe('loser()', function() {
      beforeEach(function() {
        this.game = game.create(4, 'toto', 'titi');
      });

      when('result is not defined', function(){
      }, function() {
        it('should return undefined', function() {
          expect(game.loser(this.game)).toBe(undefined);
        });
      });

      when('result is defined', function() {
      }, function() {
        it('should return the loser\'s name', function() {
          this.game.p1.tournament = 1;
          this.game.p2.tournament = 0;
          expect(game.loser(this.game)).toBe('titi');

          this.game.p1.tournament = 0;
          this.game.p2.tournament = 1;
          expect(game.loser(this.game)).toBe('toto');
        });
      });
    });
  });

});
