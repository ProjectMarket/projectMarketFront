/** 
 * Service qui encapsule les modèles
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: modelManager-service.js 615 2016-02-19 15:48:33Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';
  var objectName = 'pm.common.modelManagerService';
  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.routerService',
        'pm.common.cacheBackManagerService',
        function(
            $q,
            pmLog,
            pmRouter,
            pmCacheBackManager
            ) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************


          //********************
          // Méthodes privées
          //********************


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Réalise une requête combinée
             * 
             * @param {array} requests
             * requests = [
             *   {modelMethod: {object:model.method},
             *    options: {undefined|object}},
             *   {...}
             * ]
             * @return {object} Promise rejetée uniquement si une redirection a été effectuée par backComHandler
             */
            addConcatRequest: function(requests) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "addConcatRequest", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "addConcatRequest"});

              var requestsLength = requests.length,
                  concatId = pmCacheBackManager.addConcatRequest(requestsLength),
                  promisesList = [];

              for (var i = 0; i < requestsLength; i++) {
                if (requests[i].options === undefined) {
                  requests[i].options = {};
                }
                requests[i].options.concat = {
                  concatId: concatId,
                  requestNumber: i
                };
                promisesList.push(requests[i].modelMethod(requests[i].options));
              }
              return $q.all(promisesList);
            },
            /*
             * Vérifie un YearContainer
             * 
             * @param {object} yearContainerResult
             * @return {boolean} L'objet passé est-il bien un objet YearContainer ?
             */
            checkYearContainer: function(yearContainerResult) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "checkYearContainer", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "checkYearContainer"});

              if (yearContainerResult === undefined) {
                pmLog.critical({message: "YearContainer inexistant.", object: objectName, method: "checkYearContainer", tag: "settings"});
                pmRouter.navigateToErrorPage('settings', 'yearContainer');
                return false;
              }
              if (yearContainerResult.result !== undefined || yearContainerResult.YearContainer === undefined) {
                pmRouter.navigateToErrorPage('backend', 'backend');
                return false;
              }

              return true;
            },
            /*
             * Réalise une requête combinée
             * 
             * @param {object} yearContainerResult
             * @param {object} schoolYearResult
             * @return {boolean} Les deux objets passés sont-ils bien des objets YearContainer et SchoolYear ?
             */
            checkYearContainerAndSchoolYear: function(yearContainerResult, schoolYearResult) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "checkYearContainerAndSchoolYear", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "checkYearContainerAndSchoolYear"});
              
              if (_factory.checkYearContainer(yearContainerResult) === false) {
                return false;
              }

              if (schoolYearResult === undefined) {
                pmLog.critical({message: "SchoolYear inexistant.", object: objectName, method: "checkYearContainerAndSchoolYear", tag: "settings"});
                pmRouter.navigateToErrorPage('settings', 'schoolYear');
                return false;
              }
              if (schoolYearResult.result !== undefined || schoolYearResult.SchoolYear === undefined) {
                pmRouter.navigateToErrorPage('backend', 'backend');
                return false;
              }

              return true;
            },
            /*
             * Convertit une chaîne pour le back
             * 
             * @param {string} inputString
             * @return {string|null}
             */
            convertStringToBack: function(inputString) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "convertStringToBack", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "convertStringToBack"});

              if (typeof inputString !== 'string') {
                pmLog.error({message: "Format de inputString invalide : inputString={{inputString}}",
                  params: {inputString: inputString}, tag: "params", object: objectName, method: "convertStringToBack"});
                throw new Error('Format de inputString invalide');
              }
              
              return inputString.length > 0 ? inputString : null;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();