'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('basePairing', function() {

    var basePairing;

    beforeEach(inject([ 'basePairing', function(_basePairing) {
      basePairing = _basePairing;
    }]));

    describe('tableRangeForGroup(<players>, <group_index>)', function() {
      beforeEach(function() {
        this.players = [
          [ {},{},{},{} ],
          [ {},{} ],
          [ ],
          [ {},{},{} ],
          [ {},{} ]
        ];
      });

      it('should calculate table range from groups length', function() {
        expect(basePairing.tableRangeForGroup(this.players, 0)).toEqual([ 1, 2 ]);
        expect(basePairing.tableRangeForGroup(this.players, 1)).toEqual([ 3 ]);
        expect(basePairing.tableRangeForGroup(this.players, 2)).toEqual([]);
        expect(basePairing.tableRangeForGroup(this.players, 3)).toEqual([ 4, 5]);
        expect(basePairing.tableRangeForGroup(this.players, 4)).toEqual([ 6 ]);
      });
    });

    describe('suggestTableFor(<rounds>, <availables>, <p1>, <p2>)', function() {
      beforeEach(inject(function(rounds) {
        this.dummy_rounds = [ 'rounds' ];
        this.rounds = rounds;
        this.availables = [ 1, 3, 4, 6 ];
        var played_tables = {
          'p1': [ 1, 4 ],
          'p2': [ 3, 4 ]
        };
        spyOn(rounds, 'tablesForPlayer').and.callFake(function(rs, p) {
          return played_tables[p];
        });
      }));

      it('should retrieve tables played on by both players', function() {
        this.suggest = basePairing.suggestTableFor(this.dummy_rounds, this.availables, 'p1', 'p2');

        expect(this.rounds.tablesForPlayer)
          .toHaveBeenCalledWith(this.dummy_rounds, 'p1');
        expect(this.rounds.tablesForPlayer)
          .toHaveBeenCalledWith(this.dummy_rounds, 'p2');
      });

      when('a new table is available', function() {
        this.availables = [ 1, 3, 4, 6 ];
      }, function() {
        it('should find first new table for both players', function() {
          this.suggest = basePairing.suggestTableFor(this.dummy_rounds,
                                                     this.availables,
                                                     'p1', 'p2');

          expect(this.suggest).toBe(6);
        });
      });

      when('no new table is available', function() {
        this.availables = [ 1, 3, 4 ];
      }, function() {
        it('should find first available table', function() {
          this.suggest = basePairing.suggestTableFor(this.dummy_rounds,
                                                     this.availables,
                                                     'p1', 'p2');

          expect(this.suggest).toBe(1);
        });
      });
    });
  });

});
