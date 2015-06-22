'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('resultSheetsHtml', function() {

    var resultSheetsHtml;

    beforeEach(inject([
      'resultSheetsHtml',
      '$httpBackend',
      function(_resultSheetsHtml, $httpBackend) {
        resultSheetsHtml = _resultSheetsHtml;
        this.$httpBackend = $httpBackend;
        $httpBackend.when('GET', 'data/result_sheets/page.html')
          .respond('(pageTemplate {{sheets}})');
        $httpBackend.when('GET', 'data/result_sheets/sheet.html')
          .respond('(sheetTemplate {{players}} {{rounds}} {{lists}})');
        $httpBackend.when('GET', 'data/result_sheets/player.html')
          .respond('(playerTemplate {{name}} {{team}} {{faction}})');
        $httpBackend.when('GET', 'data/result_sheets/rounds.html')
          .respond('(roundsTemplate {{rounds}})'); 
        $httpBackend.when('GET', 'data/result_sheets/round_row.html')
          .respond('(roundRowTemplate {{index}} {{lists}})');
        $httpBackend.when('GET', 'data/result_sheets/lists.html')
          .respond('(listsTemplate {{headers}} {{casters}} {{themes}} {{lists}})');
        $httpBackend.when('GET', 'data/result_sheets/list_header.html')
          .respond('(listHeaderTemplate {{index}})');
        $httpBackend.when('GET', 'data/result_sheets/list_caster.html')
          .respond('(listCasterTemplate {{caster}})');
        $httpBackend.when('GET', 'data/result_sheets/list_theme.html')
          .respond('(listThemeTemplate {{theme}})');
        $httpBackend.when('GET', 'data/result_sheets/list_content.html')
          .respond('(listContentTemplate {{lines}})');
     }
    ]));

    afterEach(function() {
      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    describe('init()', function() {
      it('should request templates files', function() {
        this.$httpBackend.expectGET('data/result_sheets/page.html');
        this.$httpBackend.expectGET('data/result_sheets/sheet.html');
        this.$httpBackend.expectGET('data/result_sheets/player.html');
        this.$httpBackend.expectGET('data/result_sheets/rounds.html');
        this.$httpBackend.expectGET('data/result_sheets/round_row.html');
        this.$httpBackend.expectGET('data/result_sheets/lists.html');
        this.$httpBackend.expectGET('data/result_sheets/list_header.html');
        this.$httpBackend.expectGET('data/result_sheets/list_caster.html');
        this.$httpBackend.expectGET('data/result_sheets/list_theme.html');
        this.$httpBackend.expectGET('data/result_sheets/list_content.html');
        
        resultSheetsHtml.init();

        this.$httpBackend.flush();
      });
    });

    describe('generate(<players>)', function() {
      beforeEach(function() {
        resultSheetsHtml.init();
        this.$httpBackend.flush();

        this.players = [
          [ { name: 'p1', faction: 'f1', lists: [ { caster: 'c11', theme: 't11', fk: 'line1\nline2\n' },
                                                  { caster: 'c12', theme: null, fk: 'line3\nline4\n' }
                                                ] },
            { name: 'p2', faction: 'f2', lists: [ { caster: 'c21', theme: 't21', fk: 'line1\nline2\n' }
                                                ] },
          ],
          [
            { name: 'p3', faction: 'f3', lists: [ ] },
          ]
        ];
      });

      it('should generate result sheets', function() {
        expect(resultSheetsHtml.generate(this.players))
          .toBe('(pageTemplate '+
                '(sheetTemplate '+
                '(playerTemplate p1  f1) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)) '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate c11)(listCasterTemplate c12) '+
                '(listThemeTemplate t11)(listThemeTemplate ) '+
                '(listContentTemplate '+
                'line1<br />\r\n'+
                'line2<br />\r\n'+
                ')'+
                '(listContentTemplate '+
                'line3<br />\r\n'+
                'line4<br />\r\n'+
                ')'+
                '))'+
                '(sheetTemplate '+
                '(playerTemplate p2  f2) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)'+
                ') '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate c21)(listCasterTemplate ) '+
                '(listThemeTemplate t21)(listThemeTemplate ) '+
                '(listContentTemplate '+
                'line1<br />\r\n'+
                'line2<br />\r\n'+
                ')(listContentTemplate )'+
                '))'+
                '(sheetTemplate '+
                '(playerTemplate p3  f3) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)) '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate )(listCasterTemplate ) '+
                '(listThemeTemplate )(listThemeTemplate ) '+
                '(listContentTemplate )'+
                '(listContentTemplate )'+
                '))'+
                ')');
      });
    });

    describe('generate(<teams>)', function() {
      beforeEach(function() {
        resultSheetsHtml.init();
        this.$httpBackend.flush();

        this.players = [
          [
            { name: 't1', members: [
              { name: 'p1', faction: 'f1', lists: [ { caster: 'c11', theme: 't11', fk: 'line1\nline2\n' },
                                                    { caster: 'c12', theme: null, fk: 'line3\nline4\n' }
                                                  ] },
              { name: 'p2', faction: 'f2', lists: [ { caster: 'c21', theme: 't21', fk: 'line1\nline2\n' }
                                                  ] },
            ] }
          ],
          [
            { name: 't2', members: [
              { name: 'p3', faction: 'f3', lists: [ ] },
            ] }
          ]
        ];
      });

      it('should generate result sheets', function() {
        expect(resultSheetsHtml.generate(this.players))
          .toBe('(pageTemplate '+
                '(sheetTemplate '+
                '(playerTemplate p1 t1 f1) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)) '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate c11)(listCasterTemplate c12) '+
                '(listThemeTemplate t11)(listThemeTemplate ) '+
                '(listContentTemplate '+
                'line1<br />\r\n'+
                'line2<br />\r\n'+
                ')'+
                '(listContentTemplate '+
                'line3<br />\r\n'+
                'line4<br />\r\n'+
                ')'+
                '))'+
                '(sheetTemplate '+
                '(playerTemplate p2 t1 f2) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)'+
                ') '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate c21)(listCasterTemplate ) '+
                '(listThemeTemplate t21)(listThemeTemplate ) '+
                '(listContentTemplate '+
                'line1<br />\r\n'+
                'line2<br />\r\n'+
                ')(listContentTemplate )'+
                '))'+
                '(sheetTemplate '+
                '(playerTemplate p3 t2 f3) '+
                '(roundsTemplate '+
                '(roundRowTemplate 1 1 / 2)\r\n'+
                '(roundRowTemplate 2 1 / 2)\r\n'+
                '(roundRowTemplate 3 1 / 2)\r\n'+
                '(roundRowTemplate 4 1 / 2)\r\n'+
                '(roundRowTemplate 5 1 / 2)) '+
                '(listsTemplate '+
                '(listHeaderTemplate 1)(listHeaderTemplate 2) '+
                '(listCasterTemplate )(listCasterTemplate ) '+
                '(listThemeTemplate )(listThemeTemplate ) '+
                '(listContentTemplate )'+
                '(listContentTemplate )'+
                '))'+
                ')');
      });
    });
  });

});
