'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('bbStringifier', function() {

    var bbStringifier;

    beforeEach(inject([
      'bbStringifier',
      function(_bbStringifier) {
        bbStringifier = _bbStringifier;
      }
    ]));

    describe('stringify(<tables>)', function() {
      it('should convert <tables> to bb code', function() {
        expect(bbStringifier.stringify([
          [ ['Group 1'],
            [ 'field1', 'field2', 'field3' ],
            // subArray
            [ '11', ['12', '121'], 3 ],
            // undefined replaced by ''
            [ '21', undefined, 4 ]
          ],
          [ ['Group 2'],
            [ 'field4', 'field5' ],
            // null replaced by ''
            [ null, 'a' ],
            // cell attributes
            [ //color
              { value: '2',
                color: 'blue'
              },
              // no attributes
              { value: 'b',
              }
            ]
          ]
        ])).toBe('[b]Group 1[/b]\r\n'+
                 '[table][tr][td][center][b]field1[/b][/center][/td][td][center][b]field2[/b][/center][/td][td][center][b]field3[/b][/center][/td][/tr]\r\n'+
                 '[tr][td][center]11[/center][/td][td][center]12\r\n121[/center][/td][td][center]3[/center][/td][/tr]\r\n'+
                 '[tr][td][center]21[/center][/td][td][center][/center][/td][td][center]4[/center][/td][/tr][/table]\r\n'+
                 '\r\n[b]Group 2[/b]\r\n'+
                 '[table][tr][td][center][b]field4[/b][/center][/td][td][center][b]field5[/b][/center][/td][/tr]\r\n'+
                 '[tr][td][center][/center][/td][td][center]a[/center][/td][/tr]\r\n'+
                 '[tr][td][center][color=blue]2[/color][/center][/td][td][center]b[/center][/td][/tr][/table]');
      });
    });
  });

});
