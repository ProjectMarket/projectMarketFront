/** 
 * Modèle pour la gestion des objets YearContainer
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: yearContainer-model.js 711 2016-03-22 16:14:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.yearContainerModel';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.cacheBackManagerService',
        'pm.common.cacheService',
        'pm.common.timeService',
        function(
            $q,
            pmLog,
            pmCacheBackManager,
            pmCache,
            pmTime
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
             * Renvoie le nom des yearContainers
             * 
             * @param {array} objects
             * @return {array} strings
             */
            getObjectsDisplayNames: function(objects) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "getObjectsDisplayNames", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getObjectsDisplayNames"});
              try {
                var names = [];
                for (var i = 0, length = objects.length; i < length; i++) {
                  names.push(objects[i].YearContainer.name);
                }
                return names;

              } catch (e) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Renvoie le YearContainer en cours
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   forceBackRead: {undefined|boolean}
             * }
             * @return {object} Promise
             */
            readCurrent: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readCurrent", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readCurrent"});

              if (options === undefined) {
                options = {};
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        cache: {
                          namespace: 'crudObjects:yearContainer',
                          key: 'current',
                          forceBackRead: options.forceBackRead,
                          isForbiddenPutInCache: true
                        },
                        request: {
                          query: 'SELECT_CURRENT_YEARCONTAINER'
                        },
                        isUnique: true
                      }
                    ]
                  };

              pmCacheBackManager.read(request)
                  .then(function(response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.YearContainer !== undefined) {
                      response.result.YearContainer.dateStart = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateStart);
                      response.result.YearContainer.dateEnd = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateEnd);
                      response.result.YearContainer.defaultSchoolYearDateStart = pmTime.convertDateFromBackToDate(response.result.YearContainer.defaultSchoolYearDateStart);
                      response.result.YearContainer.defaultSchoolYearDateEnd = pmTime.convertDateFromBackToDate(response.result.YearContainer.defaultSchoolYearDateEnd);

                      for (var i = 0, length = response.result.YearContainer.dateEvents.length; i < length; i++) {
                        if (response.result.YearContainer.dateEvents[i].PublicHoliday !== undefined) {
                          response.result.YearContainer.dateEvents[i].PublicHoliday.dateStart = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].PublicHoliday.dateStart);
                          response.result.YearContainer.dateEvents[i].PublicHoliday.dateEnd = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].PublicHoliday.dateEnd);
                        } else if (response.result.YearContainer.dateEvents[i].SchoolHolidays !== undefined) {
                          response.result.YearContainer.dateEvents[i].SchoolHolidays.dateStart = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].SchoolHolidays.dateStart);
                          response.result.YearContainer.dateEvents[i].SchoolHolidays.dateEnd = pmTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].SchoolHolidays.dateEnd);
                        }
                      }
                      pmCache.put('crudObjects:yearContainer', 'current', response.result);
                    }
                    deferred.resolve(response.result);
                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();