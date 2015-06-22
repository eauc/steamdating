'use strict';

describe('controllers', function() {

  beforeEach(function() {
    module('srApp.services');
    module('srApp.directives');
    module('srApp.controllers');
  });

  describe('playerEditCtrl', function(c) {
    var initController;

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.factionsService = spyOnService('factions');
        this.playersService = spyOnService('players');
        this.listService = spyOnService('list');
        this.listsService = spyOnService('lists');

        this.promptService = spyOnService('prompt');
        mockReturnPromise(this.promptService.prompt);

        initController = function(ctxt, player, team) {
          ctxt.scope = $rootScope.$new();
          ctxt.scope.goToState = jasmine.createSpy('goToState');
          ctxt.scope.storeState = jasmine.createSpy('storeState');
          ctxt.group = 4;
          ctxt.scope.edit = { team: team,
                              player: player,
                              group: ctxt.group
                            };
          ctxt.current_state = {
            players: [ { name: 'titi'}, { name: 'toto' } ],
            store: jasmine.createSpy('storeState')
          };
          ctxt.scope.state = R.clone(ctxt.current_state);
          ctxt.playersService.names._retVal = [ 'player', 'other1', 'other2' ];
          
          $controller('playerEditCtrl', { 
            '$scope': ctxt.scope,
          });
          $rootScope.$digest();
        };
        initController(this,
                       { name: 'player', lists:[] },
                       { name: 'team' });
      }
    ]));

    it('should edit a copy of given player', function() {
      expect(this.scope.player).not.toBe(this.scope.edit.player);
      expect(this.scope.player).toEqual(this.scope.edit.player);
    });

    it('should init list tab index', function() {
      // when lists is empty
      expect(this.scope.list).toBe(-1);

      // when lists is not empty
      initController(this, { name: 'player', lists:[[],[]] });

      expect(this.scope.list).toBe(0);
    });

    it('should init factions & origins', function() {
      expect(this.playersService.factions)
        .toHaveBeenCalledWith('factions.baseFactions.returnValue',
                              this.scope.state.players);
      expect(this.playersService.origins)
        .toHaveBeenCalledWith(this.scope.state.players);

      expect(this.scope.factions).toBe('players.factions.returnValue');
      expect(this.scope.origins).toBe('players.origins.returnValue');
    });

    it('should init teams', function() {
      expect(this.scope.teams)
        .toEqual(['other1', 'other2', undefined]);
      expect(this.scope.player_team)
        .toBe('team');
    });

    describe('doSwitchToList(<i>)', function() {
      it('should change list tab index', function() {
        this.scope.doSwitchToList(5);

        expect(this.scope.list).toBe(5);
      });
    });

    describe('doAddList()', function() {
      beforeEach(function() {
        initController(this, {
          name: 'player',
          faction: 'faction',
          lists:[[],[]]
        });

        this.scope.doAddList();
      });

      it('should change list tab index to last list', function() {
        expect(this.scope.list).toBe(this.scope.edit.player.lists.length);
      });

      it('should add a new list to player.lists', function() {
        expect(this.listService.create)
          .toHaveBeenCalledWith({ faction: this.scope.edit.player.faction });
        expect(this.listsService.add)
          .toHaveBeenCalledWith('list.create.returnValue',
                                this.scope.edit.player.lists);
        expect(this.scope.player.lists).toBe('lists.add.returnValue');
      });
    });

    describe('doDropList(<i>)', function() {
      beforeEach(function() {
        initController(this, {
          name: 'player',
          faction: 'faction',
          lists:[['1'],['2']]
        });

        this.scope.doDropList(2);
      });

      it('should drop list <i> from player.lists', function() {
        expect(this.listsService.drop)
          .toHaveBeenCalledWith(2, this.scope.edit.player.lists);
        expect(this.scope.player.lists).toBe('lists.drop.returnValue');
      });
    });

    describe('doClose(<validate>)', function() {
      beforeEach(function() {
        this.scope.edit.back = 'previous_state';
      });
      
      when('not validate', function() {
      },function() {
        it('should return to player state', function() {
          this.scope.doClose(false);
          
          expect(this.scope.goToState).toHaveBeenCalledWith('previous_state');
        });
      });

      when('validate', function() {
      }, function() {
        using([
          [ 'name' ],
          [ null   ],
          [ ''     ],
        ], function(e, d) {
          it('should validate player\'s name, '+d, function() {
            this.scope.player.name = e.anme;

            this.scope.doClose(true);

            expect(this.promptService.prompt)
              .toHaveBeenCalledWith('alert', 'invalid player/team name');
          });
        });

        when('editing an existing player', function() {
        }, function() {
          beforeEach(function() {
            initController(this, { name: 'titi', lists:[] });
            this.playersService.namesFull.and.returnValue([ 'titi', 'toto' ]);
          });
          
          it('should check that the new name does not already exists', function() {
            // no change
            this.promptService.prompt.calls.reset();
            this.scope.player.name = 'titi';
            this.scope.doClose(true);
            expect(this.promptService.prompt).not.toHaveBeenCalled();
            // new name
            this.promptService.prompt.calls.reset();
            this.scope.player.name = 'new';
            this.scope.doClose(true);
            expect(this.promptService.prompt).not.toHaveBeenCalled();
            // existing name
            this.promptService.prompt.calls.reset();
            this.scope.player.name = 'toto';
            this.scope.doClose(true);
            expect(this.promptService.prompt)
              .toHaveBeenCalledWith('alert', 'a player/team with the same name already exists');
          });

          it('should update existing player', function() {
            this.scope.player.name = 'new_n';
            this.scope.player.faction = 'new_f';
            this.scope.player.city = 'new_c';
            this.scope.player.team = 'new_t';
            this.scope.player.lists = [ 'new_l' ];
            
            this.scope.doClose(true);
            
            expect(this.scope.edit.player.name).toBe('new_n');
            expect(this.scope.edit.player.faction).toBe('new_f');
            expect(this.scope.edit.player.city).toBe('new_c');
            expect(this.scope.edit.player.team).toBe('new_t');
            expect(this.scope.edit.player.lists).toEqual([ 'new_l' ]);
          });

          when('adding player to a team', function() {
            initController(this,
                           { name: 'titi', lists:[] },
                           null
                          );
            this.scope.player_team = 'team';
          }, function() {
            it('should switch from player to team member', function() {
              this.scope.doClose(true);
              
              expect(this.playersService.switchPlayerToTeamMember)
                .toHaveBeenCalledWith('team', this.scope.player, this.current_state.players);
              expect(this.scope.state.players)
                .toBe('players.switchPlayerToTeamMember.returnValue');
            });
          });

          when('removing player from a team', function() {
            initController(this,
                           { name: 'titi', lists:[] },
                           { name: 'team' }
                          );
            this.scope.player_team = undefined;
          }, function() {
            it('should switch from team member to player', function() {
              this.scope.doClose(true);
              
              expect(this.playersService.switchTeamMemberToPlayer)
                .toHaveBeenCalledWith('team', 4,
                                      this.scope.player, this.current_state.players);
              expect(this.scope.state.players)
                .toBe('players.switchTeamMemberToPlayer.returnValue');
            });
          });

          when('changing a member\'s team', function() {
            initController(this,
                           { name: 'titi', lists:[] },
                           { name: 'team' }
                          );
            this.scope.player_team = 'new_team';
          }, function() {
            it('should switch from team member to player', function() {
              this.scope.doClose(true);
              
              expect(this.playersService.switchMemberBetweenTeams)
                .toHaveBeenCalledWith('team', 'new_team',
                                      this.scope.player, this.current_state.players);
              expect(this.scope.state.players)
                .toBe('players.switchMemberBetweenTeams.returnValue');
            });
          });
        });

        when('creating a new player', function() {
          initController(this, { name: undefined, lists:[] });
          this.playersService.namesFull.and.returnValue([ 'titi', 'toto' ]);
        }, function() {
          it('should check that the new name does not already exists', function() {
            // new name
            this.promptService.prompt.calls.reset();
            this.scope.player.name = 'new';
            this.scope.doClose(true);
            expect(this.promptService.prompt).not.toHaveBeenCalled();
            // existing name
            this.promptService.prompt.calls.reset();
            this.scope.player.name = 'toto';
            this.scope.doClose(true);
            expect(this.promptService.prompt)
              .toHaveBeenCalledWith('alert', 'a player/team with the same name already exists');
          });

          when('adding a team/solo player', function() {
            this.scope.player.team = undefined;
          }, function() {
            it('should add player to state', function() {
              this.scope.player.name = 'new_n';
              this.scope.player.faction = 'new_f';
              this.scope.player.city = 'new_c';
              this.scope.player.team = 'new_t';
              this.scope.player.lists = [ 'new_l' ];
              
              this.scope.doClose(true);
              
              expect(this.playersService.add)
                .toHaveBeenCalledWith(this.scope.edit.group,
                                      this.scope.player,
                                      this.current_state.players);
              expect(this.scope.state.players).toBe('players.add.returnValue');
            });
          });

          when('adding a team member', function() {
            this.scope.player_team = 'team';
          }, function() {
            it('should add player to team', function() {
              this.scope.player.name = 'new_n';
              this.scope.player.faction = 'new_f';
              this.scope.player.city = 'new_c';
              this.scope.player.team = 'new_t';
              this.scope.player.lists = [ 'new_l' ];
              
              this.scope.doClose(true);
              
              expect(this.playersService.addToTeam)
                .toHaveBeenCalledWith('team',
                                      this.scope.player,
                                      this.current_state.players);
              expect(this.scope.state.players)
                .toBe('players.addToTeam.returnValue');
            });
          });
        });

        it('should store state', function() {
          this.scope.doClose(true);
          
          expect(this.scope.storeState).toHaveBeenCalled();
        });

        it('should return to previous state', function() {
          this.scope.doClose(true);
          
          expect(this.scope.goToState)
            .toHaveBeenCalledWith('previous_state');
        });
      });
    });
  });

});
