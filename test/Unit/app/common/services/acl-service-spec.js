describe('Test acl Service', function () {
    var q, logService, $rootScope, routerService, factory;
    beforeEach(function () {
        module('abx.commonModule', 'abxApp');
        inject(function ($injector, _$rootScope_) {
            $rootScope = _$rootScope_;
            q = $injector.get('$q');
            routerService = $injector.get('abx.common.routerService');
            logService = $injector.get('abx.common.logService');
            factory = $injector.get('abx.common.aclService');
        });
    });
    it('Vérifie si les trois fonctions du service ACL existent', function () {
        expect(angular.isFunction(factory.loadAcl)).toBe(true);
        expect(angular.isFunction(factory.isAllowedAccessToComponent)).toBe(true);
        expect(angular.isFunction(factory.isAllowedManageCrudObject)).toBe(true);
    });
    it('Si le composant n est pas protégé returne une prommesse avec une valeur true', function () {
        var resolved = false;
        var promise = factory.isAllowedAccessToComponent("abx.layoutComponent");
        promise.then(function (value) {
            resolved = true;
            expect(value).toBe(true);
        }, function (error) {

        });
        $rootScope.$digest();
        expect(resolved).toBe(true);
    });
    it('Si le composant est protégé mais qu il n y a aucun droit defini returne une prommesse avec une valeur true', function () {
        promise = factory.isAllowedAccessToComponent("abx.core.homeComponent");
        promise.then(function (value) {
            resolved = true;
            expect(value).toBe(true);
        }, function (error) {

        });
        $rootScope.$digest();
        expect(resolved).toBe(true);
    });
    it('Accès refusé à un crudObject car CrudObject n est pas de type string', function () {
        var boolean = factory.isAllowedManageCrudObject(8, 'READ');
        expect(boolean).toBe(false);
    });
    it('Accès refusé pour l action read car CrudObject n existe pas', function () {
        var boolean = factory.isAllowedManageCrudObject("unknow", 'READ');
        expect(boolean).toBe(false);
    });
    it('Accès refusé à un crudObject car CrudObject n est pas de type object pour l action update', function () {
        var boolean = factory.isAllowedManageCrudObject("test", 'update');
        expect(boolean).toBe(false);
    });
    it('Accès refusé pour l action  update car CrudObject n existe pas', function () {
        var boolean = factory.isAllowedManageCrudObject({test: 8}, 'update');
        expect(boolean).toBe(false);
    });
    it('Accès refusé pour l action actionInconnu car elle n existe pas', function () {
        var boolean = factory.isAllowedManageCrudObject("test", 'actionInconnu');
        expect(boolean).toBe(false);
    });
});