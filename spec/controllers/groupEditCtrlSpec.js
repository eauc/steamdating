'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.controllers');
  });

  describe('groupEditCtrl', function(c) {

    var initCtrlWith;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      'players',
      'state',
      function($rootScope,
               $controller,
               players,
               state) {
        this.scope = $rootScope.$new();
        this.scope.state = { players: ['players'], bracket: ['bracket'] };
        this.scope.goToState = jasmine.createSpy('goToState');
        this.scope.updatePoints = jasmine.createSpy('updatePoints');
        this.scope.storeState = jasmine.createSpy('storeState');

        this.window = jasmine.createSpyObj('window', [ 'prompt' ]);
        this.players = players;
        this.new_groups = ['new_groups'];
        spyOn(players, 'chunkGroups').and.returnValue(this.new_groups);
        spyOn(players, 'splitNewGroup').and.returnValue(this.new_groups);
        spyOn(players, 'movePlayerGroupFront').and.returnValue(this.new_groups);
        spyOn(players, 'movePlayerGroupBack').and.returnValue(this.new_groups);
        spyOn(players, 'moveGroupFront').and.returnValue(this.new_groups);
        spyOn(players, 'moveGroupBack').and.returnValue(this.new_groups);

        this.state = state;
        this.sorted_players = [
          [ { rank: 1, players: [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ] },
            { rank: 2, players: [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ] } ],
          [ { rank: 3, players: [ { name: 'p8' }, { name: 'p9' } ] } ]
        ];
        this.new_state_players = [
          [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' },
          { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
          [ { name: 'p8' }, { name: 'p9' } ]
        ];
        spyOn(state, 'sortPlayers').and.returnValue(this.sorted_players);
        spyOn(state, 'clearBracket').and.returnValue(['new_bracket']);

        $controller('groupEditCtrl', { 
          '$scope': this.scope,
          '$window': this.window
        });
      }
    ]));

    it('should init selection object', function() {
      expect(this.scope.selection).toEqual({});
    });

    it('should make a copy the state', function() {
      expect(this.scope.new_state).toBeAn('Object');
      expect(this.scope.new_state).not.toBe(this.scope.state);
      expect(this.scope.new_state.bracket).toEqual(this.scope.state.bracket);
    });

    it('should sort players', function() {
      expect(this.state.sortPlayers)
        .toHaveBeenCalledWith(this.scope.state);
      expect(this.scope.new_state.players).toEqual(this.new_state_players);
    });

    describe('isSelectionEmpty()', function() {
      it('should test whether the selection is empty', function() {
        this.scope.selection = {};
        expect(this.scope.isSelectionEmpty()).toBe(true);
        this.scope.selection = { 'p1': false, 'p2': false };
        expect(this.scope.isSelectionEmpty()).toBe(true);
        this.scope.selection = { 'p1': false, 'toto': true, 'p2': false };
        expect(this.scope.isSelectionEmpty()).toBe(false);
      });
    });

    describe('chunkGroups()', function() {
      it('should prompt for new groups size', function() {
        this.scope.chunkGroups();

        expect(this.window.prompt).toHaveBeenCalledWith('Groups size');
      });

      when('user enter new groups size', function() {
        this.window.prompt.and.returnValue('5');

        this.new_groups = [ 'new groups' ];
        this.players.chunkGroups.and.returnValue(this.new_groups);

        this.scope.chunkGroups();
      }, function() {
        it('should chunk groups', function() {
          expect(this.scope.new_state.players).toBe(this.new_groups);
          expect(this.players.chunkGroups)
            .toHaveBeenCalledWith(this.new_state_players, 5);
        });

        it('should reset bracket', function() {
          expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
          expect(this.state.clearBracket)
            .toHaveBeenCalledWith(this.scope.new_state);
        });
      });
    });

    describe('splitSelection()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.splitSelection();
      });

      it('should split selection into new group', function() {
        expect(this.scope.new_state.players).toBe(this.new_groups);
        expect(this.players.splitNewGroup)
          .toHaveBeenCalledWith(this.new_state_players, ['p1','p3']);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
        expect(this.state.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveSelectionFront()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionFront();
      });

      it('should move players in selection to front', function() {
        expect(this.scope.new_state.players).toBe(this.new_groups);
        expect(this.players.movePlayerGroupFront.calls.count()).toBe(2);
        expect(this.players.movePlayerGroupFront)
          .toHaveBeenCalledWith(this.new_state_players, 'p1');
        expect(this.players.movePlayerGroupFront)
          .toHaveBeenCalledWith(this.new_groups, 'p3');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
        expect(this.state.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveSelectionBack()', function() {
      beforeEach(function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionBack();
      });

      it('should move players in selection to back', function() {
        expect(this.scope.new_state.players).toBe(this.new_groups);
        expect(this.players.movePlayerGroupBack.calls.count()).toBe(2);
        expect(this.players.movePlayerGroupBack)
          .toHaveBeenCalledWith(this.new_state_players, 'p1');
        expect(this.players.movePlayerGroupBack)
          .toHaveBeenCalledWith(this.new_groups, 'p3');
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
        expect(this.state.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveGroupFront(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupFront(4);
      });

      it('should move <group_index> to front', function() {
        expect(this.scope.new_state.players).toBe(this.new_groups);
        expect(this.players.moveGroupFront)
          .toHaveBeenCalledWith(this.new_state_players, 4);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
        expect(this.state.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('moveGroupBack(<group_index>)', function() {
      beforeEach(function() {
        this.scope.moveGroupBack(4);
      });

      it('should move <group_index> to back', function() {
        expect(this.scope.new_state.players).toBe(this.new_groups);
        expect(this.players.moveGroupBack)
          .toHaveBeenCalledWith(this.new_state_players, 4);
      });

      it('should reset bracket', function() {
        expect(this.scope.new_state.bracket).toEqual(['new_bracket']);
        expect(this.state.clearBracket)
          .toHaveBeenCalledWith(this.scope.new_state);
      });
    });

    describe('doClose(<validate>)', function() {
      it('should return to players list', function() {
        this.scope.doClose(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('players');
      });

      when('<validate>', function() {
        this.scope.new_state.players = this.new_groups;
        this.scope.new_state.bracket = ['new_bracket'];

        this.scope.doClose(true);
      }, function() {
        it('should update state.players', function() {
          expect(this.scope.state.players).toBe(this.new_groups);
        });

        it('should update state.bracket', function() {
          expect(this.scope.state.bracket).toEqual(['new_bracket']);
        });

        it('should update points', function() {
          expect(this.scope.updatePoints).toHaveBeenCalled();
        });

        it('should store state', function() {
          expect(this.scope.storeState).toHaveBeenCalled();
        });
      });
    });
  });

});
