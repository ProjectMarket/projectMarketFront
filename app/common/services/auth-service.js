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

  var objectName = 'abx.common.authService';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$interval',
        '$q',
        '$http',
        '$window',
        '$location',
        '$injector',
        '$rootScope',
        'abx.common.logService',
        'abx.common.configService',
        'abx.common.cronService',
        'abx.common.cookieService',
        'abx.common.userService',
        'abx.common.routerService',
        'abx.common.timeService',
        function(
            $interval,
            $q,
            $http,
            $window,
            $location,
            $injector,
            $rootScope,
            abxLog,
            abxConfig,
            abxCron,
            abxCookie,
            abxUser,
            abxRouter,
            abxTime) {

          abxLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});
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
          var _config = abxConfig.get();
          /*
           * @property {integer} Timestamp de la dernière action
           */
          var _lastActionTimestamp = abxTime.moment().unix();

          /*
           * @property {object} abx.common.backComHandlerService
           */
          var _abxBackComHandler;


          //********************
          // Méthodes privées
          //********************

          /*
           * Renvoie abx.common.backComHandlerService
           * 
           * @return {object} abx.common.backComHandlerService
           */
          var _getAbxBackComHandler = function() {
            if (_abxBackComHandler === undefined) {
              // injection pour éviter des références circulaires
              _abxBackComHandler = $injector.get('abx.common.backComHandlerService');
            }
            return _abxBackComHandler;
          };

          // Logs navigateur

          /*
           * Log les infos utiles du navigateur
           * 
           * @return {void} 
           */
          var _logNavigatorInfo = function() {
            var nav = $window.navigator;
            abxLog.info({message: "UserAgent : {{data}}", params: {data: nav.userAgent}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            var isTouch = (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
            abxLog.info({message: "TouchDevice : {{isTouch}}", params: {isTouch: isTouch}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "Oscpu : {{data}}", params: {data: nav.oscpu}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "Language : {{data}}", params: {data: nav.language}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "Languages : {{data}}", params: {data: nav.languages}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "CookieEnabled : {{data}}", params: {data: nav.cookieEnabled}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "ScreenSize : {{width}}x{{height}}", params: {width: $window.screen.width, height: $window.screen.height}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "WindowSize : {{width}}x{{height}}", params: {width: $(window).width(), height: $(window).height()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            abxLog.info({message: "DocumentSize : {{width}}x{{height}}", params: {width: $(document).width(), height: $(document).height()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
            // timestamp
            abxLog.info({message: "Intervale de timestamp front / back : {{intervale}}", params: {intervale: abxLog.getFrontBackTimestampInterval()}, object: objectName, method: "_logNavigatorInfo", tag: "navigator"});
          };

          // Gestion du ping

          // modification du timestamp de la dernière action
          $(document).on('keypress mousedown touchstart', function() {
            _lastActionTimestamp = abxTime.moment().unix();
          });
          // CRON d'envoi du ping pour maintenir la session ouverte sur la backend
          // la méthode _ping décide de l'envoi au non au backend en fonction de la config
          var _intervalPromise = $interval(function() {
            _factory.ping();
          }, _config.auth.checkPingInterval, 0, false);
          // stockage en service
          abxCron.put('abxAuth-checkPingBackend', _intervalPromise);
          // initialisation du cookie si besoin
          var _initializePingCookie = function() {
            abxLog.trace({message: "Entrée méthode", object: objectName, method: "_initializePingCookie", tag: "methodEntry"});
            if (abxCookie.get('ping') === undefined) {
              abxLog.trace({message: "Initialisation du cookie de ping vers le serveur backend.", object: objectName, method: "_initializePingCookie", tag: "auth"});
              abxCookie.put('ping', abxTime.moment().unix());
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "isConnected", tag: "methodEntry"});
              return _isConnected;
            },
            /*
             * Renvoie le token
             * 
             * @return {string} 
             */
            getToken: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getToken", tag: "methodEntry"});
              return _token;
            },
            /*
             * Connecte l'user
             * 
             * @return {object} Promise
             */
            connect: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "connect", tag: "methodEntry"});
              var globalDeferred = $q.defer(),
                  globalPromise = globalDeferred.promise;
              // l'user est déjà connecté
              if (_factory.isConnected()) {
                abxLog.trace({message: "Utilisateur déjà connecté.", tag: "auth", object: objectName, method: "connect"});
                globalDeferred.resolve();
                return globalPromise;
              }

              // récupération du cookie
              var token = abxCookie.get('token'),
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
                        abxLog.error({message: "Erreur lors de la récupération du token via le backend. Status : {{status}}, data : {{data}}}",
                          params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                        abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                        return tokenDeferred.reject();
                      }

                      abxLog.trace({message: "Token récupéré du backend avec succès. Token = {{token}}",
                        params: {token: token}, tag: "auth", object: objectName, method: "connect"});
                      // affectation des cookies
                      abxCookie.put('token', token);
                      _initializePingCookie();
                      tokenDeferred.resolve(token);
                    })
                    .catch(function(response) {
                      if (response.status === 401) {
                        // si développement => navigation vers le composant Login
                        if (_config.isDevelopment === true) {
                          abxRouter.navigate(['Core.login', {relayPath: btoa(abxRouter.getLastRequestedUrl())}]);
                        } else {
                          // renvoi vers login
                          _factory.login(undefined, abxRouter.getLastRequestedUrl());
                        }
                        return tokenDeferred.reject('Erreur 401 lors de la récupération du token depuis le serveur backend.');

                      } else {
                        abxLog.error({message: "Erreur lors de la récupération du token via le backend. Status : {{status}}, data : {{data}}}",
                          params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                        // redirection vers page d'erreur
                        abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                        return tokenDeferred.reject();
                      }
                    });
              } else {
                abxLog.trace({message: "Token récupéré du cookie avec succès.", tag: "auth", object: objectName, method: "connect"});
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
                    if (abxUser.hasProfiles()) {
                      userDetailsDeferred.resolve(true);
                    } else {
                      // pas de profile 
                      // requête du back
                      abxLog.trace({message: "Requête pour récupérer l'userDetails depuis le backend.", tag: "auth", object: objectName, method: "connect"});

                      var httpConfig = {headers: {}};
                      httpConfig.headers['X-Isa-Token'] = _token;

                      $http.post(_config.backend.baseUrl + 'session/userinit', {}, httpConfig)
                          .then(function(response) {
                            try {
                              // Erreur si l'objet n'existe pas (HTML au lieu de JSON par exemple) ou si response d'erreur
                              var userDetails = response.data.Response.unitResponses[0].UnitResponse.objects[0].FrontEndUserDetails;
                            } catch (e) {
                              // redirection vers la page d'erreur
                              abxLog.error({message: "Erreur lors de la récupération du userDetails via le backend. Status : {{status}}, data : {{data}}}, error : {{error}}",
                                params: {status: response.status, data: response.data, error: e.message}, tag: 'auth', object: objectName, method: "connect"});
                              // redirection vers page d'erreur
                              abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                              userDetailsDeferred.reject();
                              return userDetailsPromise;
                            }

                            abxLog.trace({message: "UserDetails récupéré du backend avec succès.", tag: "auth", object: objectName, method: "connect"});
                            // stockage de l'userDetails
                            try {
                              // abxUser lance une exception si le format de l'userDetails n'est pas conforme
                              abxUser.setUserDetails(userDetails)
                                  .then(function() {
                                    userDetailsDeferred.resolve(true);
                                  })
                                  .catch(function(error) {
                                    throw new Error(error);
                                  });
                            } catch (e) {
                              // redirection vers page d'erreur
                              abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                              userDetailsDeferred.reject();
                              return userDetailsPromise;
                            }

                          })
                          .catch(function(response) {
                            if (response.status === 401) {
                              abxLog.info({message: "Erreur 401 lors de la récupération de userDetails sur le backend.", tag: "auth", object: objectName, method: "connect"});
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

                            abxLog.error({message: "Erreur lors de la récupération du userDetails via le backend. Status : {{status}}, data : {{data}}}",
                              params: {status: response.status, data: response.data}, tag: 'auth', object: objectName, method: "connect"});
                            // redirection vers page d'erreur
                            abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'login'}]);
                            userDetailsDeferred.reject();
                            return userDetailsPromise;
                          });
                    }

                    return userDetailsPromise;
                  })
                  .then(function() {

                    // récupération du profil actuel de l'user s'il est déjà connecté
                    return $q.when(abxUser.getSelectedProfile());

                  })
                  .then(function(selectedProfile) {
                    // récupération du profil depuis le cookie
                    if (selectedProfile === undefined) {
                      return abxUser.setSelectedProfileFromCookie();
                    }
                    return $q.when(selectedProfile);
                  })
                  .then(function(selectedProfile) {
                    // renvoi vers le choix de profil
                    if (selectedProfile === undefined) {
                      return abxUser.selectProfile(abxRouter.getLastRequestedUrl());
                    }
                    return $q.when(selectedProfile);
                  })
                  .then(function() {
                    // log des infos du navigateur
                    _logNavigatorInfo();

                    _isConnected = true;
                    // émission de l'événement
                    $rootScope.$broadcast(objectName + ':userConnected');

                    abxLog.trace({message: "Connexion réalisée avec succès.", tag: "auth", object: objectName, method: "connect"});
                    globalDeferred.resolve();
                  })
                  .catch(function(message) {
                    abxLog.trace({message: "Connexion impossible. Message : {{message}}", params: {message: message},
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "login", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "login"});

              // suppression des cookies
              abxCookie.clean();


              if (redirectUrl === undefined) {
                redirectUrl = abxRouter.getLastRequestedUrl();
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "logout", tag: "methodEntry"});
              if (!_factory.isConnected()) {
                abxLog.trace({message: "User déjà déconnecté.", tag: "auth", object: objectName, method: "logout"});
                return true;
              }

              // j_spring_security_logout renvoie un 200 sans données en cas de succès du logout,
              // sinon il renvoie un code d'erreur
              $http.post(_config.backend.baseUrl + 'j_spring_security_logout', {})
                  .then(function() {
                    abxLog.info({message: "Logout effectué sur le backend avec succès.", tag: "auth", object: objectName, method: "logout"});
                    abxRouter.destroySessionAndRedirectHTTP(['Core.logout'], false);
                    // pas de return (redirection)

                  })
                  .catch(function() {
                    abxLog.error({message: "Erreur lors du logout sur le backend.", tag: "auth", object: objectName, method: "logout"});
                    // redirection vers page d'erreur
                    abxRouter.navigateToErrorPage('auth', 'logout');
                  });
            },
            /*
             * Redirige vers la page de fullLogout du serveur back
             * 
             * @return {void} 
             */
            fullLogout: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "login", tag: "fullLogout"});
              // suppression des cookies
              abxCookie.clean();

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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "manage401", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "manage401"});

              // token incorrect
              if (errorCode === 'bad-token') {
                abxLog.info({message: "Erreur bad-token.", tag: "auth", object: objectName, method: "manage401"});
                // redirection vers page d'erreur
                abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'badToken'}]);
                return;
              }

              // l'user était connecté : plus de session en backend => timeout ou déconnexion externe
              if (_factory.isConnected()) {
                abxLog.info({message: "Pas de session backend.", tag: "auth", object: objectName, method: "manage401"});
                // redirection vers page d'erreur
                abxRouter.destroySessionAndRedirectHTTP(['Core.error', {type: 'auth', code: 'noSessionInBackend'}]);
                return;
              }

              // l'user n'était pas connecté : login
              abxLog.info({message: "Erreur 401 pour un user non connecté.", tag: "auth", object: objectName, method: "manage401"});
              if (_config.isDevelopment === true) {
                abxRouter.navigate(['Core.login', {relayPath: btoa(abxRouter.getLastRequestedUrl())}]);
              } else {
                // renvoi vers login
                _factory.login(undefined, abxRouter.getLastRequestedUrl());
              }
            },
            /*
             * Envoie un ping au serveur backend pour maintenir la session ouverte
             * 
             * @return {void} 
             */
            ping: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "ping", tag: "methodEntry"});
              var actualTimestamp = abxTime.moment().unix(),
                  pingInterval = (_config.auth.pingInterval / 1000),
                  lastPingTimestamp = abxCookie.get('ping');
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
                abxLog.trace({message: "Ping sur le serveur backend non réalisé car inutile.", object: objectName, method: "ping", tag: "auth"});
                return;
              }

              // modification du cookie
              abxCookie.put('ping', actualTimestamp);

              var abxBackComHandler = _getAbxBackComHandler();

              abxBackComHandler.post('session/ping', {})
                  .then(function() {
                    abxLog.info({message: "Ping effectué sur le backend avec succès.", tag: "auth", object: objectName, method: "ping"});
                  })
                  .catch(function(response) {
                    if (response.hasPerformRedirect) {
                      return;
                    }
                    // remet le ping en attente
                    abxLog.error({message: "Erreur lors du ping vers le backend.", tag: 'auth', object: objectName, method: "ping"});
                    // remise du ping en cookie à la valeur précédente
                    abxCookie.put('ping', lastPingTimestamp);
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