describe('Test modelManager Service', function () {
    var q, log, cache, factory;
    beforeEach(function () {
        module('abx.commonModule', 'abxApp');
        inject(function ($injector, _$rootScope_) {
            q = $injector.get('$q');
            log = $injector.get('abx.common.logService');
            cache = $injector.get('abx.common.cacheBackManagerService');
            factory = $injector.get('abx.common.modelManagerService');
        });
    });

    it('Function existent', function () {
        expect(angular.isFunction(factory.addConcatRequest)).toBe(true);
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
});