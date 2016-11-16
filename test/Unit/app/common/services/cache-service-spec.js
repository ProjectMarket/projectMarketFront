describe('Test Cache Service', function () {
    var interval, logService, configService, cronService, momentService, factory;

    beforeEach(function () {
        module('pm.commonModule');

        inject(function ($injector) {
            interval = $injector.get('$interval');
            configService = $injector.get('pm.common.configService');
            cronService = $injector.get('pm.common.cronService');
            momentService = $injector.get('pm.common.momentService');
            logService = $injector.get('pm.common.logService');
            factory = $injector.get('pm.common.cacheService');
        });
    });

//    beforeEach(function (done) {
//        setTimeout(function () {
//            done();
//        }, 800);
//    });
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
    it('Exist function removeAll', function () {
        expect(angular.isFunction(factory.removeAll)).toBe(true);
    });
    it('Exist function clean', function () {
        expect(angular.isFunction(factory.clean)).toBe(true);
    });

    // factory.get
    it('function get return undefined cause no data exist in cache', function () {
        expect(factory.get("toto", "test")).toEqual(undefined);
    });

    it('function get without param return undefined', function () {
        factory.put("toto", "blibli", "data of test", 6);
        expect(factory.get()).toEqual(undefined);
    });

    //factory.put
    it('function put without param return undefined', function () {
        expect(function () {
            factory.put();
        }).toThrow();
    });

    it('function put send data to cache & get return data', function () {
        factory.put("toto", "blibli", "data of test", 6);
        expect(factory.get("toto", "blibli")).toEqual("data of test");
    });

    it('function put send data undefined throw error', function () {
        expect(factory.put("toto", "2", undefined, undefined)).toBe(false);
    });

    it('function put send data to cache & get return undefined cause namespace undefined', function () {
        expect(function () {
            factory.put(undefined, "2", "data of test", 6);
        }).toThrow();
    });

    // factory.remove
    it('function remove erase data to cache & get return undefined', function () {
        factory.put("toto", "2", "data of test", 6000);
        factory.remove("toto", "2");
        expect(factory.get("toto", "2")).toEqual(undefined);
    });

    // factory.removeAll
    it('function removeAll erase all data & all get return undefined', function () {
        factory.put("toto", "2", "data of test", 6);
        factory.put("toto", "3", "data of testing", 6);
        factory.removeAll();

        expect(factory.get("toto", "2")).toEqual(undefined);
    });

    //factory.clean
    it('function clean erase data after 1s and get return undefined', function () {
        factory.put("toto", "2", "data of test", 1);
        setTimeout(function () {
            factory.clean();
            expect(factory.get("toto", "2")).toEqual(undefined);
        }, 3000);
    });
});