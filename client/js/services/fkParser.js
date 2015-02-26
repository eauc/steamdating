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
            state: default_state,
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
                                    s(line).strRight(':').trim().value());
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
          ctxt.state = error_state;
          return;
        }
        if(0 <= _.indexOf(ctxt.players, name)) {
          pushError(ctxt, 'player name "'+name+'" already exists');
          ctxt.player = null;
          ctxt.state = error_state;
          return;
        }
        ctxt.players.push(name);
        ctxt.player = { name: name };
        ctxt.state = player_state;
      }
      function newList(ctxt) {
        if(!_.exists(ctxt.player)) {
          pushError(ctxt, 'unexpected list definition');
          ctxt.state = error_state;
          return;
        }
        ctxt.list = { content: [], faction: ctxt.player.faction };
        ctxt.state = list_state;
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
      function playerCity(ctxt, city) {
        ctxt.player.city = city;
      }
      function listCaster(ctxt, line) {
        var caster = _.chain(ctxt.factions)
            .getPath(ctxt.list.faction+'.casters')
            .findKey(function(caster) {
              return s.startsWith(line, caster.name);
            })
            .value();
        if(!_.exists(caster)) {
          caster = line.replace(/\(.*\)/, '');
          pushError(ctxt, 'unknown caster "'+line+'"');
        }
        ctxt.list.caster = caster;
        ctxt.list.content.push(line);
        ctxt.state = list_content_state;
      }
      function addPlayer(ctxt) {
        ctxt.result.push(playerService.create(ctxt.player.name,
                                              ctxt.player.faction,
                                              ctxt.player.city));
        ctxt.state = default_state;
      }
      function addPlayerList(ctxt) {
        var list = listService.create(ctxt.list.faction,
                                      ctxt.list.caster,
                                      ctxt.list.theme,
                                      ctxt.list.content.join('\n'));
        var player = _.last(ctxt.result);
        player.lists = listsService.add(player.lists, list);
        ctxt.state = default_state;
      }
      
      var base_state = {
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

      var error_state = _.defaults({
        onParam: function(ctxt, key, value) {
        },
        onSeparator: function(ctxt) {
          ctxt.state = default_state;
        },
        onLine: function(ctxt, line) {
        }
      }, base_state);

      var default_state = _.defaults({
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Player':
            {
              newPlayer(ctxt, value);
              return;
            }
          case 'System':
            {
              newList(ctxt);
              return;
            }
          default:
            {
              base_state.onParam(ctxt, key, value);
            }
          }
        }
      }, base_state);

      var player_state = _.defaults({
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Faction':
            {
              playerFaction(ctxt, value);
              return;
            }
          case 'City':
            {
              playerCity(ctxt, value);
              return;
            }
          default:
            {
              base_state.onParam(ctxt, key, value);
            }
          }
        },
        onSeparator: addPlayer
      }, base_state);
      
      var list_state = _.defaults({
        onParam: function(ctxt, key, value) {
          switch(key) {
          case 'Faction':
            {
              ctxt.list.theme = (value === ctxt.list.faction) ? null : value;
              return;
            }
          case 'Casters':
          case 'Points':
          case 'Tiers':
            { break; }
          default:
            {
              base_state.onParam(ctxt, key, value);
            }
          }
        },
        onSeparator: addPlayerList,
        onLine: listCaster
      }, base_state);

      var list_content_state = _.defaults({
        onSeparator: list_state.onSeparator,
        onLine: function(ctxt, line) {
          ctxt.list.content.push(line);
        }
      }, base_state);

      return fkParserService;
    }
  ]);
