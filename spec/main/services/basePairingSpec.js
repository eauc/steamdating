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
      }));

      it('should retrieve tables played on by both players', function() {
        this.suggest = basePairing
          .suggestTableFor(this.dummy_rounds, this.availables, 'p1', 'p2');

        expect(this.roundsService.tablesForPlayer)
          .toHaveBeenCalledWith('p1', this.dummy_rounds);
        expect(this.roundsService.tablesForPlayer)
          .toHaveBeenCalledWith('p2', this.dummy_rounds);
      });

      using([
        [ 'availables'   , 'group_size', 'played'         , 'possibles' ],
        // simplest case : one available table, no group
        // return available table
        [ [ 1, 2, 3, 4 ] , undefined   , { p1: [ 1, 2 ],
                                           p2: [ 1, 3 ] } , [ 4 ]       ],
        // many availables tables, no group
        // pick one available table at random
        [ [ 1, 2, 3, 4 ] , undefined   , { p1: [ 1 ],
                                           p2: [ 3 ] }    , [ 2, 4 ]    ],
        // no available table, no group
        // pick one table at random
        [ [ 1, 2, 3, 4 ] , undefined   , { p1: [ 1, 3 ],
                                           p2: [ 2, 4 ] } , [ 1, 2, 3, 4 ] ],
        // many availables tables, one group available
        // pick one table at random in available group
        [ [ 1, 2, 3, 4, 5, 6 ] , 2   , { p1: [ 1 ],
                                         p2: [ 3 ] }      , [ 5, 6 ]    ],
        // many availables tables, no group available
        // pick one table at random
        [ [ 1, 2, 3, 4, 5, 6 ] , 2   , { p1: [ 1, 3 ],
                                         p2: [ 3, 5 ] }   , [ 2, 4, 6 ] ],
      ], function(e,d) {
        it('should pick a random new table for both players, '+d, function() {
          this.roundsService.tablesForPlayer.and.callFake(function(p, rs) {
            return e.played[p];
          });

          _.times(100, function() {
            var suggest = basePairing.suggestTableFor(['rounds'],
                                                      e.availables,
                                                      'p1', 'p2',
                                                      e.group_size);

            expect(_.indexOf(e.possibles, suggest) >= 0).toBe(true);
          });
        });
      });
    });
  });

});
