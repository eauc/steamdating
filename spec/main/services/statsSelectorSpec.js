'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('statsFactionSelector', function() {

    var statsFactionSelector;

    beforeEach(inject([ 'statsFactionSelector', function(_statsFactionSelector) {
      statsFactionSelector = _statsFactionSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.forFaction._retVal = [
          { name: 'p1' },
          { name: 'p2' },
          { name: 'p3' },
        ];
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(p, rs) {
          return [p+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games with faction <value>', function() {
        expect(statsFactionSelector.select(this.state, 'factionVal'))
          .toEqual([
            [ 'p1', [ 'p1Games' ] ],
            [ 'p2', [ 'p2Games' ] ],
            [ 'p3', [ 'p3Games' ] ]
          ]);

        expect(this.playersService.forFaction)
          .toHaveBeenCalledWith('factionVal', ['players']);
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p1', ['rounds']);
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p2', ['rounds']);
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p3', ['rounds']);
      });
    });
  });

  describe('statsPlayerSelector', function() {

    var statsPlayerSelector;

    beforeEach(inject([ 'statsPlayerSelector', function(_statsPlayerSelector) {
      statsPlayerSelector = _statsPlayerSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(p, rs) {
          return [p+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games for player <value>', function() {
        expect(statsPlayerSelector.select(this.state, 'playerVal'))
          .toEqual([
            [ 'playerVal', [ 'playerValGames' ] ],
          ]);

        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('playerVal', ['rounds']);
      });
    });
  });

  describe('statsCasterSelector', function() {

    var statsCasterSelector;

    beforeEach(inject([ 'statsCasterSelector', function(_statsCasterSelector) {
      statsCasterSelector = _statsCasterSelector;
    }]));

    describe('select(<state>, <value>)', function() {
      beforeEach(function() {
        this.playersService = spyOnService('players');
        this.playersService.forCaster._retVal = [
          { name: 'p1' },
          { name: 'p2' },
          { name: 'p3' },
        ];
        this.roundsService = spyOnService('rounds');
        this.roundsService.gamesForPlayer.and.callFake(function(p, rs) {
          return [p+'Games'];
        });
        this.gamesService = spyOnService('games');
        this.gamesService.forCaster.and.callFake(function(p, c, gs) {
          return [p+c+'Games'];
        });
        this.state = {
          players: ['players'],
          rounds: ['rounds'],
        };
      });

      it('should select games with caster <value>', function() {
        expect(statsCasterSelector.select(this.state, 'casterVal'))
          .toEqual([
            [ 'p1', [ 'p1casterValGames' ] ],
            [ 'p2', [ 'p2casterValGames' ] ],
            [ 'p3', [ 'p3casterValGames' ] ]
          ]);

        expect(this.playersService.forCaster)
          .toHaveBeenCalledWith('casterVal', ['players']);

        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p1', ['rounds']);
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p2', ['rounds']);
        expect(this.roundsService.gamesForPlayer)
          .toHaveBeenCalledWith('p3', ['rounds']);

        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith('p1', 'casterVal', ['p1Games']);
        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith('p2', 'casterVal', ['p2Games']);
        expect(this.gamesService.forCaster)
          .toHaveBeenCalledWith('p3', 'casterVal', ['p3Games']);
      });
    });
  });

});
