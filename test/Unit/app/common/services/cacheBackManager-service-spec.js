describe('Test cacheBackManager Service', function () {
    var q, log, cache, factory, handler;
    beforeEach(function () {
        module('pm.commonModule', 'pmApp');
        inject(function ($injector, _$rootScope_) {
            q = $injector.get('$q');
            log = $injector.get('pm.common.logService');
            cache = $injector.get('pm.common.cacheService');
            handler = $injector.get('pm.common.backComHandlerService');
            factory = $injector.get('pm.common.cacheBackManagerService');
        });
    });

    it('Function existent', function () {
        expect(angular.isFunction(factory.addConcatRequest)).toBe(true);
        expect(angular.isFunction(factory.read)).toBe(true);
    });

    it('lève une exception car le tableau en paramètre est undefined', function () {
        expect(function () {
            factory.addConcatRequest();
        }).toThrow();
    });
    
    it('lève une exception car le paramètre n\'est pas supérieur à 1', function () {
        expect(function () {
            factory.addConcatRequest(1);
        }).toThrow();
    });
    
    it('lève une exception car le paramètre n\'est pas un number', function () {
        expect(function () {
            factory.addConcatRequest('1');
        }).toThrow();
    });
    
    it('lève une exception car le tableau en paramètre est vide', function () {
        expect(function () {
            factory.addConcatRequest({});
        }).toThrow();
    });
    
    it('lève une exception car le tableau en paramètre est undefined', function () {
        expect(function () {
            factory.read();
        }).toThrow();
    });
});