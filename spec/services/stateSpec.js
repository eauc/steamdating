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
          rounds: [ 'titi' ],
          ranking: {
            player: 'player',
            team: 'team'
          }
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
          rounds: [],
          ranking: {
            player: '((tp*n_players*n_players+sos)*5*n_rounds+cp)*100*n_rounds+ap',
            team: '(((ttp*team_size*n_rounds+tp)*n_teams*n_teams+sos)*5*n_rounds+cp)*100*n_rounds+ap'
          }
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
