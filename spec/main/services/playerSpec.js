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
        [ 'same'   , 'same'  , true  ],
        [ 'tata'   , null    , false ],
      ], function(e, d) {
        it('should test if player is <name>, '+d, function() {
          expect(player.is(e.name, { name: e.player })).toBe(e.is);
        });
      });
    });

    describe('hasMembers()', function() {
      using([
        [ 'player'                , 'has' ],
        [ { name: 'tata' }        , false ],
        [ { members: [] }         , false ],
        [ { members: [ {}, {} ] } , true  ],
      ], function(e, d) {
        it('should test if player has members, '+d, function() {
          expect(player.hasMembers(e.player))
            .toBe(e.has);
        });
      });
    });

    describe('members()', function() {
      using([
        [ 'player'                , 'members' ],
        [ { name: 'tata' }        , []        ],
        [ { members: [] }         , []        ],
        [ { members: [ {}, {} ] } , [ {}, {} ] ],
      ], function(e, d) {
        it('should return player\'s members, '+d, function() {
          expect(player.members(e.player))
            .toEqual(e.members);
        });
      });
    });

    describe('addMember(<member>)', function() {
      using([
        [ 'player'                , 'members' ],
        [ { name: 'tata' }        , [ { name: 'member' } ]         ],
        [ { members: [] }         , [ { name: 'member' } ]         ],
        [ { members: [ {}, {} ] } , [ {}, {}, { name: 'member' } ] ],
      ], function(e, d) {
        it('should add <member> to player\'s members, '+d, function() {
          this.ret = player.addMember({ name: 'member' }, e.player);
          
          expect(player.members(this.ret))
            .toEqual(e.members);
        });
      });
    });

    describe('dropMember(<member>)', function() {
      using([
        [ 'player'                , 'members' ],
        [ { name: 'tata' }        , []         ],
        [ { members: [] }         , []         ],
        [ { members: [ { name: 'member' } ] } , [] ],
        [ { members: [ { name: 'member' },
                       { name: 'other' } ] } , [ { name: 'other' } ] ],
        [ { members: [ { name: 'other' } ] } , [ { name: 'other' } ] ],
      ], function(e, d) {
        it('should add <member> to player\'s members, '+d, function() {
          this.ret = player.dropMember({ name: 'member' }, e.player);
          
          expect(player.members(this.ret))
            .toEqual(e.members);
        });
      });
    });

    describe('updateListsPlayed(<rounds>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
      });

      it('should update lists played in <rounds>', function() {
        var p = player.create({ name: 'toto', members: [ { name: 'member1' },
                                                         { name: 'member2' } ] });
        var dummy_rounds = [ 'tata' ];

        var ret = player.updateListsPlayed(dummy_rounds, p);

        expect(ret.lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(this.roundsService.listsForPlayer)
          .toHaveBeenCalledWith('toto', dummy_rounds);

        expect(ret.members[0].lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(this.roundsService.listsForPlayer)
          .toHaveBeenCalledWith('member1', dummy_rounds);
        expect(ret.members[1].lists_played)
          .toBe('rounds.listsForPlayer.returnValue');
        expect(this.roundsService.listsForPlayer)
          .toHaveBeenCalledWith('member2', dummy_rounds);
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
            team_tournament: 31,
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

        expect(this.critFn).toHaveBeenCalledWith(21, 31, 42, 71, 69, 83, 32, 27);
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

    describe('updatePoints(<rounds>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
      });

      it('should update points gained in <rounds>', function() {
        var p = player.create({ name: 'toto' });
        var dummy_rounds = [ 'tata' ];

        expect(player.updatePoints(dummy_rounds, p).points)
          .toBe('rounds.pointsForPlayer.returnValue');
        expect(this.roundsService.pointsForPlayer)
          .toHaveBeenCalledWith('toto', dummy_rounds);
      });

      when('player has members', function() {
      }, function() {
        it('should update points gained in <rounds> by members', function() {
          var p = player.create({ name: 'toto' });
          p.members = [
            player.create({ name: 'member1' }),
            player.create({ name: 'member2' }),
          ];
          var dummy_rounds = [ 'tata' ];

          player.updatePoints(dummy_rounds, p);

          expect(this.roundsService.pointsForPlayer)
            .toHaveBeenCalledWith('member1', dummy_rounds);
          expect(this.roundsService.pointsForPlayer)
            .toHaveBeenCalledWith('member2', dummy_rounds);
        });
      });
    });

    when('updateSoS(<sosFromPlayers>, <rounds>, <players>)', function() {
      this.ret = player.updateSoS(this.sosFromPlayers, this.rounds,
                                  this.players, this.player);
    }, function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
        this.sosFromPlayers = jasmine.createSpy('sosFromPlayers')
          .and.returnValue('sosFromPlayers.returnValue');
        this.rounds = 'rounds';
        this.players = 'players';
        this.player = player.create({ name: 'player' });
      });

      it('should fetch player\'s opponents', function() {
        expect(this.roundsService.opponentsForPlayer)
          .toHaveBeenCalledWith('player', 'rounds');
      });

      it('should set sos from opponents', function() {
        expect(this.sosFromPlayers)
          .toHaveBeenCalledWith('rounds.opponentsForPlayer.returnValue',
                                'tournament', 'players');
        expect(this.ret.points.sos)
          .toBe('sosFromPlayers.returnValue');
      });

      when('player has members', function() {
        this.player.members = [
          player.create({ name: 'member1' }),
          player.create({ name: 'member2' }),
        ];
      }, function() {
        it('should set sos for members', function() {
          expect(this.roundsService.opponentsForPlayer)
            .toHaveBeenCalledWith('member1', 'rounds');
          expect(this.roundsService.opponentsForPlayer)
            .toHaveBeenCalledWith('member2', 'rounds');

          expect(this.ret.members[0].points.sos)
            .toBe('sosFromPlayers.returnValue');
          expect(this.ret.members[1].points.sos)
            .toBe('sosFromPlayers.returnValue');
        });
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
