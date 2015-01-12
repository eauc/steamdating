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

  });

});
