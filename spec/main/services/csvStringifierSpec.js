'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('csvStringifier', function() {

    var csvStringifier;

    beforeEach(inject([
      'csvStringifier',
      function(_csvStringifier, _player, _list) {
        csvStringifier = _csvStringifier;
      }
    ]));

    describe('stringify(<tables>)', function() {
      it('should convert <tables> to csv', function() {
        expect(csvStringifier.stringify([
          [ [ 'field1', 'field2', 'field3' ],
            [ '11', '12', 3 ],
            [ '21', '22', 4 ] ],
          [ [ 'field4', 'field5' ],
            [ '1', 'a' ],
            [ '2', 'b' ] ]
        ])).toBe('\r\nGroup 1\r\n'+
                 'field1,field2,field3\r\n'+
                 '11,12,3\r\n'+
                 '21,22,4\r\n'+
                 '\r\nGroup 2\r\n'+
                 'field4,field5\r\n'+
                 '1,a\r\n'+
                 '2,b');
      });
    });
  });

});
