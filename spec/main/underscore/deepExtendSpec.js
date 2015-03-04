'use strict';

describe('underscore', function() {

  describe('deepExtend', function() {

    it('should merge objects', function() {
      expect(_.deepExtend({
        a: 'toto',
        c: 'tata'
      }, null)).toEqual({
        a: 'toto',
        c: 'tata'
      });

      expect(_.deepExtend({
        a: 'toto',
        c: 'tata'
      }, undefined)).toEqual({
        a: 'toto',
        c: 'tata'
      });

      expect(_.deepExtend({
        a: 'toto',
        c: 'tata'
      }, {
        b: 'titi',
        c: 'tutu'
      })).toEqual({
        a: 'toto',
        b: 'titi',
        c: 'tutu'
      });

      expect(_.deepExtend({
        a: {
          aa: 'toto',
          ac: 'tata'
        }
      }, {
        a: {
          ab: 'titi',
          ac: 'tutu'
        }
      })).toEqual({
        a : {
          aa : 'toto',
          ab : 'titi',
          ac : 'tutu'
        }
      });
    });
    
  });

});
