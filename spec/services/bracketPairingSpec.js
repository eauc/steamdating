'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('bracketPairing', function() {

    var bracketPairing;
    
    beforeEach(inject([
      'bracketPairing',
      'basePairing',
      function(_bracketPairing, basePairing) {
        bracketPairing = _bracketPairing;

        this.basePairing = basePairing;
        spyOn(this.basePairing, 'tableRangeForGroup');
        spyOn(this.basePairing, 'suggestTableFor');
      }
    ]));

    describe('indices(<n>)', function() {
      it('should compute indices pair to start bracket', function() {
        expect(bracketPairing.indices(2)).toEqual([[1,2]]);
        expect(bracketPairing.indices(4)).toEqual([[1,4],[3,2]]);
        expect(bracketPairing.indices(8)).toEqual([[1,8],[5,4],[3,6],[7,2]]);
      });
    });

    describe('suggestFirstSingleRound(<state>, <group_index>)', function() {
      beforeEach(inject(function(players) {
        var ctxt = this;

        this.players = players;
        spyOn(this.players, 'sortGroup');

        this.tables = [42,43,44,45];
        this.basePairing.tableRangeForGroup.and.returnValue(this.tables);
        var tables_i = 0;
        this.basePairing.suggestTableFor.and
          .callFake(function() { return ctxt.tables[tables_i++]; });

        this.state = {
          players: [ [], ['group1'], [] ]
        };
        this.gri = 1;
        this.sorted_players = [
          { name: 'p1' }, { name: 'p2' }, { name: 'p3' }, { name: 'p4' },
          { name: 'p5' }, { name: 'p6' }, { name: 'p7' }, { name: 'p8' },
        ];
        this.players.sortGroup.and.returnValue(this.sorted_players);

        this.res = bracketPairing.suggestFirstSingleRound(this.state, this.gri);
      }));

      it('should request table range for group', function() {
        expect(this.basePairing.tableRangeForGroup)
          .toHaveBeenCalledWith(this.state.players, this.gri);
      });

      it('should sort group using SR criterion', function() {
        expect(this.players.sortGroup)
          .toHaveBeenCalledWith(this.state.players[this.gri], this.state, false);
      });

      it('should create games with correct pairing', function() {
        expect(this.res[0].table).toBe(42);
        expect(this.res[0].p1.name).toBe('p1');
        expect(this.res[0].p2.name).toBe('p8');

        expect(this.res[1].table).toBe(43);
        expect(this.res[1].p1.name).toBe('p5');
        expect(this.res[1].p2.name).toBe('p4');

        expect(this.res[2].table).toBe(44);
        expect(this.res[2].p1.name).toBe('p3');
        expect(this.res[2].p2.name).toBe('p6');

        expect(this.res[3].table).toBe(45);
        expect(this.res[3].p1.name).toBe('p7');
        expect(this.res[3].p2.name).toBe('p2');
      });
    });

    describe('suggestNextSingleRound(<state>, <group_index>)', function() {
      beforeEach(inject(function(state, round) {
        var ctxt = this;

        this.state = state;
        this.nb_rounds = 1;
        spyOn(this.state, 'bracketNbRounds').and.callFake(function() {
          return ctxt.nb_rounds;
        });
        this.round = round;
        spyOn(this.round, 'gamesForGroup');

        this.tables = [42,43,44,45];
        this.basePairing.tableRangeForGroup.and.returnValue(this.tables);
        this.tables_i = 0;
        this.basePairing.suggestTableFor.and
          .callFake(function() { return ctxt.tables[ctxt.tables_i++]; });

        this.st = {
          players: [ [], ['p1','p2','p3','p4','p5','p6','p7','p8'], [] ],
          rounds: [ [], [], ['last_round'] ]
        };
        this.gri = 1;
        this.games = [
          { p1: { name: 'p1', tournament: 1 }, p2: { name: 'p8', tournament: 0 } },
          { p1: { name: 'p5', tournament: 0 }, p2: { name: 'p4', tournament: 1 } },
          { p1: { name: 'p3', tournament: 1 }, p2: { name: 'p6', tournament: 0 } },
          { p1: { name: 'p7', tournament: 0 }, p2: { name: 'p2', tournament: 1 } },
        ];
        this.round.gamesForGroup.and.returnValue(this.games);
      }));

      it('should request table range for group', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.basePairing.tableRangeForGroup)
          .toHaveBeenCalledWith(this.st.players, this.gri);
      });

      it('should request last round\'s game for group', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.round.gamesForGroup)
          .toHaveBeenCalledWith(['last_round'], this.st.players, this.gri);
      });

      it('should create games with correct pairing', function() {
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.res[0].table).toBe(42);
        expect(this.res[0].p1.name).toBe('p1');
        expect(this.res[0].p2.name).toBe('p4');

        expect(this.res[1].table).toBe(43);
        expect(this.res[1].p1.name).toBe('p3');
        expect(this.res[1].p2.name).toBe('p2');

        expect(this.res[2].table).toBe(44);
        expect(this.res[2].p1.name).toBe('p8');
        expect(this.res[2].p2.name).toBe('p5');

        expect(this.res[3].table).toBe(45);
        expect(this.res[3].p1.name).toBe('p6');
        expect(this.res[3].p2.name).toBe('p7');

        this.tables_i = 0;
        this.nb_rounds = 2;
        this.res = bracketPairing.suggestNextSingleRound(this.st, this.gri);

        expect(this.res[0].table).toBe(42);
        expect(this.res[0].p1.name).toBe('p1');
        expect(this.res[0].p2.name).toBe('p4');

        expect(this.res[1].table).toBe(43);
        expect(this.res[1].p1.name).toBe('p8');
        expect(this.res[1].p2.name).toBe('p5');

        expect(this.res[2].table).toBe(44);
        expect(this.res[2].p1.name).toBe('p3');
        expect(this.res[2].p2.name).toBe('p2');

        expect(this.res[3].table).toBe(45);
        expect(this.res[3].p1.name).toBe('p6');
        expect(this.res[3].p2.name).toBe('p7');
      });
    });

    describe('suggestRound(<state>, <group_index>)', function() {
      beforeEach(inject(function(state) {
        this.state = state;
        spyOn(this.state, 'bracketNbRounds');

        spyOn(bracketPairing, 'suggestFirstSingleRound').and.returnValue('first');
        spyOn(bracketPairing, 'suggestNextSingleRound').and.returnValue('next');

        this.st = [ 'state' ];
        this.gri = 4;
      }));

      when('bracket is in first round', function() {
        this.state.bracketNbRounds.and.returnValue(0);
      }, function() {
        it('should call suggestFirstSingleRound()', function() {
          bracketPairing.suggestRound(this.st, this.gri);

          expect(bracketPairing.suggestFirstSingleRound)
            .toHaveBeenCalledWith(this.st, this. gri);
        });
      });

      when('bracket is not in first round', function() {
        this.state.bracketNbRounds.and.returnValue(3);
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
