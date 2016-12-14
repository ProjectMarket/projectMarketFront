/** 
 * Service de gestion de la connexion et de la déconnexion de l'utilisateur
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, e */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.authService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$q',
                '$http',
                '$window',
                '$injector',
                '$rootScope',
                'pm.common.logService',
                'pm.common.configService',
                'pm.common.cookieService',
                'pm.common.userService',
                'pm.common.routerService',
                'pm.common.timeService',
                function (
                        $q,
                        $http,
                        $window,
                        $injector,
                        $rootScope,
                        pmLog,
                        pmConfig,
                        pmCookie,
                        pmUser,
                        pmRouter,
                        pmTime) {

                    pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});
                    //********************
                    // Propriétés privées
                    //********************

                    /*
                     * @property {boolean} L'user est-il complètement connecté ?
                     */
                    var _isConnected = false;
                    /*
                     * @property {string}
                     */
                    var _token = '';
                    /*
                     * @property {object} Config
                     */
                    var _config = pmConfig.get();
                    /*
                     * @property {integer} Timestamp de la dernière action
                     */
                    var _lastActionTimestamp = pmTime.moment().unix();

                    /*
                     * @property {object} pm.common.backComHandlerService
                     */
                    var _pmBackComHandler;


                    //********************
                    // Méthodes privées
                    //********************

                    /*
                     * Renvoie pm.common.backComHandlerService
                     * 
                     * @return {object} pm.common.backComHandlerService
                     */
                    var _getpmBackComHandler = function () {
                        if (_pmBackComHandler === undefined) {
                            // injection pour éviter des références circulaires
                            _pmBackComHandler = $injector.get('pm.common.backComHandlerService');
                        }
                        return _pmBackComHandler;
                    };

                    // Logs navigateur

                    /*
                     * Log les infos utiles du navigateur
                     * 
                     * @return {void} 
                     */
                    var _logNavigatorInfo = function () {
                        var nav = $window.navigator;
                        pmLog.info({message: "UserAgent : {{data}}", params: {data: nav.userAgent}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
                        pmLog.info({message: "TouchDevice : {{isTouch}}", params: {isTouch: isTouch}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "Oscpu : {{data}}", params: {data: nav.oscpu}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "Language : {{data}}", params: {data: nav.language}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "Languages : {{data}}", params: {data: nav.languages}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "CookieEnabled : {{data}}", params: {data: nav.cookieEnabled}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "ScreenSize : {{width}}x{{height}}", params: {width: $window.screen.width, height: $window.screen.height}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "WindowSize : {{width}}x{{height}}", params: {width: $(window).width(), height: $(window).height()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        pmLog.info({message: "DocumentSize : {{width}}x{{height}}", params: {width: $(document).width(), height: $(document).height()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                        // timestamp
                        pmLog.info({message: "Intervale de timestamp front / back : {{intervale}}", params: {intervale: pmLog.getFrontBackTimestampInterval()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
                    };


                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Indique si l'user est connecté
                         * 
                         * @return {boolean} 
                         */
                        isConnected: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "isConnected", tag: "methodEntry"});
                            return _isConnected;
                        },
                        /*
                         * Renvoie le token
                         * 
                         * @return {string} 
                         */
                        getToken: function () {
                            console.info(_token);
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getToken", tag: "methodEntry"});
                            return _token;
                        },
                        /*
                         * Connecte l'user
                         * 
                         * @return {object} Promise
                         */
                        connect: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "connect", tag: "methodEntry"});
                            var globalDeferred = $q.defer(),
                                    globalPromise = globalDeferred.promise;
                            // l'user est déjà connecté
                            if (_factory.isConnected()) {
                                pmLog.trace({message: "Utilisateur déjà connecté.", tag: "auth", object: objectName, method: "connect"});
                                globalDeferred.resolve();
                                _token = pmCookie.get('projectMarketToken');
                                return globalPromise;
                            }

                            // récupération du cookie
                            var token = pmCookie.get('projectMarketToken'),
                                    tokenDeferred = $q.defer(),
                                    tokenPromise = tokenDeferred.promise;
                            // pas de cookie
                            if (token !== undefined) {
                                pmLog.trace({message: "Token récupéré du cookie avec succès.", tag: "auth", object: objectName, method: "connect"});
                                tokenDeferred.resolve(token);
                            }

                            tokenPromise
                                    .then(function (result) {
                                        _token = result;
                                    })
                                    .then(function () {
                                        // promesse
                                        var userDeferred = $q.defer(),
                                                userDeferredPromise = userDeferred.promise;

                                        // requête du back
                                        pmLog.trace({message: "Requête pour récupérer l'userDetails depuis le backend.", tag: "auth", object: objectName, method: "connect"});

                                        var httpConfig = {headers: {
                                                "Authorization": "JWT " + _token
                                            }};

                                        $http.get(_config.backend.baseUrl + 'user/me', httpConfig)
                                                .then(function (response) {
                                                    pmLog.trace({message: "User récupéré du backend avec succès.", tag: "auth", object: objectName, method: "connect"});
                                                    pmUser.setUser(response.data);
                                                    userDeferred.resolve();
                                                })
                                                .catch(function (response) {
                                                    if (response.status === 401) {
                                                        pmLog.info({message: "Erreur 401 lors de la récupération de userDetails sur le backend.", tag: "auth", object: objectName, method: "connect"});
                                                        globalDeferred.reject("Erreur 401 lors de la récupération de userDetails sur le backend.");
                                                        pmCookie.remove("projectMarketToken");
                                                        pmRouter.navigate(['Home.home']);
                                                        return;
                                                    }

                                                    pmLog.error({message: "Erreur lors de la récupération du userDetails via le backend. Status : {{status}}, data : {{data}}}",
                                                        params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                                                    // redirection vers page d'erreur
                                                    pmRouter.navigate(['Home.home']);
                                                    userDeferred.reject("Erreur from back");
                                                    return userDeferredPromise;
                                                });
                                        return userDeferredPromise;
                                    })
                                    .then(function () {
                                        _isConnected = true;
                                        // émission de l'événement
                                        $rootScope.$broadcast(objectName + ':userConnected');

                                        pmLog.trace({message: "Connexion réalisée avec succès.", tag: "auth", object: objectName, method: "connect"});
                                        globalDeferred.resolve();
                                    })
                                    .catch(function (message) {
                                        pmLog.trace({message: "Connexion impossible. Message : {{message}}", params: {message: message},
                                            tag: "auth", object: objectName, method: "connect"});
                                        globalDeferred.reject(message);
                                    });
                            return globalPromise;
                        },
                        /*
                         * Login d'un User
                         * 
                         * @param {object} user {
                         *  email: {string},
                         *  password: {string}
                         * }
                         *      
                         * @param {undefined|string} redirectUrl
                         * @return {promise} 
                         */
                        login: function (user) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "login", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "login"});

                            var defer = $q.defer();

                            // suppression des cookies
                            pmCookie.clean();

                            $http.post(_config.backend.baseUrl + 'signin', user)
                                    .then(function (response) {
                                        if (response.status === 200) {
                                            pmCookie.put('projectMarketToken', response.data.token);
                                            pmUser.setUser(response.data.user);
                                            $rootScope.$broadcast(objectName + ':userConnected');
                                            _isConnected = true;
                                            defer.resolve();
                                        } else {
                                            return defer.reject();
                                        }
                                    })
                                    .catch(function () {
                                        return defer.reject();
                                    });

                            return defer.promise;

                        },
                        /*
                         * Déconnexion des serveurs backend et frontend
                         * 
                         * @return {boolean} user déjà connecté (sinon : redirection)
                         */
                        logout: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "logout", tag: "methodEntry"});
                            if (!_factory.isConnected()) {
                                pmLog.trace({message: "User déjà déconnecté.", tag: "auth", object: objectName, method: "logout"});
                                return true;
                            }
                            $rootScope.$broadcast(objectName + ':userDisconnected');
                            pmUser.removeUser();
                            pmCookie.clean();
                            pmRouter.navigate(['Home.home']);
                        },
                        /*
                         * Gère les erreurs 401
                         * 
                         * @param {string} errorCode
                         * @return {void} 
                         */
                        manage401: function (errorCode) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "manage401", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "manage401"});

                            // token incorrect
                            if (errorCode === 'bad-token') {
                                pmLog.info({message: "Erreur bad-token.", tag: "auth", object: objectName, method: "manage401"});
                                // redirection vers page d'erreur
                                pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'badToken'}]);
                                return;
                            }

                            // l'user était connecté : plus de session en backend => timeout ou déconnexion externe
                            if (_factory.isConnected()) {
                                pmLog.info({message: "Pas de session backend.", tag: "auth", object: objectName, method: "manage401"});
                                // redirection vers page d'erreur
                                pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'noSessionInBackend'}]);
                                return;
                            }

                            // l'user n'était pas connecté : login
                            pmLog.info({message: "Erreur 401 pour un user non connecté.", tag: "auth", object: objectName, method: "manage401"});
                            if (_config.isDevelopment === true) {
                                pmRouter.navigate(['Core.login', {relayPath: btoa(pmRouter.getLastRequestedUrl())}]);
                            } else {
                                // renvoi vers login
                                _factory.login(undefined, pmRouter.getLastRequestedUrl());
                            }
                        }
                    };

                    return _factory;
                }]
                    );
// fin IIFE
})();