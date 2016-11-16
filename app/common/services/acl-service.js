/** 
 * Service de gestion des ACLs
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: acl-service.js 723 2016-04-01 09:52:51Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.aclService';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        '$injector',
        '$rootScope',
        'abx.common.logService',
        'abx.common.routerService',
        'abx.common.componentService',
        function(
            $q,
            $injector,
            $rootScope,
            abxLog,
            abxRouter,
            abxComponent
            ) {

          abxLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});
          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} abx.common.backComHandlerService
           */
          var _abxBackComHandler;

          /*
           * @property {object} ACL
           */
          var _acl = {};

          /*
           * @property {object} Cache des droits d'accès aux composants
           */
          var _isAllowedAccessToComponentCache = {};


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
          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Charge les ACL depuis le back et l'affecte en propriété
             * 
             * @return {object} Promise
             */
            loadAcl: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "loadAcl", tag: "methodEntry"});

              var abxBackComHandler = _getAbxBackComHandler(),
                  deferred = $q.defer();
              abxBackComHandler.post('session/acl', {})
                  .then(function(data) {
                    try {
                      // rôle fermé
                      if (data[0].UnitResponse.objects[0].ErrorResponse !== undefined
                          && data[0].UnitResponse.objects[0].ErrorResponse.message === "selected-role-is-closed-in-selected-school") {
                        abxLog.info({message: "Tentative de récupérer les ACL pour un profil fermé.", tag: "acl", object: objectName, method: "loadAcl"});
                        abxRouter.navigateToErrorPage('acl', 'closedProfile');
                        return $q.reject({hasPerformRedirect: true});
                      }
                      _acl = data[0].UnitResponse.objects[0].FrontEndUserPermissionsPolicy.frontEndUserPermissions;
                      abxLog.info({message: "ACL récupérées depuis le backend avec succès. ACL = {{acl}}",
                        params: {acl: _acl}, tag: "acl", object: objectName, method: "loadAcl"});
                      deferred.resolve(angular.copy(_acl));
                      // réinitialisation du cache
                      _isAllowedAccessToComponentCache = {};
                      // émission de l'événement
                      $rootScope.$broadcast(objectName + ':aclLoaded');

                    } catch (e) {
                      abxLog.error({message: "Erreur lors de la lecture de l'objet ACL. Message = {{message}}", tag: "acl",
                        params: {message: e.message}, object: objectName, method: "loadAcl"});
                      return $q.reject({});
                    }
                  })
                  .catch(function(response) {
                    if (response.hasPerformRedirect) {
                      deferred.reject(response);
                      return;
                    }
                    abxLog.error({message: "Erreur lors de la récupération des ACL depuis le backend.", tag: "acl", object: objectName, method: "loadAcl"});
                    deferred.reject("Erreur lors de la récupération des ACL depuis le backend.");
                    // redirection vers page d'erreur
                    abxRouter.navigateToErrorPage('acl', 'load');
                  });
              return deferred.promise;
            },
            /*
             * Indique si l'accès à un component est autorisé par les ACL
             * 
             * @param {string} component
             * @return {boolean} accès autorisé : true, accès interdit : false
             */
            isAllowedAccessToComponent: function(component) {
              if (_isAllowedAccessToComponentCache[component] !== undefined) {
                return _isAllowedAccessToComponentCache[component];
              }

              abxLog.trace({message: "Entrée méthode", object: objectName, method: "isAllowedAccessToComponent", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "isAllowedAccessToComponent"});

              try {
                var componentSecurityConfig = abxComponent.getComponentSecurityConfig(component);
              } catch (e) {
                // une erreur a été levée par la méthode : accès refusé
                _isAllowedAccessToComponentCache[component] = false;
                return false;
              }

              // le controller n'est pas protégé : accès autorisé
              if (!componentSecurityConfig.isProtected) {
                abxLog.debug({message: "Component {{component}} non protégé.",
                  params: {component: component}, tag: "ACL", object: objectName, method: "isAllowedAccessToComponent"});
                _isAllowedAccessToComponentCache[component] = true;
                return true;
              }
              // pas d'objets affectés : accès autorisé
              if (componentSecurityConfig.crudObjects.length === 0) {
                abxLog.debug({message: "Pas de crudObject affecté au component {{component}}.",
                  params: {component: component}, tag: "ACL", object: objectName, method: "isAllowedAccessToComponent"});
                _isAllowedAccessToComponentCache[component] = true;
                return true;
              }
              // vérification des ACL sur les objets
              for (var i = 0; i < componentSecurityConfig.crudObjects.length; i++) {
                if (_acl[componentSecurityConfig.crudObjects[i].name] === undefined) {
                  abxLog.debug({message: "CrudObject non trouvé dans les ACL : {{crudObject}}.",
                    params: {crudObject: componentSecurityConfig.crudObjects[i]}, tag: "ACL", object: objectName, method: "isAllowedAccessToComponent"});
                  // pas de mise en cache car cela signifie normalement que l'user n'est pas connecté
                  return false;
                }
                if (_acl[componentSecurityConfig.crudObjects[i].name][componentSecurityConfig.crudObjects[i].action] === true) {
                  abxLog.debug({message: "Accès au component {{component}} autorisé par les ACL pour le crudObject {{crudObject}}.",
                    params: {component: component, crudObject: componentSecurityConfig.crudObjects[i]}, tag: "ACL", object: objectName, method: "isAllowedAccessToComponent"});
                  _isAllowedAccessToComponentCache[component] = true;
                  return true;
                }
              }

              abxLog.info({message: "Accès au component {{component}} refusé par les ACL.",
                params: {component: component}, tag: "ACL", object: objectName, method: "isAllowedAccessToComponent"});
              _isAllowedAccessToComponentCache[component] = false;
              return false;

            },
            /*
             * Indique si l'accès à un crudObject est autorisé par les ACL
             * 
             * @param {string|object} crudObject
             * @param {string} action
             * @return {boolean}  
             */
            isAllowedManageCrudObject: function(crudObject, action) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "isAllowedManageCrudObject", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "isAllowedManageCrudObject"});

              if (typeof crudObject === 'string') {
                crudObject = crudObject.toUpperCase();
              }
              if (typeof action === 'string') {
                action = action.toUpperCase();
              }

              var isAllowed = false;

              // READ || CREATE
              if (action === 'READ' || action === 'CREATE') {
                if (typeof crudObject !== 'string') {
                  abxLog.error({message: "Pour l'action {{action}}, le crudObject doit être de type String, crudObject fourni : {{crudObject}}.",
                    params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});

                } else if (_acl[crudObject] === undefined || _acl[crudObject][action] === undefined) {
                  abxLog.error({message: "ACL inconnue pour l'action {{action}} sur le crudObject {{crudObject}}.",
                    params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});

                } else {
                  isAllowed = _acl[crudObject][action];
                }

                // UPDATE || DELETE  
              } else if (action === 'UPDATE' || action === 'DELETE') {
                if (typeof crudObject !== 'object') {
                  abxLog.error({message: "Pour l'action {{action}}, le crudObject doit être de type Object, crudObject fourni : {{crudObject}}.",
                    params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});

                } else if (crudObject.frontEndAcl === undefined || crudObject.frontEndAcl === null || crudObject.frontEndAcl[action] === undefined) {
                  abxLog.error({message: "ACL inconnue pour l'action {{action}} sur le crudObject {{crudObject}}.",
                    params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});

                } else {
                  isAllowed = crudObject.frontEndAcl[action];
                }

                // erreur
              } else {
                abxLog.error({message: "Le paramètre action doit avoir comme valeur READ|CREATE|UPDATE|DELETE, la valeur fournie est {{action}}.",
                  params: {action: action}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});
              }

              if (isAllowed) {
                abxLog.debug({message: "Autorisation accordée par les ACL pour l'action {{action}} sur le crudObject {{crudObject}}.",
                  params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});
              } else {
                abxLog.debug({message: "Autorisation refusée par les ACL pour l'action {{action}} sur le crudObject {{crudObject}}.",
                  params: {action: action, crudObject: crudObject}, tag: "ACL", object: objectName, method: "isAllowedManageCrudObject"});
              }

              return isAllowed;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();