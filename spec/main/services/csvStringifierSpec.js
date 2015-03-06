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
          [ ['Group 1'],
            [ 'field1', 'field2', 'field3' ],
            // subArray
            [ '11', ['12', '121'], 3 ],
            // undefined replaced by ''
            [ '21', undefined, 4 ] ],
          [ ['Group 2'],
            [ 'field4', 'field5' ],
            // null replaced by ''
            [ null, 'a' ],
            [ '2', 'b' ] ]
        ])).toBe('Group 1\r\n'+
                 'field1,field2,field3\r\n'+
                 '11,12 121,3\r\n'+
                 '21,,4\r\n'+
                 '\r\nGroup 2\r\n'+
                 'field4,field5\r\n'+
                 ',a\r\n'+
                 '2,b');
      });
    });
  });

});
