describe('Test Cron Service', function () {
    var interval, factory, q;

    beforeEach(function () {
        module('pm.commonModule');

        inject(function ($injector) {
            interval = $injector.get('$interval');
            factory = $injector.get('pm.common.cronService');
            q = $injector.get('$q');
        });
    });

    // Testing if functions exist
    it('Exist function put', function () {
        expect(angular.isFunction(factory.put)).toBe(true);
    });
    it('Exist function isCronExists', function () {
        expect(angular.isFunction(factory.isCronExists)).toBe(true);
    });
    it('Exist function cancel', function () {
        expect(angular.isFunction(factory.cancel)).toBe(true);
    });

    //factory.put
    it('Function put throw error cause key not string', function () {
        expect(function () {
            factory.put(1245);
        }).toThrow();
    });
    it('Function put throw error cause key.length == 0', function () {
        expect(function () {
            factory.put('');
        }).toThrow();
    });
    it('Function put throw error cause key not exist', function () {
        expect(function () {
            factory.put('');
        }).toThrow();
    });
    it('Function put throw error cause promise not defined', function () {
        expect(function () {
            factory.put('blabla');
        }).toThrow();
    });

    //factfactory.isCronExists
    it('Function isCronExists return false', function () {
        expect(factory.isCronExists("blablacar")).toBe(false);
    });

    it('Function isCronExists return true', function () {
        factory.put("blablacar", q.when());
        expect(factory.isCronExists("blablacar")).toBe(true);
    });

    //facfactory.cancel
    it('Function cancel throw error cause key not string', function () {
        expect(function () {
            factory.cancel(12);
        }).toThrow();
    });
    it('Function cancel throw error cause key.length == 0', function () {
        expect(function () {
            factory.cancel('');
        }).toThrow();
    });
    it('Function cancel throw error cause key not exist', function () {
        expect(function () {
            factory.cancel('JeanBon');
        }).toThrow();
    });
    it('Function cancel return true', function () {
        var sum = 0;
        var _intervalPromise = interval(function () {
            sum += 15;
        }, 50, 3000, false);
        factory.put("blob", _intervalPromise);
        expect(factory.cancel("blob")).toBe(true);
    });
    it('Function cancel throw error cause not string', function () {
        var _intervalPromise = interval(function () {
            sum += 15;
        }, 50, 3000, false);
        expect(function () {
            factory.put(3, _intervalPromise);
        }).toThrow();
    });
    it('Function cancel throw error cause key.length == 0', function () {
        var _intervalPromise = interval(function () {
            sum += 15;
        }, 50, 3000, false);
        expect(function () {
            factory.put('', _intervalPromise);
        }).toThrow();
    });
    it('Function cancel throw error cause key undefined', function () {
        var _intervalPromise = interval(function () {
            sum += 15;
        }, 50, 3000, false);
        expect(function () {
            factory.put(undefined, _intervalPromise);
        }).toThrow();
    }); 
    it('Function cancel return false', function () {
       var _intervalPromise = q.when();
       factory.put("blob", _intervalPromise);
       expect(factory.cancel("blob")).toBe(false);
    });
});