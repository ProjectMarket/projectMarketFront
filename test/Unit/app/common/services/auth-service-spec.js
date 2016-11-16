describe('Test auth Service', function () {
    var q, interval, http, window, injector, location, configService, cronService, momentService,
            cookieService, logService, userService, routerService, $rootScope, factory;
    beforeEach(function () {
        module('abx.commonModule', 'abxApp');
        inject(function ($injector, _$rootScope_) {
            $rootScope = _$rootScope_;
            interval = $injector.get('$interval');
            q = $injector.get('$q');
            http = $injector.get('$http');
            window = $injector.get('$window');
            location = $injector.get('$location');
            injector = $injector.get('$injector');
            logService = $injector.get('abx.common.logService');
            configService = $injector.get('abx.common.configService');
            cronService = $injector.get('abx.common.cronService');
            cookieService = $injector.get('abx.common.cookieService');
            userService = $injector.get('abx.common.userService');
            routerService = $injector.get('abx.common.routerService');
            momentService = $injector.get('abx.common.momentService');
            factory = $injector.get('abx.common.authService');
        });
    });

    it('Vérifie si les fonctions du service AUTH existent', function () {
        expect(angular.isFunction(factory.isConnected)).toBe(true);
        expect(angular.isFunction(factory.getToken)).toBe(true);
        expect(angular.isFunction(factory.connect)).toBe(true);
        expect(angular.isFunction(factory.login)).toBe(true);
        expect(angular.isFunction(factory.logout)).toBe(true);
        expect(angular.isFunction(factory.fullLogout)).toBe(true);
        expect(angular.isFunction(factory.manage401)).toBe(true);
        expect(angular.isFunction(factory.ping)).toBe(true);
    });

    it('isConnected renvoie false car aucune connexion réalisée', function () {
        expect(factory.isConnected()).toBe(false);
    });
    it('isConnected renvoie true', function () {
        factory.connect();

        expect(factory.isConnected()).toBe(true);
    });
});