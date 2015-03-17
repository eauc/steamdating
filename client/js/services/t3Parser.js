'use strict';

angular.module('srApp.services')
  .factory('t3Parser', [
    'player',
    function(playerService) {
      var t3ParserService = {
        parse: function(base_factions, string) {
          var t3_factions_map = R.reduce(function(mem, faction) {
            mem[faction.t3] = faction.name;
            return mem;
          }, {}, R.values(base_factions));

          var ctxt = {
            errors: [],
            names: []
          };

          var res = R.pipe(
            s.lines,
            // skip col headers
            R.tail,
            R.filter(R.not(s.isBlank)),
            R.map(CSVToArray),
            R.filterIndexed(function(line, line_index) {
              // we skipped first line, so we restore line number by adding 2 instead of 1
              ctxt.line_number = line_index+2;
              var validations = R.map(function(validator) {
                return validator(line, ctxt);
              }, validators);
              return R.all(R.identity, validations);
            }),
            R.map(function(line) {
              var player = {
                name: s.capitalize(s.trim(line[3])),
                origin: line[5],
              };
              R.forEach(function(t3_name) {
                if(s.include(line[4], t3_name)) {
                  player.faction = t3_factions_map[t3_name];
                }
              }, R.keys(t3_factions_map));
              return player;
            }),
            R.map(function(player) {
              return playerService.create({ name: player.name,
                                            faction: player.faction,
                                            origin: player.origin
                                          });
            })
          )(string);
          
          return [res, ctxt.errors];
        }
      };
      var validators = [
        validateFields,
        validateNameNotEmpty,
        validateNameNotAlready
      ];
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
        var ok = ( 0 > R.indexOf(s.trim(line[3]), ctxt.names) );
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
		    while(!R.isNil(arrMatches)) {
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

      R.curryService(t3ParserService);
      return t3ParserService;
    }
  ]);
