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

  var objectName = 'abx.common.yearContainerModel';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.cacheBackManagerService',
        'abx.common.cacheService',
        'abx.common.timeService',
        function(
            $q,
            abxLog,
            abxCacheBackManager,
            abxCache,
            abxTime
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
             * Renvoie le nom des yearContainers
             * 
             * @param {array} objects
             * @return {array} strings
             */
            getObjectsDisplayNames: function(objects) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getObjectsDisplayNames", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getObjectsDisplayNames"});
              try {
                var names = [];
                for (var i = 0, length = objects.length; i < length; i++) {
                  names.push(objects[i].YearContainer.name);
                }
                return names;

              } catch (e) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readCurrent", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
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

              abxCacheBackManager.read(request)
                  .then(function(response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.YearContainer !== undefined) {
                      response.result.YearContainer.dateStart = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateStart);
                      response.result.YearContainer.dateEnd = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateEnd);
                      response.result.YearContainer.defaultSchoolYearDateStart = abxTime.convertDateFromBackToDate(response.result.YearContainer.defaultSchoolYearDateStart);
                      response.result.YearContainer.defaultSchoolYearDateEnd = abxTime.convertDateFromBackToDate(response.result.YearContainer.defaultSchoolYearDateEnd);

                      for (var i = 0, length = response.result.YearContainer.dateEvents.length; i < length; i++) {
                        if (response.result.YearContainer.dateEvents[i].PublicHoliday !== undefined) {
                          response.result.YearContainer.dateEvents[i].PublicHoliday.dateStart = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].PublicHoliday.dateStart);
                          response.result.YearContainer.dateEvents[i].PublicHoliday.dateEnd = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].PublicHoliday.dateEnd);
                        } else if (response.result.YearContainer.dateEvents[i].SchoolHolidays !== undefined) {
                          response.result.YearContainer.dateEvents[i].SchoolHolidays.dateStart = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].SchoolHolidays.dateStart);
                          response.result.YearContainer.dateEvents[i].SchoolHolidays.dateEnd = abxTime.convertDateFromBackToDate(response.result.YearContainer.dateEvents[i].SchoolHolidays.dateEnd);
                        }
                      }
                      abxCache.put('crudObjects:yearContainer', 'current', response.result);
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