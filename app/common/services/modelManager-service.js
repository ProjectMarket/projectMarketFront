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
  var objectName = 'abx.common.modelManagerService';
  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.routerService',
        'abx.common.cacheBackManagerService',
        function(
            $q,
            abxLog,
            abxRouter,
            abxCacheBackManager
            ) {

          abxLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "addConcatRequest", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "addConcatRequest"});

              var requestsLength = requests.length,
                  concatId = abxCacheBackManager.addConcatRequest(requestsLength),
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "checkYearContainer", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "checkYearContainer"});

              if (yearContainerResult === undefined) {
                abxLog.critical({message: "YearContainer inexistant.", object: objectName, method: "checkYearContainer", tag: "settings"});
                abxRouter.navigateToErrorPage('settings', 'yearContainer');
                return false;
              }
              if (yearContainerResult.result !== undefined || yearContainerResult.YearContainer === undefined) {
                abxRouter.navigateToErrorPage('backend', 'backend');
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "checkYearContainerAndSchoolYear", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "checkYearContainerAndSchoolYear"});
              
              if (_factory.checkYearContainer(yearContainerResult) === false) {
                return false;
              }

              if (schoolYearResult === undefined) {
                abxLog.critical({message: "SchoolYear inexistant.", object: objectName, method: "checkYearContainerAndSchoolYear", tag: "settings"});
                abxRouter.navigateToErrorPage('settings', 'schoolYear');
                return false;
              }
              if (schoolYearResult.result !== undefined || schoolYearResult.SchoolYear === undefined) {
                abxRouter.navigateToErrorPage('backend', 'backend');
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "convertStringToBack", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "convertStringToBack"});

              if (typeof inputString !== 'string') {
                abxLog.error({message: "Format de inputString invalide : inputString={{inputString}}",
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