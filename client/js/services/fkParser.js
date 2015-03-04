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
        parse: function(string, factions) {
          var ctxt = {
            factions: factions,
            state: DEFAULT_STATE,
            result: [],
            errors: [],
            players: []
          };
          _.chain(string)
            .apply(s.lines)
            .cat('')
            .mapWith(parseLine, ctxt)
            .value();
          console.log('fkParser result', ctxt.result);
          return [ctxt.result, ctxt.errors];
        }
      };
      function isParam(line) {
        return s.include(line, ':');
      }
      function parseLine(line, ctxt, line_index) {
        ctxt.line_number = line_index+1;
        if(isParam(line)) {
          return ctxt.state.onParam(ctxt,
                                    s(line).strLeft(':').trim().value(),
                                    s(line).strRight(':').trim().value(),
                                    s.trim(line));
        }
        else if(s.isBlank(line)) {
          return ctxt.state.onSeparator(ctxt);
        }
        else {
          return ctxt.state.onLine(ctxt, s.trim(line));
        }
      }
      function pushError(ctxt, string) {
        ctxt.errors.push('line '+ctxt.line_number+' '+string);
      }

      function newPlayer(ctxt, name) {
        if(s.isBlank(name)) {
          pushError(ctxt, 'empty player name');
          ctxt.player = null;
          ctxt.state = ERROR_STATE;
          return;
        }
        name = s.capitalize(name);
        if(0 <= _.indexOf(ctxt.players, name)) {
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
        if(!_.exists(ctxt.player)) {
          pushError(ctxt, 'unexpected list definition');
          ctxt.state = ERROR_STATE;
          return;
        }
        ctxt.list = { content: [], faction: ctxt.player.faction };
        ctxt.state = LIST_STATE;
      }
      function playerFaction(ctxt, faction) {
        var faction_key = _.findKey(ctxt.factions, function(faction_info) {
          return faction_info.name === faction;
        });
        if(!_.exists(faction_key)) {
          pushError(ctxt, 'unknown faction "'+faction+'"');
          ctxt.player.faction = faction;
          return;
        }
        ctxt.player.faction = faction_key;
      }
      function playerOrigin(ctxt, origin) {
        ctxt.player.origin = origin;
      }
      function listCaster(ctxt, line) {
        var caster = _.chain(ctxt.factions)
            .getPath(ctxt.list.faction+'.casters')
            .findKey(function(caster) {
              return s.startsWith(line, caster.name);
            })
            .value();
        if(!_.exists(caster)) {
          var match = line.match(/([a-zA-Z\s,]+)/);
          if(_.exists(match)) caster = match[1];
          else caster = 'UNKNOWN';
          pushError(ctxt, 'unknown caster "'+line+'"');
        }
        ctxt.list.caster = caster;
        ctxt.list.content.push(line);
        ctxt.state = LIST_CONTENT_STATE;
      }
      function addPlayer(ctxt) {
        ctxt.result.push(playerService.create({ name: ctxt.player.name,
                                                faction: ctxt.player.faction,
                                                origin: ctxt.player.origin }));
        ctxt.state = DEFAULT_STATE;
      }
      function addPlayerList(ctxt) {
        var list = listService.create({ faction: ctxt.list.faction,
                                        caster: ctxt.list.caster,
                                        theme: ctxt.list.theme,
                                        fk: ctxt.list.content.join('\n') });
        var player = _.last(ctxt.result);
        player.lists = listsService.add(player.lists, list);
        ctxt.state = DEFAULT_STATE;
      }
      
      var BASE_STATE = {
        onParam: function(ctxt, key, value) {
          pushError(ctxt, ' parameter "'+key+'"="'+s.truncate(value, 8)+
                    '" ignored');
        },
        onSeparator: function(ctxt) {
        },
        onLine: function(ctxt, line) {
          pushError(ctxt, 'ignored : '+s.truncate(line, 15));
        }
      };

      var ERROR_STATE = _.defaults({
        onParam: function(ctxt, key, value) {
        },
        onSeparator: function(ctxt) {
          ctxt.state = DEFAULT_STATE;
        },
        onLine: function(ctxt, line) {
        }
      }, BASE_STATE);

      var DEFAULT_STATE = _.defaults({
        onParam: function(ctxt, key, value) {
          switch(key) {
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
      }, BASE_STATE);

      var PLAYER_STATE = _.defaults({
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
      }, BASE_STATE);
      
      var LIST_STATE = _.defaults({
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
      }, BASE_STATE);

      var LIST_CONTENT_STATE = _.defaults({
        onSeparator: LIST_STATE.onSeparator,
        onParam: function(ctxt, key, value, line) {
          LIST_CONTENT_STATE.onLine(ctxt, line);
        },
        onLine: function(ctxt, line) {
          ctxt.list.content.push(line);
        }
      }, BASE_STATE);

      return fkParserService;
    }
  ]);
