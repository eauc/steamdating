'use strict';

angular.module('srApp.services')
  .factory('t3Parser', [
    'player',
    function(player) {
      function validateFields(line, ctxt) {
        var ok = (line.length === 10);
        if(!ok) {
          ctxt.error.push('line '+ctxt.nline+
                          ' invalid fields number ('+line.length+' expected 10)');
        }
        return ok;
      }
      function validateNameNotEmpty(line, ctxt) {
        var ok = (s.trim(line[3]).length > 0);
        if(!ok) {
          ctxt.error.push('line '+ctxt.nline+' empty player name');
        }
        return ok;
      }
      function validateNameNotAlready(line, ctxt) {
        var ok = (0 > _.indexOf(ctxt.names, s.trim(line[3])));
        if(!ok) {
          ctxt.error.push('line '+ctxt.nline+
                          ' player name "'+s.trim(line[3])+'" already exists');
        }
        else {
          ctxt.names.push(s.trim(line[3]));
        }
        return ok;
      }
      var validators = [
        validateFields,
        validateNameNotEmpty,
        validateNameNotAlready
      ];
      return {
        parse: function(string, base_factions) {
          var factions = _.reduce(base_factions, function(mem, f) {
            mem[f.t3] = f.name;
            return mem;
          }, {});
          var ctxt = {
            error: [],
            names: []
          };
          var res =_.chain(string)
            .apply(s.lines)
            .rest()
            .filter(_.complement(s.isBlank))
            .mapWith(s.words, ';')
            .filter(function(line, i) {
              ctxt.nline = i+2;
              var validate = _.map(validators, function(v) {
                return v(line, ctxt);
              });
              return _.all(validate);
            })
            .map(function(line) {
              var obj = {
                name: s.trim(line[3]),
                city: line[5],
              };
              _.each(factions, function(f, t3_name) {
                if(s.include(line[4], t3_name)) {
                  obj.faction = f;
                }
              });
              return obj;
            })
            .map(function(o) {
              return player.create(o.name, o.faction, o.city);
            })
            .value();
          return [res, ctxt.error];
        }
      };
    }
  ]);
