describe('Test auth Service', function () {
    var q, interval, http, window, injector, location, configService, cronService, momentService,
            cookieService, logService, userService, routerService, $rootScope, factory;
    beforeEach(function () {
        module('pm.commonModule', 'pmApp');
        inject(function ($injector, _$rootScope_) {
            $rootScope = _$rootScope_;
            interval = $injector.get('$interval');
            q = $injector.get('$q');
            http = $injector.get('$http');
            window = $injector.get('$window');
            location = $injector.get('$location');
            injector = $injector.get('$injector');
            logService = $injector.get('pm.common.logService');
            configService = $injector.get('pm.common.configService');
            cronService = $injector.get('pm.common.cronService');
            cookieService = $injector.get('pm.common.cookieService');
            userService = $injector.get('pm.common.userService');
            routerService = $injector.get('pm.common.routerService');
            momentService = $injector.get('pm.common.momentService');
            factory = $injector.get('pm.common.authService');
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