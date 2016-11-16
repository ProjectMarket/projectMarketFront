describe('Test Cokie Service', function () {
    var cookies, logService, configService, factory;
    beforeEach(function () {
        module('pm.commonModule');
        inject(function ($injector) {
            cookies = $injector.get('$cookies');
            configService = $injector.get('pm.common.configService');
            logService = $injector.get('pm.common.logService');
            factory = $injector.get('pm.common.cookieService');
        });
    });
    // Testing if functions exist
    it('Exist function get', function () {
        expect(angular.isFunction(factory.get)).toBe(true);
    });
    it('Exist function put', function () {
        expect(angular.isFunction(factory.put)).toBe(true);
    });
    it('Exist function remove', function () {
        expect(angular.isFunction(factory.remove)).toBe(true);
    });
    it('Exist function clean', function () {
        expect(angular.isFunction(factory.clean)).toBe(true);
    });
    // factory.get
    it('function get return undefined cause no data exist in cache', function () {
        expect(factory.get("toto")).toEqual(undefined);
    });
    it('function get without param return undefined', function () {
        expect(factory.get()).toEqual(undefined);
    });
    //factory.put
    it('function put send data to cookies & get return data', function () {
        factory.put("toto", "blibli");
        expect(factory.get("toto", "blibli")).toEqual("blibli");
    });
    it('function put send data not string throw error', function () {
        expect(function () {
            factory.put(1, 2);
        }).toThrow();
    });
    it('function put send nothing to cookies throw new error', function () {
        expect(function () {
            factory.put();
        }).toThrow();
    });
    // factory.remove
    it('function remove erase data to cache & get return undefined', function () {
        factory.put("toto", "2");
        factory.remove("toto");
        expect(factory.get("toto")).toEqual(undefined);
    });
    it('function remove throw error cause no namespace', function () {
        factory.put("toto", "2");
        expect(function () {
            factory.remove();
        }).toThrow();
    });
    //factory.clean
    it('function clean erase all data and get return undefined', function () {
        factory.put("toto", "2");
        factory.clean();
        expect(factory.get("toto")).toEqual(undefined);
    });
});