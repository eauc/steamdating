'use strict';

angular.module('srApp.services')
  .factory('fkParser', [
    'player',
    'list',
    'lists',
    function(player,
             list,
             lists) {
      var base_state = {
        onParam: function(ctxt, key, value) {
          ctxt.error.push('line '+ctxt.nline+
                          ' parameter "'+key+'"="'+s.truncate(value, 8)+
                          '" ignored');
        },
        onSeparator: function(ctxt) {
        },
        onLine: function(ctxt, line) {
          ctxt.error.push('line '+ctxt.nline+
                          ' ignored : '+s.truncate(line, 15));
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
              if(s.isBlank(value)) {
                ctxt.error.push('line '+ctxt.nline+' empty player name');
                ctxt.player = null;
                ctxt.state = error_state;
                return;
              }
              if(0 <= _.indexOf(ctxt.players, value)) {
                ctxt.error.push('line '+ctxt.nline+' player name "'+value+'" already exists');
                ctxt.player = null;
                ctxt.state = error_state;
                return;
              }
              // console.log('new player', value);
              ctxt.players.push(value);
              ctxt.player = { name: value };
              ctxt.state = player_state;
              return;
            }
          case 'System':
            {
              if(!_.exists(ctxt.player)) {
                ctxt.error.push('line '+ctxt.nline+' unexpected list definition');
                ctxt.state = error_state;
                return;
              }
              // console.log('new list for player', ctxt.player.name);
              ctxt.list = { content: [], faction: ctxt.player.faction };
              ctxt.state = list_state;
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
              // console.log('faction', value);
              // console.log('factions', _.keys(ctxt.factions));
              if(0 > _.indexOf(_.keys(ctxt.factions), value)) {
                ctxt.error.push('line '+ctxt.nline+' unknown faction "'+value+'"');
              }
              ctxt.player.faction = value;
              return;
            }
          case 'City':
            {
              // console.log('city', value);
              ctxt.player.city = value;
              return;
            }
          default:
            {
              base_state.onParam(ctxt, key, value);
            }
          }
        },
        onSeparator: function(ctxt) {
          // console.log('create player', ctxt.player.name);
          ctxt.res.push(player.create(ctxt.player.name,
                                      ctxt.player.faction,
                                      ctxt.player.city));
          ctxt.state = default_state;
        }
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
        onSeparator: function(ctxt) {
          // console.log('create list for player', ctxt.player.name);
          var l = list.create(ctxt.list.faction,
                              ctxt.list.caster,
                              ctxt.list.theme,
                              ctxt.list.content.join('\n'));
          var p = _.last(ctxt.res);
          p.lists = lists.add(p.lists, l);
          ctxt.state = default_state;
        },
        onLine: function(ctxt, line) {
          // console.log('searching caster', line);
          var caster = _.chain(ctxt.factions)
            .getPath(ctxt.list.faction)
            .getPath('casters')
            .reduce(function(mem, c, key) {
              // console.log('caster', key, c);
              return _.exists(mem) ? mem : (s.startsWith(line, c.name) ? key : null);
            }, null)
            .value();
          if(!_.exists(caster)) {
            caster = line.replace(/\(.*\)/, '');
            ctxt.error.push('line '+ctxt.nline+' unknown caster "'+caster+'"');
          }
          // console.log('found caster', caster);
          ctxt.list.caster = caster;
          ctxt.list.content.push(line);
          ctxt.state = list_content_state;
        }
      }, base_state);
      var list_content_state = _.defaults({
        onSeparator: list_state.onSeparator,
        onLine: function(ctxt, line) {
          ctxt.list.content.push(line);
        }
      }, base_state);
      function isParam(line) {
        return s.include(line, ':');
      }
      return {
        parse: function(string, factions) {
          var ctxt = {
            factions: factions,
            state: default_state,
            res: [],
            error: [],
            players: []
          };
          _.chain(string)
            .apply(s.lines)
            .cat('')
            .each(function(line, i) {
              // console.log('--', line);
              ctxt.nline = i+1;
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
            })
            .value();
          console.log('res', ctxt.res);
          return [ctxt.res, ctxt.error];
        }
      };
    }
  ]);
