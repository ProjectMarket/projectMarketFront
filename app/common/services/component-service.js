/** 
 * Service de gestion des components
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.componentService';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        'pm.common.componentsSecurityValue',
        'pm.common.logService',
        function(
            componentsSecurityValue,
            pmLog
            ) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Cache de la config de sécurité
           */
          var _componentSecurityConfigCache = {};



          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Renvoie la config de sécurité pour un component
             * 
             * @param {string} component
             * @return {object} 
             */
            getComponentSecurityConfig: function(component) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "getComponentSecurityConfig", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getComponentSecurityConfig"});

              if (!component) {
                pmLog.error({message: "Erreur dans la récupération du pm.common.componentsSecurityValue. Le paramètre 'component' en entrée n'est pas défini ou est incorrect.",
                  tag: 'component', object: objectName, method: "getComponentSecurityConfig"});
                throw new Error("'component' n'est pas défini ou est incorrect.");
              }


              if (_componentSecurityConfigCache[component] !== undefined) {
                return angular.copy(_componentSecurityConfigCache[component]);
              } else {
                // suppression du suffixe Component
                var splitedComponent = component.substring(0, component.length - 9).split('.'),
                    config = componentsSecurityValue;

                try {
                  for (var i = 0; i < splitedComponent.length; i++) {
                    config = config[splitedComponent[i]];
                  }
                  if (config === undefined) {
                    throw new Error('Composant inconnu.');
                  }

                  // vérification de la validité de l'objet de config
                  if (typeof config.isProtected !== 'boolean') {
                    throw new Error("isProtected n'est pas défini ou n'est pas un booléen.");
                  }
                  if (config.crudObjects === undefined || config.crudObjects.constructor !== Array) {
                    throw new Error("crudObjects n'est pas défini ou n'est pas un tableau.");
                  }

                  pmLog.debug({message: "Détermination de la config de sécurité du component {{component}} : {{config}}",
                    params: {component: component, config: config}, object: objectName, method: "getComponentSecurityConfig", tag: "component"});
                  _componentSecurityConfigCache[component] = config;
                  return angular.copy(_componentSecurityConfigCache[component]);

                } catch (e) {
                  // pas d'accès si pas de config
                  pmLog.error({message: "Erreur dans la récupération du pm.common.componentsSecurityValue. Component = {{component}} : erreur = {{error}}",
                    params: {component: component, error: e.message}, tag: 'component', object: objectName, method: "getComponentSecurityConfig"});
                  throw new Error(e.message);
                }
              }
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();
