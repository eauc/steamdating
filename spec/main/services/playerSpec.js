'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('player', function() {

    var player;

    beforeEach(inject([ 'player', function(_player) {
      player = _player;
    }]));

    describe('is(<name>)', function() {
      using([
        [ 'player' , 'name'  , 'is'  ],
        [ 'tata'   , 'other' , false ],
        [ 'same'   , 'same'  , true ],
        [ 'tata'   , null    , false ],
      ], function(e, d) {
        it('should test if player is <name>, '+d, function() {
          expect(player.is({ name: e.player }, e.name)).toBe(e.is);
        });
      });
    });

    describe('updateListsPlayed(<rounds>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
      });

      it('should update lists played in <rounds>', function() {
        var p = player.create({ name: 'toto' });
        var dummy_rounds = [ 'tata' ];

        expect(player.updateListsPlayed(p, dummy_rounds).lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(this.roundsService.listsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'toto');
      });
    });

    describe('allListsHaveBeenPlayed()', function() {
      using([
        [ 'lists' , 'played' , 'all' ],
        [ [], [], true ],
        [ [ { caster: '1' }, { caster: '2' } ] , [ '2' ] , false ],
        [ [ { caster: '1' }, { caster: '2' } ] , [ '2', '1' ] , true ],
      ], function(e, d) {
        it('should return whether player has played all his lists, '+d, function() {
          expect(player.allListsHaveBeenPlayed({
            lists: e.lists,
            lists_played: e.played
          })).toBe(e.all);
        });
      });
    });

    describe('rank(<critFn>)', function() {
      beforeEach(function() {
        this.critFn = jasmine.createSpy('critFn');
        this.dummy_player = {
          custom_field: 21,
          points: {
            tournament: 42,
            sos: 71,
            control: 69,
            army: 83,
            assassination: 32,
            custom_field: 27,
          }
        };
      });

      it('should call <critFn> with player\'s points', function() {
        player.rank(this.dummy_player, this.critFn);

        expect(this.critFn).toHaveBeenCalledWith(21, 42, 71, 69, 83, 32, 27);
      });

      when('critFn return without error', function() {
        this.critFn.and.returnValue(2015);
      }, function() {
        it('should return the result of critFn', function() {
          var result = player.rank(this.dummy_player, this.critFn);

          expect(result).toBe(2015);
        });
      });        

      when('critFn throws an error', function() {
        this.critFn.and.callFake(function() { throw new Error('blah'); });
      }, function() {
        it('should return the error message', function() {
          var result = player.rank(this.dummy_player, this.critFn);

          expect(result).toBe('Error : blah');
        });
      });        
    });

    describe('updatePoints(<rounds>, <bracket_start>, <bracket_weight>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
      });

      it('should update points gained in <rounds>', function() {
        var p = player.create({ name: 'toto' });
        var dummy_rounds = [ 'tata' ];
        var bracket_start = 8;
        var bracket_weight = 42;

        expect(player.updatePoints(p, dummy_rounds, bracket_start, bracket_weight).points)
          .toBe('rounds.pointsForPlayer.returnValue');
        expect(this.roundsService.pointsForPlayer)
          .toHaveBeenCalledWith(dummy_rounds, 'toto', 8, 42);
      });
    });
  });

});
