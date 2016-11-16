/** 
 * Service d'encapsulation du nouveau router d'Angular
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: router-service.js 684 2016-03-15 14:14:02Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.routerService';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$window',
        '$q',
        '$rootRouter',
        '$injector',
        '$timeout',
        'abx.common.configService',
        'abx.common.cookieService',
        'abx.common.logService',
        'abx.common.componentService',
        function(
            $window,
            $q,
            $rootRouter,
            $injector,
            $timeout,
            abxConfig,
            abxCookie,
            abxLog,
            abxComponent
            ) {

          abxLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************
          /*
           * @property {object} Config
           */
          var _config = abxConfig.get();

          /*
           * @property {object} abx.common.authService
           */
          var _abxAuth;

          /*
           * @property {object} abx.common.aclService
           */
          var _abxAcl;

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
           * Renvoie abx.common.authService
           * 
           * @return {object} abx.common.authService
           */
          var _getAbxAuth = function() {
            if (_abxAuth === undefined) {
              _abxAuth = $injector.get('abx.common.authService');
            }
            return _abxAuth;
          };
          /*
           * Renvoie abx.common.aclService
           * 
           * @return {object} abx.common.aclService
           */
          var _getAbxAcl = function() {
            if (_abxAcl === undefined) {
              _abxAcl = $injector.get('abx.common.aclService');
            }
            return _abxAcl;
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
            canActivate: function(component) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "canActivate", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "canActivate"});

              var deferred = $q.defer(),
                  componentSecurityConfig = {};

              $q.when()
                  .then(function() {
                    try {
                      return abxComponent.getComponentSecurityConfig(component);
                    } catch (e) {
                      _factory.navigateToErrorPage('acl', 'configError');
                      return $q.reject();
                    }
                  })
                  .then(function(config) {
                    componentSecurityConfig = config;

                    // authentification
                    // pas d'authentification quand le component n'est pas protégé
                    if (componentSecurityConfig.isProtected === false) {
                      abxLog.trace({message: "Componant {{component}} non protégé.",
                        params: {component: component}, tag: "$canActivate", object: objectName, method: "canActivate"});
                      return $q.when();
                    }

                    var abxAuth = _getAbxAuth();
                    return abxAuth.connect();
                  })
                  .then(function() {
                    // procédure d'autorisation (ACL)
                    var abxAcl = _getAbxAcl();
                    return abxAcl.isAllowedAccessToComponent(component);

                  })
                  .then(function(aclResult) {
                    // interprétation du retour des ACL
                    if (aclResult === true) {
                      return $q.when();
                    } else {
                      _factory.navigateToErrorPage('acl', 'forbidden');
                      return $q.reject();
                    }

                  })
                  .then(function() {
                    abxLog.trace({message: "Navigation autorisée par $canActivate.", tag: "$canActivate", object: objectName, method: "canActivate"});
                    deferred.resolve(true);
                  })
                  .catch(function() {
                    abxLog.info({message: "Navigation interdite par $canActivate.", tag: "$canActivate", object: objectName, method: "canActivate"});
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
            setLastRequestedUrl: function(linkParam) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "setLastRequestedUrl", tag: "methodEntry"});
              abxLog.info({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "setLastRequestedUrl"});
              $rootRouter.abxLastRequestedUrl = _factory.getUrlByLinkParams(linkParam);
            },
            /*
             * Renvoie l'url demandée
             * 
             * @return {string}
             */
            getLastRequestedUrl: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getLastRequestedUrl", tag: "methodEntry"});
              
              var url = $rootRouter.abxLastRequestedUrl || $rootRouter.lastNavigationAttempt;
              return url !== '/logout' ? url : '/home';
            },
            /*
             * Renvoie l'url en fonction d'un DSL
             * 
             * @param {array} linkParams
             * @return {string}
             */
            getUrlByLinkParams: function(linkParams) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getUrlByLinkParams", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getUrlByLinkParams"});

              return angular.stringifyInstruction($rootRouter.generate(linkParams));
            },
            /*
             * Navigue vers le DSL demandé
             * 
             * @param {array} linkParams DSL (voir ComponentRouter.navigate())
             * @return {void}
             */
            navigate: function(linkParams) {
              if (_hasPendingRedirect) {
                return;
              }
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "navigate", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "navigate"});

              // FIXME supprimer le timeout une fois le bug templateUrl corrigé
              $timeout(function() {
                $rootRouter.navigate(linkParams);
              }, 0);
            },
            /*
             * Navigue vers l'URL demandée
             * 
             * @param {string} url
             * @return {void}
             */
            navigateByUrl: function(url) {
              if (_hasPendingRedirect) {
                return;
              }

              abxLog.trace({message: "Entrée méthode", object: objectName, method: "navigateByUrl", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "navigateByUrl"});

              // FIXME supprimer le timeout une fois le bug templateUrl corrigé
              $timeout(function() {
                $rootRouter.navigateByUrl(url);
              }, 0);
            },
            /*
             * Renavigue
             * 
             * @return {void}
             */
            renavigate: function() {
              if (_hasPendingRedirect) {
                return;
              }

              abxLog.trace({message: "Entrée méthode", object: objectName, method: "renavigate", tag: "methodEntry"});
              
              // FIXME supprimer le timeout une fois le bug templateUrl corrigé
              $timeout(function() {
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
            navigateToErrorPage: function(errorType, errorCode) {
              if (_hasPendingRedirect) {
                return;
              }

              abxLog.trace({message: "Entrée méthode", object: objectName, method: "navigateToErrorPage", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "navigateToErrorPage"});

              _internalAccess = {
                type: errorType,
                code: errorCode
              };
              
              // FIXME supprimer le timeout une fois le bug templateUrl corrigé
              $timeout(function() {
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
            destroySessionAndRedirectHTTP: function(linkParams, withInternalAccess) {
              // interdit une navigation ultérieure
              _hasPendingRedirect = true;

              abxLog.trace({message: "Entrée méthode", object: objectName, method: "destroySessionAndRedirectHTTP", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "destroySessionAndRedirectHTTP"});

              abxCookie.clean();
              if (withInternalAccess === true || withInternalAccess === undefined) {
                abxCookie.put('internalAccessOnly', linkParams);
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
            checkInternalAccess: function(type, code) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "checkInternalAccess", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "checkInternalAccess"});

              var internalAccess = _internalAccess;
              // réinitialisation de l'internalAccess
              _internalAccess = {};

              if (type === undefined || code === undefined) {
                abxLog.info({message: "Accès refusé lors du checkInternalAccess : type et/ou code sont undefined.",
                  tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                return false;
              }

              if (internalAccess.type === type && internalAccess.code === code) {
                abxLog.debug({message: "Accès autorisé lors du checkInternalAccess.",
                  tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                return true;
              }

              // pas de données en mémoire => vérification en cookie
              var internalAccessOnlyCookie = abxCookie.get('internalAccessOnly');
              abxCookie.remove('internalAccessOnly');
              if (internalAccessOnlyCookie === undefined) {
                abxLog.info({message: "Accès refusé lors du checkInternalAccess : le cookie n'est pas valorisé.",
                  tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                return false;
              }
              // on parse le linkParams jusqu'à trouver le tableau de paramètres qui le fait bien
              for (var i = 0; i < internalAccessOnlyCookie.length; i++) {
                if (internalAccessOnlyCookie[i].type === type && internalAccessOnlyCookie[i].code === code) {
                  abxLog.debug({message: "Accès autorisé lors du checkInternalAccess.",
                    tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
                  return true;
                }
              }
              abxLog.info({message: "Accès refusé lors du checkInternalAccess : type et/ou code ne correspondent pas à ceux du cookie.",
                tag: "internalAccess", object: objectName, method: "checkInternalAccess"});
              return false;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();