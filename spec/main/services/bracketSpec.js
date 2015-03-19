'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('bracket', function() {

    var bracket;

    beforeEach(inject([ 'bracket', function(_bracket) {
      bracket = _bracket;
    }]));

    describe('clear(<length>)', function() {
      it('should clear all brackets', function() {
        expect(bracket.clear(3, [ 1, 2]))
          .toEqual([undefined, undefined, undefined]);
      });
    });

    describe('setLength(<length>)', function() {
      when('bracket is longer than <length>', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should return bracket', function() {
          expect(bracket.setLength(1, this.coll))
            .toEqual(this.coll);
          expect(bracket.setLength(2, this.coll))
            .toEqual(this.coll);
          expect(bracket.setLength(3, this.coll))
            .toEqual(this.coll);
        });
      });

      when('bracket is shorter than <length>', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should append undefined', function() {
          expect(bracket.setLength(4, this.coll))
            .toEqual([ undefined, 4, 5, undefined ]);
          expect(bracket.setLength(6, this.coll))
            .toEqual([ undefined, 4, 5, undefined, undefined, undefined ]);
        });
      });
    });

    describe('set(<group_index>, <round_index>)', function() {
      when('bracket is shorter than <length>', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should append undefined and set bracket[<index>]', function() {
          expect(bracket.set(3, 2, this.coll))
            .toEqual([ undefined, 4, 5, 2 ]);
          expect(bracket.set(5, 2, this.coll))
            .toEqual([ undefined, 4, 5, undefined, undefined, 2 ]);
        });
      });

      when('bracket is not set', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should set bracket[<index>]', function() {
          expect(bracket.set(0, 2, this.coll))
            .toEqual([ 2, 4, 5 ]);
        });
      });

      when('bracket is set', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should not modify bracket[<index>]', function() {
          expect(bracket.set(1, 2, this.coll))
            .toEqual([ undefined, 4, 5 ]);
          expect(bracket.set(2, 2, this.coll))
            .toEqual([ undefined, 4, 5 ]);
        });
      });
    });

    describe('reset(<index>)', function() {
      when('bracket is shorter than <length>', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should append undefined', function() {
          expect(bracket.reset(3, this.coll))
            .toEqual([ undefined, 4, 5, undefined ]);
          expect(bracket.reset(5, this.coll))
            .toEqual([ undefined, 4, 5, undefined, undefined, undefined ]);
        });
      });

      when('bracket is not set', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should not modify bracket', function() {
          expect(bracket.reset(0, this.coll))
            .toEqual([ undefined, 4, 5 ]);
        });
      });

      when('bracket is set', function() {
        this.coll = [ undefined, 4, 5 ];
      }, function() {
        it('should not modify bracket[<index>]', function() {
          expect(bracket.reset(1, this.coll))
            .toEqual([ undefined, undefined, 5 ]);
          expect(bracket.reset(2, this.coll))
            .toEqual([ undefined, 4, undefined ]);
        });
      });
    });

    describe('nbRounds(<group_index>, <nb_rounds>)', function() {
      when('bracket is set', function() {
      }, function() {
        using([
          [ 'nb_rounds' , 'nb' ],
          [ 2           , 0    ],
          [ 3           , 1    ],
          [ 5           , 3    ],
        ], function(e, d) {
          it('should return number of rounds since bracket start, '+d, function() {
            expect(bracket.nbRounds(0, e.nb_rounds,[ 2 ]))
              .toBe(e.nb);
          });
        });
      });

      when('bracket is not set', function() {
      }, function() {
        it('should return 0', function() {
          expect(bracket.nbRounds(0, 2, [ undefined ]))
            .toBe(0);
        });
      });
    });

    describe('roundof(<group_index>, <group_size>, <round_index>)', function() {
      when('bracket is not set', function() {
      }, function() {
        it('should return "Not in bracket"', function() {
          expect(bracket.roundOf(0, 0, 0, [])).toMatch(/not in bracket/i);
        });
      });

      when('bracket is set', function() {
      }, function() {
        using([
          [ 'round_index' , 'desc'            ],
          [ 0             , /round of 8/i     ],
          [ 1             , /quarter-finals/i ],
          [ 2             , /semi-finals/i    ],
          [ 3             , /final/i          ],
          [ 4             , /ended/i          ],
        ], function(e, d) {
          it('should return a description of the bracket round, '+d, function() {
            expect(bracket.roundOf(0, 16, e.round_index, [0])).toMatch(e.desc);
          });
        });
      });
    });
  });

});
