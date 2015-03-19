'use strict';

angular.module('srApp.services')
  .factory('bracket', [
    function() {
      var bracketService = {
        clear: function(length, bracket) {
          return R.repeat(undefined, length);
        },
        setLength: function(length, bracket) {
          bracket = R.defaultTo([], bracket);
          return ( bracket.length >= length ?
                   R.clone(bracket) :
                   R.concat(bracket,
                            R.repeat(undefined, length - bracket.length)
                           )
                 );
        },
        set: function(group_index, round_index, bracket) {
          bracket = bracketService.setLength(group_index+1, bracket);
          bracket[group_index] = ( R.exists(bracket[group_index]) ?
                                   bracket[group_index] :
                                   round_index
                                 );
          return bracket;
        },
        reset: function(group_index, bracket) {
          bracket = bracketService.setLength(group_index+1, bracket);
          bracket[group_index] = undefined;
          return bracket;
        },
        isBracketTournament: function(group_index, round_index, bracket) {
          bracket = bracketService.setLength(group_index+1, bracket);
          return ( R.exists(bracket[group_index]) &&
                   round_index >= bracket[group_index]
                 );
        },
        nbRounds: function(group_index, nb_rounds, bracket) {
          bracket = bracketService.setLength(group_index+1, bracket);
          return ( R.exists(bracket[group_index]) ?
                   nb_rounds - bracket[group_index] :
                   0
                 );
        },
        roundOf: function(group_index, group_size, round_index, bracket) {
          if(R.isNil(bracket[group_index])) return 'Not in bracket';
          
          var bracket_size = group_size >> (round_index - bracket[group_index] + 1);
          switch(bracket_size) {
          case 0:
            {
              return 'Ended';
            }
          case 1:
            {
              return 'Final';
            }
          case 2:
            {
              return 'Semi-finals';
            }
          case 4:
            {
              return 'Quarter-finals';
            }
          default:
            {
              return 'Round of '+bracket_size;
            }
          }
        }
      };

      R.curryService(bracketService);
      return bracketService;
    }
  ]);
