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
          // skip col headers
              .rest()
              .filter(_.complement(s.isBlank))
              .mapWith(CSVToArray)
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
                  name: s.capitalize(s.trim(line[3])),
                  origin: line[5],
                };
                _.each(t3_factions_map, function(faction, t3_name) {
                  if(s.include(line[4], t3_name)) {
                    player.faction = faction;
                  }
                });
                return player;
              })
              .map(function(player) {
                return playerService.create({ name: player.name,
                                              faction: player.faction,
                                              origin: player.origin });
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
	    function CSVToArray(strData){
        if(s.isBlank(strData)) return [];

		    var strDelimiter = ';';
		    var arrData = [];
		    // Keep looping over the regular expression matches
		    // until we can no longer find a match.
		    var csvPattern = new RegExp(
			    (
				    // Delimiters.
				    "(\\;|\\r?\\n|\\r|^)" +
				      // Quoted fields.
				      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				      // Standard fields.
				      "([^\"\\;\\r\\n]*))"
			    ),
			    "gi"
			  );
        var arrMatches = csvPattern.exec(strData);
		    while(_.exists(arrMatches)) {
          var strMatchedValue;
			    // let's check to see which kind of value we
			    // captured (quoted or unquoted).
			    if(arrMatches[2]) {
				    // We found a quoted value. When we capture
				    // this value, unescape any double quotes.
				    strMatchedValue = arrMatches[2].replace(/\"\"/g, '"');
			    }
          else {
				    // We found a non-quoted value.
				    strMatchedValue = arrMatches[3];
			    }
			    arrData.push(strMatchedValue);
          arrMatches = csvPattern.exec(strData);
		    }
		    return arrData;
	    }
      return t3Parser;
    }
  ]);
