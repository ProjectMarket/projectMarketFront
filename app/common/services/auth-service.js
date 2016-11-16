/** 
 * Service de gestion de la connexion et de la déconnexion de l'utilisateur
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: auth-service.js 646 2016-03-03 15:21:10Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.authService';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$interval',
        '$q',
        '$http',
        '$window',
        '$location',
        '$injector',
        '$rootScope',
        'pm.common.logService',
        'pm.common.configService',
        'pm.common.cronService',
        'pm.common.cookieService',
        'pm.common.userService',
        'pm.common.routerService',
        'pm.common.timeService',
        function(
            $interval,
            $q,
            $http,
            $window,
            $location,
            $injector,
            $rootScope,
            pmLog,
            pmConfig,
            pmCron,
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
          var _getpmBackComHandler = function() {
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
          var _logNavigatorInfo = function() {
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

          // Gestion du ping

          // modification du timestamp de la dernière action
          $(document).on('keypress mousedown touchstart', function() {
            _lastActionTimestamp = pmTime.moment().unix();
          });
          // CRON d'envoi du ping pour maintenir la session ouverte sur la backend
          // la méthode _ping décide de l'envoi au non au backend en fonction de la config
          var _intervalPromise = $interval(function() {
            _factory.ping();
          }, _config.auth.checkPingInterval, 0, false);
          // stockage en service
          pmCron.put('pmAuth-checkPingBackend', _intervalPromise);
          // initialisation du cookie si besoin
          var _initializePingCookie = function() {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_initializePingCookie", tag: "methodEntry"});
            if (pmCookie.get('ping') === undefined) {
              pmLog.trace({message: "Initialisation du cookie de ping vers le serveur backend.", object: objectName, method: "_initializePingCookie", tag: "auth"});
              pmCookie.put('ping', pmTime.moment().unix());
            }
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
            isConnected: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "isConnected", tag: "methodEntry"});
              return _isConnected;
            },
            /*
             * Renvoie le token
             * 
             * @return {string} 
             */
            getToken: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "getToken", tag: "methodEntry"});
              return _token;
            },
            /*
             * Connecte l'user
             * 
             * @return {object} Promise
             */
            connect: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "connect", tag: "methodEntry"});
              var globalDeferred = $q.defer(),
                  globalPromise = globalDeferred.promise;
              // l'user est déjà connecté
              if (_factory.isConnected()) {
                pmLog.trace({message: "Utilisateur déjà connecté.", tag: "auth", object: objectName, method: "connect"});
                globalDeferred.resolve();
                return globalPromise;
              }

              // récupération du cookie
              var token = pmCookie.get('token'),
                  tokenDeferred = $q.defer(),
                  tokenPromise = tokenDeferred.promise;
              // pas de cookie
              if (token === undefined) {
                // requête du back
                $http.get(_config.backend.baseUrl + 'session/connect')
                    .then(function(response) {
                      try {
                        // Erreur si l'objet n'existe pas (HTML au lieu de JSON par exemple)
                        token = response.data.Response.unitResponses[0].UnitResponse.objects[0].Token.token;
                        if (token === undefined || typeof token !== 'string') {
                          throw new Error("Erreur lors de la récupération du token via le backend.");
                        }
                      } catch (e) {
                        // redirection vers la page d'erreur
                        pmLog.error({message: "Erreur lors de la récupération du token via le backend. Status : {{status}}, data : {{data}}}",
                          params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                        pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                        return tokenDeferred.reject();
                      }

                      pmLog.trace({message: "Token récupéré du backend avec succès. Token = {{token}}",
                        params: {token: token}, tag: "auth", object: objectName, method: "connect"});
                      // affectation des cookies
                      pmCookie.put('token', token);
                      _initializePingCookie();
                      tokenDeferred.resolve(token);
                    })
                    .catch(function(response) {
                      if (response.status === 401) {
                        // si développement => navigation vers le composant Login
                        if (_config.isDevelopment === true) {
                          pmRouter.navigate(['Core.login', {relayPath: btoa(pmRouter.getLastRequestedUrl())}]);
                        } else {
                          // renvoi vers login
                          _factory.login(undefined, pmRouter.getLastRequestedUrl());
                        }
                        return tokenDeferred.reject('Erreur 401 lors de la récupération du token depuis le serveur backend.');

                      } else {
                        pmLog.error({message: "Erreur lors de la récupération du token via le backend. Status : {{status}}, data : {{data}}}",
                          params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                        // redirection vers page d'erreur
                        pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                        return tokenDeferred.reject();
                      }
                    });
              } else {
                pmLog.trace({message: "Token récupéré du cookie avec succès.", tag: "auth", object: objectName, method: "connect"});
                tokenDeferred.resolve(token);
              }

              tokenPromise
                  .then(function(result) {
                    _token = result;
                  })
                  .then(function() {
                    // promesse
                    var userDetailsDeferred = $q.defer(),
                        userDetailsPromise = userDetailsDeferred.promise;
                    if (pmUser.hasProfiles()) {
                      userDetailsDeferred.resolve(true);
                    } else {
                      // pas de profile 
                      // requête du back
                      pmLog.trace({message: "Requête pour récupérer l'userDetails depuis le backend.", tag: "auth", object: objectName, method: "connect"});

                      var httpConfig = {headers: {}};
                      httpConfig.headers['X-Isa-Token'] = _token;

                      $http.post(_config.backend.baseUrl + 'session/userinit', {}, httpConfig)
                          .then(function(response) {
                            try {
                              // Erreur si l'objet n'existe pas (HTML au lieu de JSON par exemple) ou si response d'erreur
                              var userDetails = response.data.Response.unitResponses[0].UnitResponse.objects[0].FrontEndUserDetails;
                            } catch (e) {
                              // redirection vers la page d'erreur
                              pmLog.error({message: "Erreur lors de la récupération du userDetails via le backend. Status : {{status}}, data : {{data}}}, error : {{error}}",
                                params: {status: response.status, data: response.data, error: e.message}, tag: 'auth', object: objectName, method: "connect"});
                              // redirection vers page d'erreur
                              pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                              userDetailsDeferred.reject();
                              return userDetailsPromise;
                            }

                            pmLog.trace({message: "UserDetails récupéré du backend avec succès.", tag: "auth", object: objectName, method: "connect"});
                            // stockage de l'userDetails
                            try {
                              // pmUser lance une exception si le format de l'userDetails n'est pas conforme
                              pmUser.setUserDetails(userDetails)
                                  .then(function() {
                                    userDetailsDeferred.resolve(true);
                                  })
                                  .catch(function(error) {
                                    throw new Error(error);
                                  });
                            } catch (e) {
                              // redirection vers page d'erreur
                              pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                              userDetailsDeferred.reject();
                              return userDetailsPromise;
                            }

                          })
                          .catch(function(response) {
                            if (response.status === 401) {
                              pmLog.info({message: "Erreur 401 lors de la récupération de userDetails sur le backend.", tag: "auth", object: objectName, method: "connect"});
                              globalDeferred.reject("Erreur 401 lors de la récupération de userDetails sur le backend.");
                              var errorCode = null;
                              try {
                                // FIXME vérifier le format de l'objet
                                errorCode = response.data.Response.object.ErrorResource.code;
                              } catch (e) {
                                errorCode = null;
                              }
                              _factory.manage401(errorCode);
                            }

                            pmLog.error({message: "Erreur lors de la récupération du userDetails via le backend. Status : {{status}}, data : {{data}}}",
                              params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                            // redirection vers page d'erreur
                            pmRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                            userDetailsDeferred.reject();
                            return userDetailsPromise;
                          });
                    }

                    return userDetailsPromise;
                  })
                  .then(function() {

                    // récupération du profil actuel de l'user s'il est déjà connecté
                    return $q.when(pmUser.getSelectedProfile());

                  })
                  .then(function(selectedProfile) {
                    // récupération du profil depuis le cookie
                    if (selectedProfile === undefined) {
                      return pmUser.setSelectedProfileFromCookie();
                    }
                    return $q.when(selectedProfile);
                  })
                  .then(function(selectedProfile) {
                    // renvoi vers le choix de profil
                    if (selectedProfile === undefined) {
                      return pmUser.selectProfile(pmRouter.getLastRequestedUrl());
                    }
                    return $q.when(selectedProfile);
                  })
                  .then(function() {
                    // log des infos du navigateur
                    _logNavigatorInfo();

                    _isConnected = true;
                    // émission de l'événement
                    $rootScope.$broadcast(objectName + ':userConnected');

                    pmLog.trace({message: "Connexion réalisée avec succès.", tag: "auth", object: objectName, method: "connect"});
                    globalDeferred.resolve();
                  })
                  .catch(function(message) {
                    pmLog.trace({message: "Connexion impossible. Message : {{message}}", params: {message: message},
                      tag: "auth", object: objectName, method: "connect"});
                    globalDeferred.reject(message);
                  });
              return globalPromise;
            },
            /*
             * Redirige vers la page de login du serveur back
             * 
             * @param {undefined|string} userId
             * @param {undefined|string} redirectUrl
             * @return {void} 
             */
            login: function(userId, redirectUrl) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "login", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "login"});

              // suppression des cookies
              pmCookie.clean();


              if (redirectUrl === undefined) {
                redirectUrl = pmRouter.getLastRequestedUrl();
              }

              // redirection
              var backRedirectUrl = _config.backend.baseUrl
                  + 'session/login?applicationId=' + _config.applicationInstanceId
                  + "&relayPath=" + btoa(redirectUrl);

              // ajout de l'userId en développement
              if (typeof userId === 'string' && userId.length > 0 && _config.isDevelopment === true) {
                backRedirectUrl += '&userid=' + userId;
              }

              $window.location.href = backRedirectUrl;
            },
            /*
             * Déconnexion des serveurs backend et frontend
             * 
             * @return {boolean} user déjà connecté (sinon : redirection)
             */
            logout: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "logout", tag: "methodEntry"});
              if (!_factory.isConnected()) {
                pmLog.trace({message: "User déjà déconnecté.", tag: "auth", object: objectName, method: "logout"});
                return true;
              }

              // j_spring_security_logout renvoie un 200 sans données en cas de succès du logout,
              // sinon il renvoie un code d'erreur
              $http.post(_config.backend.baseUrl + 'j_spring_security_logout', {})
                  .then(function() {
                    pmLog.info({message: "Logout effectué sur le backend avec succès.", tag: "auth", object: objectName, method: "logout"});
                    pmRouter.destroySessionAndRedirectHTTP(['Core.logout'], false);
                    // pas de return (redirection)

                  })
                  .catch(function() {
                    pmLog.error({message: "Erreur lors du logout sur le backend.", tag: "auth", object: objectName, method: "logout"});
                    // redirection vers page d'erreur
                    pmRouter.navigateToErrorPage('auth', 'logout');
                  });
            },
            /*
             * Redirige vers la page de fullLogout du serveur back
             * 
             * @return {void} 
             */
            fullLogout: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "login", tag: "fullLogout"});
              // suppression des cookies
              pmCookie.clean();

              // redirection
              $window.location.href = _config.backend.baseUrl + 'slo';
            },
            /*
             * Gère les erreurs 401
             * 
             * @param {string} errorCode
             * @return {void} 
             */
            manage401: function(errorCode) {
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
            },
            /*
             * Envoie un ping au serveur backend pour maintenir la session ouverte
             * 
             * @return {void} 
             */
            ping: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "ping", tag: "methodEntry"});
              var actualTimestamp = pmTime.moment().unix(),
                  pingInterval = (_config.auth.pingInterval / 1000),
                  lastPingTimestamp = pmCookie.get('ping');
              if (lastPingTimestamp === undefined) {
                _initializePingCookie();
              }

              // on ne fait le ping que si :
              // 1) la dernière action a été enregistrée depuis moins de temps que le pingInterval
              // 2) le dernier ping réél a eu lieu depuis plus de temps que le pingInterval
              // 3) l'user est connecté
              if (!((actualTimestamp - _lastActionTimestamp < pingInterval)
                  && (actualTimestamp - lastPingTimestamp > pingInterval))
                  || !_factory.isConnected()) {
                pmLog.trace({message: "Ping sur le serveur backend non réalisé car inutile.", object: objectName, method: "ping", tag: "auth"});
                return;
              }

              // modification du cookie
              pmCookie.put('ping', actualTimestamp);

              var pmBackComHandler = _getpmBackComHandler();

              pmBackComHandler.post('session/ping', {})
                  .then(function() {
                    pmLog.info({message: "Ping effectué sur le backend avec succès.", tag: "auth", object: objectName, method: "ping"});
                  })
                  .catch(function(response) {
                    if (response.hasPerformRedirect) {
                      return;
                    }
                    // remet le ping en attente
                    pmLog.error({message: "Erreur lors du ping vers le backend.", tag: 'auth', object: objectName, method: "ping"});
                    // remise du ping en cookie à la valeur précédente
                    pmCookie.put('ping', lastPingTimestamp);
                  });
            }
          };

          // initialisation
          _initializePingCookie();


          return _factory;
        }]
          );
// fin IIFE
})();