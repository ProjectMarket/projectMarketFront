/** 
 * Service d'encapsulation du nouveau router d'Angular
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.routerService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$window',
                '$q',
                '$rootRouter',
                '$injector',
                '$timeout',
                'pm.common.configService',
                'pm.common.cookieService',
                'pm.common.logService',
                'pm.common.componentService',
                function (
                        $window,
                        $q,
                        $rootRouter,
                        $injector,
                        $timeout,
                        pmConfig,
                        pmCookie,
                        pmLog,
                        pmComponent
                        ) {

                    pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

                    //********************
                    // Propriétés privées
                    //********************
                    /*
                     * @property {object} Config
                     */
                    var _config = pmConfig.get();

                    /*
                     * @property {object} pm.common.authService
                     */
                    var _pmAuth;

                    /*
                     * @property {object} accès uniquement en interne
                     */
                    var _internalAccess = {};

                    /*
                     * @property {boolean} Une redirection est-elle en cours ?
                     */
                    var _hasPendingRedirect = false;


                    //********************
                    // Méthodes privées
                    //********************

                    /*
                     * Renvoie pm.common.authService
                     * 
                     * @return {object} pm.common.authService
                     */
                    var _getpmAuth = function () {
                        if (_pmAuth === undefined) {
                            _pmAuth = $injector.get('pm.common.authService');
                        }
                        return _pmAuth;
                    };


                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Gère les autorisations d'accès aux components
                         * 
                         * @param {string} component
                         * @return {object} Promise
                         */
                        canActivate: function (component) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "canActivate", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "canActivate"});

                            var deferred = $q.defer(),
                                    componentSecurityConfig = {};

                            $q.when()
                                    .then(function () {
                                        try {
                                            return pmComponent.getComponentSecurityConfig(component);
                                        } catch (e) {
                                            _factory.navigateToErrorPage('acl', 'configError');
                                            return $q.reject();
                                        }
                                    })
                                    .then(function (config) {
                                        componentSecurityConfig = config;

                                        // authentification
                                        // pas d'authentification quand le component n'est pas protégé
                                        var pmAuth = _getpmAuth();
                                        if (componentSecurityConfig.isProtected === false) {
                                            pmLog.trace({message: "Componant {{component}} non protégé.",
                                                params: {component: component}, tag: "$canActivate", object: objectName, method: "canActivate"});
                                            pmAuth.connect();
                                            return $q.when();
                                        }

                                        
                                        return pmAuth.connect();
                                    })
                                    .then(function () {
                                        pmLog.trace({message: "Navigation autorisée par $canActivate.", tag: "$canActivate", object: objectName, method: "canActivate"});
                                        deferred.resolve(true);
                                    })
                                    .catch(function () {
                                        pmLog.info({message: "Navigation interdite par $canActivate.", tag: "$canActivate", object: objectName, method: "canActivate"});
                                        deferred.resolve(false);
                                    });

                            return deferred.promise;

                        },
                        /*
                         * Affecte l'url demandée
                         * 
                         * @param {array} linkParams
                         * @return {void}
                         */
                        setLastRequestedUrl: function (linkParam) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "setLastRequestedUrl", tag: "methodEntry"});
                            pmLog.info({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "setLastRequestedUrl"});
                            $rootRouter.pmLastRequestedUrl = _factory.getUrlByLinkParams(linkParam);
                        },
                        /*
                         * Renvoie l'url demandée
                         * 
                         * @return {string}
                         */
                        getLastRequestedUrl: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getLastRequestedUrl", tag: "methodEntry"});

                            var url = $rootRouter.pmLastRequestedUrl || $rootRouter.lastNavigationAttempt;
                            return url !== '/logout' ? url : '/home';
                        },
                        /*
                         * Renvoie l'url en fonction d'un DSL
                         * 
                         * @param {array} linkParams
                         * @return {string}
                         */
                        getUrlByLinkParams: function (linkParams) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getUrlByLinkParams", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "getUrlByLinkParams"});

                            return angular.stringifyInstruction($rootRouter.generate(linkParams));
                        },
                        /*
                         * Navigue vers le DSL demandé
                         * 
                         * @param {array} linkParams DSL (voir ComponentRouter.navigate())
                         * @return {void}
                         */
                        navigate: function (linkParams) {
                            if (_hasPendingRedirect) {
                                return;
                            }
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "navigate", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "navigate"});

                            // FIXME supprimer le timeout une fois le bug templateUrl corrigé
                            $timeout(function () {
                                $rootRouter.navigate(linkParams);
                            }, 0);
                        },
                        /*
                         * Navigue vers l'URL demandée
                         * 
                         * @param {string} url
                         * @return {void}
                         */
                        navigateByUrl: function (url) {
                            if (_hasPendingRedirect) {
                                return;
                            }

                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "navigateByUrl", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "navigateByUrl"});

                            // FIXME supprimer le timeout une fois le bug templateUrl corrigé
                            $timeout(function () {
                                $rootRouter.navigateByUrl(url);
                            }, 0);
                        },
                        /*
                         * Renavigue
                         * 
                         * @return {void}
                         */
                        renavigate: function () {
                            if (_hasPendingRedirect) {
                                return;
                            }

                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "renavigate", tag: "methodEntry"});

                            // FIXME supprimer le timeout une fois le bug templateUrl corrigé
                            $timeout(function () {
                                $rootRouter.renavigate();
                            }, 0);

                        },
                        /*
                         * Navigue vers la page d'erreur
                         * 
                         * @param {string} errorType
                         * @param {string} errorCode
                         * @return {void}
                         */
                        navigateToErrorPage: function (errorType, errorCode) {
                            if (_hasPendingRedirect) {
                                return;
                            }

                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "navigateToErrorPage", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "navigateToErrorPage"});

                            _internalAccess = {
                                type: errorType,
                                code: errorCode
                            };

                            // FIXME supprimer le timeout une fois le bug templateUrl corrigé
                            $timeout(function () {
                                $rootRouter.navigate(['Core.error', _internalAccess]);
                            }, 0);
                        },
                        /*
                         * Fait une redirection HTTP vers le linkParams demandé
                         * 
                         * @param {array} linkParams
                         * @param {boolean} withInternalAccess 
                         * @return {void}
                         */
                        destroySessionAndRedirectHTTP: function (linkParams, withInternalAccess) {
                            // interdit une navigation ultérieure
                            _hasPendingRedirect = true;

                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "destroySessionAndRedirectHTTP", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "destroySessionAndRedirectHTTP"});

                            pmCookie.clean();
                            if (withInternalAccess === true || withInternalAccess === undefined) {
                                pmCookie.put('internalAccessOnly', linkParams);
                            }

                            $window.location.href = _config.baseHref + angular.stringifyInstruction($rootRouter.generate(linkParams));
                        },
                        /*
                         * Vérifie si l'internalAccess a bien été valorisé et le réinitialise
                         * 
                         * @param {string} type
                         * @param {string} code
                         * @return {boolean}
                         */
                        checkInternalAccess: function (type, code) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "checkInternalAccess", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "checkInternalAccess"});

                            var internalAccess = _internalAccess;
                            // réinitialisation de l'internalAccess
                            _internalAccess = {};

                            if (type === undefined || code === undefined) {
                                pmLog.info({message: "Accès refusé lors du checkInternalAccess : type et/ou code sont undefined.",
                                    tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                                return false;
                            }

                            if (internalAccess.type === type && internalAccess.code === code) {
                                pmLog.debug({message: "Accès autorisé lors du checkInternalAccess.",
                                    tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                                return true;
                            }

                            // pas de données en mémoire => vérification en cookie
                            var internalAccessOnlyCookie = pmCookie.get('internalAccessOnly');
                            pmCookie.remove('internalAccessOnly');
                            if (internalAccessOnlyCookie === undefined) {
                                pmLog.info({message: "Accès refusé lors du checkInternalAccess : le cookie n'est pas valorisé.",
                                    tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                                return false;
                            }
                            // on parse le linkParams jusqu'à trouver le tableau de paramètres qui le fait bien
                            for (var i = 0; i < internalAccessOnlyCookie.length; i++) {
                                if (internalAccessOnlyCookie[i].type === type && internalAccessOnlyCookie[i].code === code) {
                                    pmLog.debug({message: "Accès autorisé lors du checkInternalAccess.",
                                        tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                                    return true;
                                }
                            }
                            pmLog.info({message: "Accès refusé lors du checkInternalAccess : type et/ou code ne correspondent pas à ceux du cookie.",
                                tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                            return false;
                        }
                    };
                    return _factory;
                }]
                    );
// fin IIFE
})();