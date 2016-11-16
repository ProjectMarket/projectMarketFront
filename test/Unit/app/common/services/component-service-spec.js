describe('Test Component Service', function () {
    var q, logService, componentsSecurityValue, factory, $rootScope;
    ;

    beforeEach(function () {
        module('pm.commonModule');

        inject(function ($injector, _$rootScope_) {
            $rootScope = _$rootScope_;
            q = $injector.get('$q');
            componentsSecurityValue = $injector.get('pm.common.componentsSecurityValue');
            logService = $injector.get('pm.common.logService');
            factory = $injector.get('pm.common.componentService');
        });
    });

    describe('Component service test', function () {

        it('Check if function getComponentSecurityConfig exist', function () {

            expect(angular.isFunction(factory.getComponentSecurityConfig)).toBe(true);
        });

        it('function getComponentSecurityConfig is rejected when component is unknow', function () {

            console.log("Valeur getComponenetSecurityConfig !!!!!!!!!!!!!!!!!: ", factory.getComponentSecurityConfig("componentUndefined"));
            expect(function () {
                factory.getComponentSecurityConfig(undefined);
            }).toThrow();

            var promise = factory.getComponentSecurityConfig("unknownComponent");

            var resolved = false;

            promise.then(function (value) {

                resolved = true;
            }, function (error) {

            });
            $rootScope.$digest();
            expect(resolved).toBe(false);

        });
        it('function getComponentSecurityConfig check if fonction return object', function () {

            var promise = factory.getComponentSecurityConfig("pm.core.homeComponent");
            promise.then(function (value) {

                expect(angular.isObject(value)).toBe(true);

            }, function (error) {

            });
            $rootScope.$digest();

        });
        it('function getComponentSecurityConfig check if (isProtected) and (crudOjects) are defined in the promise', function () {

            var promise = factory.getComponentSecurityConfig("pm.core.homeComponent");
            promise.then(function (value) {

                expect(angular.isDefined(value.isProtected)).toBe(true);
                expect(angular.isDefined(value.crudObjects)).toBe(true);

            }, function (error) {

            });
            $rootScope.$digest();

        });

        it('function getComponentSecurityConfig is resolved if (Component.isProtected) is boolean and (Component.crudObjet) is array ', function () {

            var promise = factory.getComponentSecurityConfig("pm.core.homeComponent");

            var resolved = false;

            promise.then(function (value) {

                expect(value.isProtected).toBe(false || true);
                expect(angular.isArray(value.crudObjects)).toBe(true);

                resolved = true;
            }, function (error) {

            });
            $rootScope.$digest();
            expect(resolved).toBe(true);
        });




    });
});