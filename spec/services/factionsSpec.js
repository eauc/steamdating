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
          $httpBackend.expectGET('data/factions.json')
            .respond(200, data);
          factions.init();
          $httpBackend.flush();
        };
      }
    ]));

    describe('init()', function() {
      it('should download the list of base factions', function() {
        $httpBackend.expectGET('data/factions.json')
          .respond(200);

        factions.init();

        $httpBackend.flush();
      });

      describe('when data is downloaded', function() {
        beforeEach(function() {
          initBaseFactionsWith(['base_factions' ]);
        });

        it('should store the response', function() {
          expect(factions.baseFactions()).toEqual(['base_factions']);
        });
      });
    });

    describe('baseFation()', function() {
      describe('when data has not yet available', function() {
        it('should return a promise', function() {
          expect(factions.baseFactions()).toBeAn('Object');
          expect(factions.baseFactions().then).toBeA('Function');
        });
      });

      describe('when data is available', function() {
        beforeEach(inject(function($rootScope) {
          this.cbk = jasmine.createSpy('promise_callback');
          factions.baseFactions().then(this.cbk);

          initBaseFactionsWith(['base_factions' ]);

          $rootScope.$digest();
        }));

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
      
      it('should retrieve icon for faction <f> if it exists', function() {
        expect(factions.iconFor('f1')).toBe('data/icons/i1.svg');
        // icon is not defined
        expect(factions.iconFor('f2')).toBe('');
        // faction is not defined
        expect(factions.iconFor('f3')).toBe('');
      });
    });

    describe('castersFor(<f>)', function() {
      beforeEach(inject(function($rootScope) {
        initBaseFactionsWith({
          f1: { casters: ['Caster1','Caster2'] },
          f2: { casters: undefined }
        });
      }));
      
      it('should retrieve casters list for faction <f> if it exists', function() {
        expect(factions.castersFor('f1')).toEqual(['Caster1','Caster2']);
        // casters is not defined
        expect(factions.iconFor('f2')).toBe('');
        // faction is not defined
        expect(factions.iconFor('f3')).toBe('');
      });
    });
  });

});
