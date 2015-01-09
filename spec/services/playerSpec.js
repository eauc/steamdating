'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('player', function() {

    var player;

    beforeEach(inject([ 'player', function(_player) {
      player = _player;
    }]));

    describe('is(<name>)', function() {
      it('should test if player is <name>', function() {
        expect(player.is({ name: 'tata' }, 'other')).toBe(false);
        expect(player.is({ name: 'same' }, 'same')).toBe(true);
      });
    });

  });

});
