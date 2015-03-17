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
          expect(player.is(e.name, { name: e.player })).toBe(e.is);
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

        expect(player.updateListsPlayed(dummy_rounds, p).lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(this.roundsService.listsForPlayer)
          .toHaveBeenCalledWith('toto', dummy_rounds);
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
        player.rank(this.critFn, this.dummy_player);

        expect(this.critFn).toHaveBeenCalledWith(21, 42, 71, 69, 83, 32, 27);
      });

      when('critFn return without error', function() {
        this.critFn.and.returnValue(2015);
      }, function() {
        it('should return the result of critFn', function() {
          var result = player.rank(this.critFn, this.dummy_player);

          expect(result).toBe(2015);
        });
      });        

      when('critFn throws an error', function() {
        this.critFn.and.callFake(function() { throw new Error('blah'); });
      }, function() {
        it('should return the error message', function() {
          var result = player.rank(this.critFn, this.dummy_player);

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

        expect(player.updatePoints(bracket_start, bracket_weight, dummy_rounds, p).points)
          .toBe('rounds.pointsForPlayer.returnValue');
        expect(this.roundsService.pointsForPlayer)
          .toHaveBeenCalledWith('toto', 8, 42, dummy_rounds);
      });
    });

    describe('drop(<player>, <after_round>)', function() {
      it('should remember the round after which the player droped', function() {
        var p = { droped: null };
        expect(player.drop(42, p)).toEqual({droped: 42});
      });
    });

    describe('undrop(<player>)', function() {
      it('should reset player\'s drop', function() {
        var p = { droped: 42 };
        expect(player.undrop(p)).toEqual({droped: null});
      });
    });

    describe('hasDropedInRound(<player>, <round_index>)', function() {
      using([
        [ 'droped_after_round' , 'round_index' , 'has_droped' ],
        // player has not droped yet
        [ null                 , 0             , false        ],
        [ null                 , 4             , false        ],
        // round_index = null => check if player has droped in any round
        [ null                 , null          , false        ],
        // player droped at the start
        [ 0                    , 0             , true         ],
        [ 0                    , 1             , true         ],
        [ 0                    , null          , true         ],
        // player droped after some round
        [ 4                    , 0             , false        ],
        [ 4                    , 3             , false        ],
        [ 4                    , 4             , true         ],
        [ 4                    , 6             , true         ],
        [ 4                    , null          , true         ],
      ], function(e, d) {
        it('should check whether player had already droped by <round_index>, '+d, function() {
          expect(player.hasDropedInRound(e.round_index, {droped: e.droped_after_round}))
            .toBe(e.has_droped);
        });
      });
    });

    describe('isDroped(<player>)', function() {
      using([
        [ 'droped_after_round' , 'is_droped' ],
        [ null                 , false       ],
        [ 0                    , true        ],
        [ 4                    , true       ],
      ], function(e, d) {
        it('should check whether player has droped in whole tournament, '+d, function() {
          expect(player.isDroped({droped: e.droped_after_round}))
            .toBe(e.is_droped);
        });
      });
    });
  });

});
