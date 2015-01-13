'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('state', function() {

    var state;

    beforeEach(inject([ 'state', function(_state) {
      state = _state;
    }]));

    describe('create(<data>)', function() {
      beforeEach(function() {
        this.data = {
          test: 'value'
        };
        this.result = state.create(this.data);
      });

      it('should not modify data', function() {
        expect(this.data).toEqual({ test: 'value' });
        expect(this.result).not.toBe(this.data);
      });

      it('should add default fields', function() {
        expect(this.result.players).toEqual([[]]);
        expect(this.result.rounds).toEqual([]);
      });

      when('expected fields exist in data', function() {
        this.data = {
          test: 'value',
          players: [ [ 'toto' ] ],
          rounds: [ 'titi' ]
        };
        this.result = state.create(this.data);
      }, function() {
        it('should not modify them', function() {
          expect(this.result).toEqual(this.data);
        });
      });
    });

    describe('init()', function() {
      beforeEach(function() {
        this.result = state.init();
      });

      it('should create default state', function() {
        expect(this.result).toEqual({
          players: [[]],
          rounds: []
        });
      });
    });

    describe('hasPlayerGroups(<st>)', function() {
      it('should test if more than one player group is defined', function() {
        expect(state.hasPlayerGroups({ players: [[]] })).toBe(false);
        expect(state.hasPlayerGroups({ players: [[],[]] })).toBe(true);
      });
    });

  });

});
