'use strict';

describe('service', function() {

  beforeEach(function() {
    module('srApp.services');
  });

  describe('factions', function() {

    var factions;
    var $httpBackend;
    var initBaseFactionsWith;

    beforeEach(inject([
      'factions',
      '$httpBackend',
      function(_factions,
               _$httpBackend) {
        factions = _factions;
        $httpBackend = _$httpBackend;
        initBaseFactionsWith = function(data) {
          $httpBackend.expectGET('/data/factions.json')
            .respond(200, data);
          factions.init();
          $httpBackend.flush();
        };
      }
    ]));

    describe('init()', function() {
      it('should download the list of base factions', function() {
        $httpBackend.expectGET('/data/factions.json')
          .respond(200);

        factions.init();

        $httpBackend.flush();
      });

      when('data is downloaded', function() {
        initBaseFactionsWith(['base_factions' ]);
      }, function() {
        it('should store the response', function() {
          expect(factions.baseFactions()).toEqual(['base_factions']);
        });
      });
    });

    describe('baseFation()', function() {
      when('data is not yet available', function() {
      }, function() {
        it('should return a promise', function() {
          expect(factions.baseFactions()).toBeAn('Object');
          expect(factions.baseFactions().then).toBeA('Function');
        });
      });

      when('data is available', inject(function($rootScope) {
        this.cbk = jasmine.createSpy('promise_callback');
        factions.baseFactions().then(this.cbk);

        initBaseFactionsWith(['base_factions' ]);

        $rootScope.$digest();
      }), function() {
        it('should resolve promise with data', function() {
          expect(this.cbk).toHaveBeenCalledWith(['base_factions']);
        });
      });
    });

    describe('iconFor(<f>)', function() {
      beforeEach(inject(function($rootScope) {
        initBaseFactionsWith({
          f1: { icon: 'i1.svg' },
          f2: { icon: undefined }
        });
      }));

      using([
        [ 'f'  , 'icon' ],
        [ 'f1' , 'data/icons/i1.svg' ],
        [ 'f2' , '' ], // icon is not defined
        [ 'f3' , '' ], // faction is not defined
      ], function(e, d) {
        it('should retrieve icon for faction <f> if it exists, '+d, function() {
          expect(factions.iconFor(e.f)).toBe(e.icon);
        });
      });
    });

    describe('hueFor(<f>)', function() {
      beforeEach(inject(function($rootScope) {
        initBaseFactionsWith({
          f1: { hue: ['hue1'] },
          f2: { hue: undefined }
        });
      }));

      using([
        [ 'f'  , 'hue'     ],
        [ 'f1' , ['hue1']  ],
        [ 'f2' , undefined ], // hue is not defined
        [ 'f3' , undefined ], // faction is not defined
      ], function(e, d) {
        it('should retrieve icon for faction <f> if it exists, '+d, function() {
          expect(factions.hueFor(e.f)).toEqual(e.hue);
        });
      });
    });

    describe('castersFor(<f>)', function() {
      beforeEach(inject(function($rootScope) {
        initBaseFactionsWith({
          f1: { casters: ['Caster1','Caster2'] },
          f2: { casters: undefined }
        });
      }));
      
      using([
        [ 'f'  , 'casters' ],
        [ 'f1' , ['Caster1','Caster2'] ],
        [ 'f2' , undefined ], // casters is not defined
        [ 'f3' , undefined ], // faction is not defined
      ], function(e, d) {
        it('should retrieve casters list for faction <f> if it exists, '+d, function() {
          expect(factions.castersFor(e.f)).toEqual(e.casters);
        });
      });
    });

    describe('casterNameFor(<f>)', function() {
      beforeEach(inject(function($rootScope) {
        initBaseFactionsWith({
          f1: { casters: { caster1: { name: 'Caster1Name' }, caster2: { name: 'Caster2Name' } } },
          f2: { casters: undefined }
        });
      }));
      
      using([
        [ 'f'  , 'c'       , 'name'        ],
        [ 'f1' , 'caster1' , 'Caster1Name' ],
        [ 'f1' , 'caster2' , 'Caster2Name' ],
        [ 'f1' , 'caster3' , undefined     ], // c is not defined
        [ 'f2' , 'caster1' , undefined     ], // casters are not defined
        [ 'f3' , 'caster1' , undefined     ], // f is not defined
      ], function(e, d) {
        it('should retrieve casters list for faction <f> if it exists, '+d, function() {
          expect(factions.casterNameFor(e.f, e.c)).toBe(e.name);
        });
      });
    });
  });

});
