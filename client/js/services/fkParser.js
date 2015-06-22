'use strict';

angular.module('srApp.services')
  .factory('fkParser', [
    'player',
    'list',
    'lists',
    function(playerService,
             listService,
             listsService) {
      var fkParserService =  {
        parse: function(factions, string) {
          var ctxt = {
            factions: factions,
            state: DEFAULT_STATE,
            result: [],
            errors: [],
            players: []
          };
          R.pipe(
            s.lines,
            R.append(''),
            R.mapIndexed(parseLine$(ctxt))
          )(string);
          console.log('fkParser result', ctxt.result);
          return [ctxt.result, ctxt.errors];
        }
      };
      function parseLine(ctxt, line, line_index) {
        ctxt.line_number = line_index+1;
        return R.cond(
          [ isParam, function(line) {
            return ctxt.state.onParam(ctxt,
                                      s(line).strLeft(':').trim().value(),
                                      s(line).strRight(':').trim().value(),
                                      s.trim(line));
          } ],
          [ s.isBlank, function(line) {
            return ctxt.state.onSeparator(ctxt);
          } ],
          [ R.T, function(line) {
            return ctxt.state.onLine(ctxt, s.trim(line));
          } ]
        )(line);
      }
      var parseLine$ = R.curry(parseLine);
      function isParam(line) {
        return s.include(line, ':');
      }

      var BASE_STATE = {
        onParam: function(ctxt, key, value) {
          pushError(ctxt, 'parameter "'+key+'"="'+s.truncate(value, 8)+
                    '" ignored');
        },
        onSeparator: function(ctxt) {
        },
        onLine: function(ctxt, line) {
          pushError(ctxt, 'ignored : '+s.truncate(line, 15));
        }
      };
      function pushError(ctxt, string) {
        ctxt.errors.push('line '+ctxt.line_number+' '+string);
      }

      var DEFAULT_STATE = R.merge(BASE_STATE, {
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Team':
            {
              newTeam(ctxt, value);
              return;
            }
          case 'Player':
            {
              newPlayer(ctxt, value);
              return;
            }
          case 'List':
            {
              newList(ctxt);
              return;
            }
          default:
            {
              BASE_STATE.onParam(ctxt, key, value);
            }
          }
        }
      });
      function newTeam(ctxt, name) {
        if(s.isBlank(name)) {
          pushError(ctxt, 'empty team name');
          ctxt.team = null;
          ctxt.state = ERROR_STATE;
          return;
        }
        name = s.capitalize(name);
        if(0 <= R.indexOf(name, ctxt.players)) {
          pushError(ctxt, 'team name "'+name+'" already exists');
          ctxt.player = null;
          ctxt.state = ERROR_STATE;
          return;
        }
        ctxt.players.push(name);
        ctxt.team = { name: name, members: [] };
        ctxt.state = TEAM_STATE;
      }
      function newPlayer(ctxt, name) {
        if(s.isBlank(name)) {
          pushError(ctxt, 'empty player name');
          ctxt.player = null;
          ctxt.state = ERROR_STATE;
          return;
        }
        name = s.capitalize(name);
        if(0 <= R.indexOf(name, ctxt.players)) {
          pushError(ctxt, 'player name "'+name+'" already exists');
          ctxt.player = null;
          ctxt.state = ERROR_STATE;
          return;
        }
        ctxt.players.push(name);
        ctxt.player = { name: name };
        ctxt.state = PLAYER_STATE;
      }
      function newList(ctxt) {
        if(R.isNil(ctxt.player)) {
          pushError(ctxt, 'unexpected list definition');
          ctxt.state = ERROR_STATE;
          return;
        }
        ctxt.list = { content: [], faction: ctxt.player.faction };
        ctxt.state = LIST_STATE;
      }

      var TEAM_STATE = R.merge(BASE_STATE, {
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Origin':
            {
              teamOrigin(ctxt, value);
              return;
            }
          default:
            {
              BASE_STATE.onParam(ctxt, key, value);
            }
          }
        },
        onSeparator: addTeam
      });
      function teamOrigin(ctxt, origin) {
        ctxt.team.origin = origin;
      }
      function addTeam(ctxt) {
        ctxt.team = playerService.create(R.pick(['name', 'origin', 'members'],
                                                ctxt.team)
                                        );
        ctxt.result.push(ctxt.team);
        ctxt.state = DEFAULT_STATE;
      }

      var PLAYER_STATE = R.merge(BASE_STATE, {
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Faction':
            {
              playerFaction(ctxt, value);
              return;
            }
          case 'Origin':
            {
              playerOrigin(ctxt, value);
              return;
            }
          default:
            {
              BASE_STATE.onParam(ctxt, key, value);
            }
          }
        },
        onSeparator: addPlayer
      });
      function playerFaction(ctxt, faction) {
        var faction_keys = R.keys(ctxt.factions);
        if(!R.find(R.eq(faction), faction_keys)) {
          pushError(ctxt, 'unknown faction "'+faction+'"');
        }
        ctxt.player.faction = faction;
      }
      function playerOrigin(ctxt, origin) {
        ctxt.player.origin = origin;
      }
      function addPlayer(ctxt) {
        var players = R.exists(ctxt.team) ? ctxt.team.members : ctxt.result;
        ctxt.player = playerService.create(R.pick(['name', 'faction', 'origin'],
                                                  ctxt.player)
                                          );
        players.push(ctxt.player);
        ctxt.state = DEFAULT_STATE;
      }
      
      var LIST_STATE = R.merge(BASE_STATE, {
        onParam: function(ctxt, key, value, line) {
          switch(key) {
          case 'Theme':
            {
              ctxt.list.theme = value;
              return;
            }
          default:
            {
              // Warroom format
              if(s.endsWith(key, 'WB') ||
                 s.endsWith(key, 'WJ')) {
                LIST_STATE.onLine(ctxt, line);
              }
              else {
                BASE_STATE.onParam(ctxt, key, value);
              }
            }
          }
        },
        onSeparator: addPlayerList,
        onLine: listCaster
      });
      function addPlayerList(ctxt) {
        var list = listService.create({ faction: ctxt.list.faction,
                                        caster: ctxt.list.caster,
                                        theme: ctxt.list.theme,
                                        fk: ctxt.list.content.join('\n') });
        var player = ctxt.player;
        player.lists = listsService.add(list, player.lists);
        ctxt.state = DEFAULT_STATE;
      }
      function listCaster(ctxt, line) {
        var casters;
        var caster = R.pipe(
          R.path([ctxt.list.faction, 'casters']),
          R.tap(function(cs) { casters = cs; }),
          R.keys,
          R.find(function(key) {
            return s.startsWith(line, casters[key].name);
          })
        )(ctxt.factions);
        if(R.isNil(caster)) {
          var match = line.match(/([a-zA-Z\s,]+)/);
          if(!R.isNil(match)) caster = match[1];
          else caster = 'UNKNOWN';
          pushError(ctxt, 'unknown caster "'+line+'"');
        }
        ctxt.list.caster = caster;
        ctxt.list.content.push(line);
        ctxt.state = LIST_CONTENT_STATE;
      }

      var LIST_CONTENT_STATE = R.merge(BASE_STATE, {
        onSeparator: LIST_STATE.onSeparator,
        onParam: function(ctxt, key, value, line) {
          LIST_CONTENT_STATE.onLine(ctxt, line);
        },
        onLine: function(ctxt, line) {
          ctxt.list.content.push(line);
        }
      }, BASE_STATE);

      var ERROR_STATE = R.merge(BASE_STATE, {
        onParam: function(ctxt, key, value) {
        },
        onSeparator: function(ctxt) {
          ctxt.state = DEFAULT_STATE;
        },
        onLine: function(ctxt, line) {
        }
      });

      R.curryService(fkParserService);
      return fkParserService;
    }
  ]);
