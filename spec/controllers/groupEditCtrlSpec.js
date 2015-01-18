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
      function($rootScope,
               $controller,
               players) {
        this.scope = $rootScope.$new();
        this.scope.state = {
          players: [
            [ { name: 'p1' }, { name: 'p2' }, { name: 'p3' } ],
            [ { name: 'p4' }, { name: 'p5' }, { name: 'p6' }, { name: 'p7' } ],
            [ { name: 'p8' }, { name: 'p9' } ]
          ]
        };
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

        $controller('groupEditCtrl', { 
          '$scope': this.scope,
          '$window': this.window
        });
      }
    ]));

    it('should init selection object', function() {
      expect(this.scope.selection).toEqual({});
    });

    it('should make a copy of players list', function() {
      expect(this.scope.players).toEqual(this.scope.state.players);
      expect(this.scope.players).not.toBe(this.scope.state.players);
      var ctxt = this;
      _.each(this.scope.state.players, function(gr, i) {
        expect(ctxt.scope.players[i]).not.toBe(gr);
      });
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
      }, function() {
        it('should chunk groups', function() {
          this.scope.chunkGroups();

          expect(this.scope.players).toBe(this.new_groups);
          expect(this.players.chunkGroups)
            .toHaveBeenCalledWith(this.scope.state.players, 5);
        });
      });
    });

    describe('splitSelection()', function() {
      it('should split selection into new group', function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.splitSelection();

        expect(this.scope.players).toBe(this.new_groups);
        expect(this.players.splitNewGroup)
          .toHaveBeenCalledWith(this.scope.state.players, ['p1','p3']);
      });
    });

    describe('moveSelectionFront()', function() {
      it('should move players in selection to front', function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionFront();

        expect(this.scope.players).toBe(this.new_groups);
        expect(this.players.movePlayerGroupFront.calls.count()).toBe(2);
        expect(this.players.movePlayerGroupFront)
          .toHaveBeenCalledWith(this.scope.state.players, 'p1');
        expect(this.players.movePlayerGroupFront)
          .toHaveBeenCalledWith(this.new_groups, 'p3');
      });
    });

    describe('moveSelectionBack()', function() {
      it('should move players in selection to back', function() {
        this.scope.selection = {
          'p1': true,
          'p2': false,
          'p3': true,
          'p4': false,
        };
        this.scope.moveSelectionBack();

        expect(this.scope.players).toBe(this.new_groups);
        expect(this.players.movePlayerGroupBack.calls.count()).toBe(2);
        expect(this.players.movePlayerGroupBack)
          .toHaveBeenCalledWith(this.scope.state.players, 'p1');
        expect(this.players.movePlayerGroupBack)
          .toHaveBeenCalledWith(this.new_groups, 'p3');
      });
    });

    describe('moveGroupFront(<group_index>)', function() {
      it('should move <group_index> to front', function() {
        this.scope.moveGroupFront(4);

        expect(this.scope.players).toBe(this.new_groups);
        expect(this.players.moveGroupFront)
          .toHaveBeenCalledWith(this.scope.state.players, 4);
      });
    });

    describe('moveGroupBack(<group_index>)', function() {
      it('should move <group_index> to back', function() {
        this.scope.moveGroupBack(4);

        expect(this.scope.players).toBe(this.new_groups);
        expect(this.players.moveGroupBack)
          .toHaveBeenCalledWith(this.scope.state.players, 4);
      });
    });

    describe('doClose(<validate>)', function() {
      it('should return to players list', function() {
        this.scope.doClose(false);

        expect(this.scope.goToState).toHaveBeenCalledWith('players');
      });

      when('<validate>', function() {
        this.scope.players = this.new_groups;

        this.scope.doClose(true);
      }, function() {
        it('should update state.players', function() {
          expect(this.scope.state.players).toBe(this.new_groups);
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
