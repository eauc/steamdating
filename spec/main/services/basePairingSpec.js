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
        this.availables = [ 1, 3, 4, 5, 6 ];
      }, function() {
        it('should pick a random new table for both players', function() {
          this.suggest = basePairing.suggestTableFor(this.dummy_rounds,
                                                     this.availables,
                                                     'p1', 'p2');

          expect(_.indexOf([5,6], this.suggest) >= 0).toBe(true);
        });
      });

      when('no new table is available', function() {
        this.availables = [ 1, 3, 4 ];
      }, function() {
        it('should pick a random available table', function() {
          this.suggest = basePairing.suggestTableFor(this.dummy_rounds,
                                                     this.availables,
                                                     'p1', 'p2');

          expect(_.indexOf([1,3,4], this.suggest) >= 0).toBe(true);
        });
      });
    });
  });

});
