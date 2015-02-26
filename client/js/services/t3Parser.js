'use strict';

angular.module('srApp.services')
  .factory('t3Parser', [
    'player',
    function(playerService) {
      var t3Parser = {
        parse: function(string, base_factions) {
          var t3_factions_map = _.reduce(base_factions, function(mem, faction) {
            mem[faction.t3] = faction.name;
            return mem;
          }, {});
          var ctxt = {
            errors: [],
            names: []
          };
          var res =_.chain(string)
              .apply(s.lines)
          // skip col names
              .rest()
              .filter(_.complement(s.isBlank))
              .mapWith(s.words, ';')
              .filter(function(line, line_index) {
                // we skipped first line, so we restore line number by adding 2 instead of 1
                ctxt.line_number = line_index+2;
                var validations = _.map(validators, function(validator) {
                  return validator(line, ctxt);
                });
                return _.all(validations);
              })
              .map(function(line) {
                var player = {
                  name: s.trim(line[3]),
                  city: line[5],
                };
                _.each(t3_factions_map, function(faction, t3_name) {
                  if(s.include(line[4], t3_name)) {
                    player.faction = faction;
                  }
                });
                return player;
              })
              .map(function(player) {
                return playerService.create(player.name,
                                            player.faction,
                                            player.city);
              })
              .value();
          return [res, ctxt.errors];
        }
      };
      function validateFields(line, ctxt) {
        var ok = (line.length === 10);
        if(!ok) {
          pushError(ctxt, 'invalid fields number ('+line.length+' expected 10)');
        }
        return ok;
      }
      function validateNameNotEmpty(line, ctxt) {
        var ok = (s.trim(line[3]).length > 0);
        if(!ok) {
          pushError(ctxt, 'empty player name');
        }
        return ok;
      }
      function validateNameNotAlready(line, ctxt) {
        var ok = (0 > _.indexOf(ctxt.names, s.trim(line[3])));
        if(!ok) {
          pushError(ctxt, 'player name "'+s.trim(line[3])+'" already exists');
        }
        else {
          ctxt.names.push(s.trim(line[3]));
        }
        return ok;
      }
      function pushError(ctxt, string) {
        ctxt.errors.push('line '+ctxt.line_number+' '+string);
      }
      var validators = [
        validateFields,
        validateNameNotEmpty,
        validateNameNotAlready
      ];
      return t3Parser;
    }
  ]);
