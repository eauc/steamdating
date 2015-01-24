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

    describe('tableRangeForGroup(<players>, <group>)', function() {
      beforeEach(function() {
        this.players = [
          [ {},{},{},{} ],
          [ {},{} ],
          [ ],
          [ {},{},{} ],
          [ {},{} ]
        ];
      });

      using([
        [ 'group' , 'range'  ],
        [ 0       , [ 1, 2 ] ],
        [ 1       , [ 3 ]    ],
        [ 2       , [ ]      ],
        [ 3       , [ 4, 5 ] ],
        [ 4       , [ 6 ]    ],
      ], function(e, d) {
        it('should calculate table range for <group>, '+d, function() {
          expect(basePairing.tableRangeForGroup(this.players, e.group)).toEqual(e.range);
        });
      });
    });

    describe('suggestTableFor(<rounds>, <availables>, <p1>, <p2>)', function() {
      beforeEach(inject(function(rounds) {
        this.roundsService = spyOnService('rounds');
        this.dummy_rounds = [ 'rounds' ];
        this.availables = [ 1, 3, 4, 6 ];
        var played_tables = {
          'p1': [ 1, 4 ],
          'p2': [ 3, 4 ]
        };
        this.roundsService.tablesForPlayer.and.callFake(function(rs, p) {
          return played_tables[p];
        });
      }));

      it('should retrieve tables played on by both players', function() {
        this.suggest = basePairing
          .suggestTableFor(this.dummy_rounds, this.availables, 'p1', 'p2');

        expect(this.roundsService.tablesForPlayer)
          .toHaveBeenCalledWith(this.dummy_rounds, 'p1');
        expect(this.roundsService.tablesForPlayer)
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
