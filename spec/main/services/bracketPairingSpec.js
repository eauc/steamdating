'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('bracketPairing', function() {

    var bracketPairing;
    
    beforeEach(inject([
      'bracketPairing',
      function(_bracketPairing, basePairing) {
        bracketPairing = _bracketPairing;

        this.stateService = spyOnService('state');
        this.playersService = spyOnService('players');
        this.basePairingService = spyOnService('basePairing');
      }
    ]));

    describe('indices(<n>)', function() {
      using([
        [ 'nb_players' , 'indices'                 ],
        [ 2            , [[1,2]]                   ],
        [ 4            , [[1,4],[3,2]]             ],
        [ 8            , [[1,8],[5,4],[3,6],[7,2]] ],
      ], function(e, d) {
        it('should compute indices pairs to start bracket, '+d, function() {
          expect(bracketPairing.indices(e.nb_players)).toEqual(e.indices);
        });
      });
    });

    describe('suggestFirstSingleRound(<state>, <group_index>)', function() {
      beforeEach(function() {
        var ctxt = this;

        this.tables = [42,43,44,45];
        this.playersService.tableRangeForGroup._retVal = this.tables;

        var tables_i = 0;
        this.basePairingService.suggestTableFor.and
          .callFake(function() { return ctxt.tables[tables_i++]; });

        this.state = {
          rounds: ['rounds'],
          players: [ 'players' ],
          tables_groups_size: 4
        };

        this.not_droped_players = [ [], ['group1'], [] ];
        this.stateService.playersNotDropedInLastRound._retVal = this.not_droped_players;
        
        this.gri = 1;
        this.sorted_players = [
          { rank: 1, players: [{ name: 'p1' }, { name: 'p2' }, { name: 'p3' }, { name: 'p4' }] },
          { rank: 2, players: [{ name: 'p5' }, { name: 'p6' }, { name: 'p7' }, { name: 'p8' }] },
        ];
        this.playersService.sortGroup._retVal = this.sorted_players;

        this.res = bracketPairing.suggestFirstSingleRound(this.state, this.gri);
      });

      it('should request undroped players', function() {
        expect(this.stateService.playersNotDropedInLastRound)
          .toHaveBeenCalledWith(this.state);
      });

      it('should request table range for group', function() {
        expect(this.playersService.tableRangeForGroup)
          .toHaveBeenCalledWith(this.not_droped_players, this.gri);
      });

      it('should request table suggestions for each pairing', function() {
        expect(this.basePairingService.suggestTableFor)
          .toHaveBeenCalledWith(this.state.rounds,
                                this.tables,
                                jasmine.any(String),
                                jasmine.any(String),
                                this.state.tables_groups_size);
        expect(this.basePairingService.suggestTableFor.calls.count())
          .toBe(4);
      });

      it('should sort group using SR criterion', function() {
        expect(this.playersService.sortGroup)
          .toHaveBeenCalledWith(this.not_droped_players[this.gri], this.state, false);
      });

      using([
        [ 'game' , 'table' , 'p1' , 'p2' ],
        [ 0      , 42      , 'p1' , 'p8' ],
        [ 1      , 43      , 'p5' , 'p4' ],
        [ 2      , 44      , 'p3' , 'p6' ],
        [ 3      , 45      , 'p7' , 'p2' ],
      ], function(e, d) {
        it('should create games with correct pairing, '+d, function() {
          expect(this.res[e.game].table).toBe(e.table);
          expect(this.res[e.game].p1.name).toBe(e.p1);
          expect(this.res[e.game].p2.name).toBe(e.p2);
        });
      });
    });

    describe('suggestNextSingleRound(<state>, <group_index>)', function() {
      beforeEach(function() {
        var ctxt = this;

        this.nb_rounds = 1;
        this.stateService.bracketNbRounds.and.callFake(function() {
          return ctxt.nb_rounds;
        });
        this.roundService = spyOnService('round');
        this.roundService.winners.and.callThrough();
        this.roundService.losers.and.callThrough();

        this.tables = [42,43,44,45];
        this.playersService.tableRangeForGroup._retVal = this.tables;
        this.tables_i = 0;
        this.basePairingService.suggestTableFor.and
          .callFake(function() { return ctxt.tables[ctxt.tables_i++]; });

        this.st = {
          players: ['players'],
          rounds: [ [], [], ['last_round'] ],
          tables_groups_size: 4
        };

        this.not_droped_players = [ [], ['p1','p2','p3','p4','p5','p6','p7','p8'], [] ];
        this.stateService.playersNotDropedInLastRound._retVal = this.not_droped_players;

        this.gri = 1;
        this.games = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p8', tournament: 0 } },
          { p1: { name: 'p5', tournament: 0 }, p2: { name: 'p4', tournament: 1 } },
          { p1: { name: 'p3', tournament: 1 }, p2: { name: 'p6', tournament: 0 } },
          { p1: { name: 'p7', tournament: 0 }, p2: { name: 'p2', tournament: 1 } },
        ];
        this.roundService.gamesForGroup._retVal = this.games;
      });

      it('should request undroped players', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.stateService.playersNotDropedInLastRound)
          .toHaveBeenCalledWith(this.st);
      });

      it('should request table range for group', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.playersService.tableRangeForGroup)
          .toHaveBeenCalledWith(this.not_droped_players, this.gri);
      });

      it('should request last round\'s game for group', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.roundService.gamesForGroup)
          .toHaveBeenCalledWith(['last_round'], this.not_droped_players, this.gri);
      });

      it('should request table suggestions for each pairing', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.basePairingService.suggestTableFor)
          .toHaveBeenCalledWith(this.st.rounds,
                                this.tables,
                                jasmine.any(String),
                                jasmine.any(String),
                                this.st.tables_groups_size);
        expect(this.basePairingService.suggestTableFor.calls.count())
          .toBe(4);
      });

      using([
        [ 'nb_rounds' , 'game' , 'table' , 'p1' , 'p2' ],
        [ 1           , 0      , 42      , 'p1' , 'p4' ],
        [ 1           , 1      , 43      , 'p3' , 'p2' ],
        [ 1           , 2      , 44      , 'p8' , 'p5' ],
        [ 1           , 3      , 45      , 'p6' , 'p7' ],
        [ 2           , 0      , 42      , 'p1' , 'p4' ],
        [ 2           , 1      , 43      , 'p8' , 'p5' ],
        [ 2           , 2      , 44      , 'p3' , 'p2' ],
        [ 2           , 3      , 45      , 'p6' , 'p7' ],
      ], function(e, d) {
        it('should create games with correct pairing, '+d, function() {
          this.tables_i = 0;
          this.nb_rounds = e.nb_rounds;
          this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

          expect(this.res[e.game].table).toBe(e.table);
          expect(this.res[e.game].p1.name).toBe(e.p1);
          expect(this.res[e.game].p2.name).toBe(e.p2);
        });
      });
    });

    describe('suggestRound(<state>, <group_index>)', function() {
      beforeEach(function() {
        spyOn(bracketPairing, 'suggestFirstSingleRound').and.returnValue('first');
        spyOn(bracketPairing, 'suggestNextSingleRound').and.returnValue('next');

        this.st = [ 'state' ];
        this.gri = 4;
      });

      when('bracket is in first round', function() {
        this.stateService.bracketNbRounds.and.returnValue(0);
      }, function() {
        it('should call suggestFirstSingleRound()', function() {
          bracketPairing.suggestRound(this.st, this.gri);

          expect(bracketPairing.suggestFirstSingleRound)
            .toHaveBeenCalledWith(this.st, this. gri);
        });
      });

      when('bracket is not in first round', function() {
        this.stateService.bracketNbRounds.and.returnValue(3);
      }, function() {
        it('should call suggestFirstSingleRound()', function() {
          bracketPairing.suggestRound(this.st, this.gri);

          expect(bracketPairing.suggestNextSingleRound)
            .toHaveBeenCalledWith(this.st, this. gri);
        });
      });
    });
  });

});
