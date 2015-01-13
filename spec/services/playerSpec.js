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
      it('should test if player is <name>', function() {
        expect(player.is({ name: 'tata' }, 'other')).toBe(false);
        expect(player.is({ name: 'same' }, 'same')).toBe(true);
      });
    });

    describe('updateListsPlayed(<rounds>)', function() {
      beforeEach(inject(function(rounds) {
        this.rounds = rounds;
        this.dummy_lists = [ 'toto' ];
        spyOn(rounds, 'listsForPlayer').and.returnValue(this.dummy_lists);
      }));

      it('should update lists played in <rounds>', function() {
        var p = player.create('toto');
        var dummy_rounds = [ 'tata' ];

        expect(player.updateListsPlayed(p, dummy_rounds).lists_played)
          .toBe(this.dummy_lists);
        expect(this.rounds.listsForPlayer).toHaveBeenCalledWith(dummy_rounds, 'toto');
      });
    });

    describe('allListsHaveBeenPlayed()', function() {
      it('should return whether player has played all his lists', function() {
        expect(player.allListsHaveBeenPlayed({
          lists: [],
          lists_played: []
        })).toBe(true);
        expect(player.allListsHaveBeenPlayed({
          lists: [ { caster: '1' }, { caster: '2' } ],
          lists_played: [ '2' ]
        })).toBe(false);
        expect(player.allListsHaveBeenPlayed({
          lists: [ { caster: '1' }, { caster: '2' } ],
          lists_played: [ '2', '1' ]
        })).toBe(true);
      });
    });

    describe('rank(<critFn>)', function() {
      beforeEach(function() {
        this.critFn = jasmine.createSpy('critFn');
        this.dummy_player = {
          points: {
            tournament: 42,
            sos: 71,
            control: 69,
            army: 83
          }
        };
      });

      it('should call <critFn> with player\'s points', function() {
        player.rank(this.dummy_player, this.critFn);

        expect(this.critFn).toHaveBeenCalledWith(42, 71, 69, 83);
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
  });

});
