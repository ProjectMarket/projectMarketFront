/** 
 * Modèle pour la gestion des objets timetableContainer
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: timetableContainer-model.js 711 2016-03-22 16:14:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.timetableContainerModel';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.cacheService',
        'pm.common.timeService',
        'pm.common.modelManagerService',
        'pm.common.cacheBackManagerService',
        function(
            $q,
            pmLog,
            pmCache,
            pmTime,
            pmModelManager,
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
             * Renvoie le nom des timetableContainers
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
                  names.push(objects[i].TimetableContainer.name);
                }
                return names;

              } catch (e) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Renvoie un timetableContainer et ses horaires par timetableContainerId
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   timetableContainerId: {integer}
             * }
             * @return {object} Promise
             */
            readByTimetableContainerId: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readByTimetableContainerId", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByTimetableContainerId"});

              if (options === undefined || options.timetableContainerId === undefined) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readByTimetableContainerId"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        request: {
                          searchCriteria: [options.timetableContainerId],
                          query: 'SELECT_TIMETABLECONTAINER_BY_ID'
                        },
                        isUnique: true
                      }
                    ]
                  };


              pmCacheBackManager.read(request)
                  .then(function(response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.result === undefined && response.result.TimetableContainer !== undefined) {
                      for (var i = 0, length = response.result.TimetableContainer.daysOfWeek.length; i < length; i++) {
                        response.result.TimetableContainer.daysOfWeek[i].DayOfWeek.dayOfWeek = pmTime.convertDayOfWeekFromBackToFront(response.result.TimetableContainer.daysOfWeek[i].DayOfWeek.dayOfWeek);
                      }
                    }
                    deferred.resolve(response.result);
                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Renvoie une liste de timetableContainer et ses horaires par schoolYearId
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   forceBackRead: {undefined|boolean}
             *   schoolYearId: {integer}
             * }
             * @return {object} Promise
             */
            readBySchoolYearId: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readBySchoolYearId", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readBySchoolYearId"});

              if (options === undefined || options.schoolYearId === undefined) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readbySchoolYearId"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        cache: {
                          namespace: 'crudObjects:timetableContainer',
                          key: 'schoolYearId:' + options.schoolYearId,
                          forceBackRead: options.forceBackRead,
                          isForbiddenPutInCache: true
                        },
                        request: {
                          searchCriteria: [options.schoolYearId],
                          query: 'SELECT_TIMETABLECONTAINERS_BY_SCHOOLYEARID'
                        }
                      }
                    ]
                  };


              pmCacheBackManager.read(request)
                  .then(function(response) {
                    if (response.isFromBack === true && response.result.result === undefined
                        && response.result[0] !== undefined && response.result[0].TimetableContainer !== undefined) {
                      for (var i = 0, length = response.result.length; i < length; i++) {
                        for (var j = 0, length2 = response.result[i].TimetableContainer.daysOfWeek.length; j < length2; j++) {
                          response.result[i].TimetableContainer.daysOfWeek[j].DayOfWeek.dayOfWeek =
                              pmTime.convertDayOfWeekFromBackToFront(response.result[i].TimetableContainer.daysOfWeek[j].DayOfWeek.dayOfWeek);
                        }
                        pmCache.put('crudObjects:timetableContainer', 'schoolYearId:' + options.schoolYearId, response.result);
                      }
                    }
                    deferred.resolve(response.result);
                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;

            },
            /*
             * Crée ou modifie un timetableContainer
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string}, // "create"|"update"
             *   timetableContainer: {
             *     name: {string},
             *     schoolYearId: {integer},
             *     id: {undefined|integer}, // uniquement si update
             *     cascadeEffect: {undefined|integer}, // 0|1|2
             *     cascadeEffectStartDate: {undefined|object}, // Date
             *     daysOfWeek: {array}[
             *      {
             *        dayOfWeek : {integer}
             *        timetables : {array}[
             *          {
             *            name : {string}
             *            startTime : {string}
             *            endTime : {string}
             *            id : {undefined|string}
             *          },
             *          {...}
             *        ]
             *      },
             *      {...}
             *     ]
             *   }
             * }
             * @return {object} Promise
             */
            createUpdate: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                  params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }


              var deferred = $q.defer(),
                  timetables = [],
                  daysOfWeek = [];

              for (var i = 0, length = options.timetableContainer.daysOfWeek.length; i < length; i++) {
                timetables = [];
                for (var j = 0, length2 = options.timetableContainer.daysOfWeek[i].timetables.length; j < length2; j++) {

                  timetables.push({
                    Timetable: {
                      name: pmModelManager.convertStringToBack(options.timetableContainer.daysOfWeek[i].timetables[j].name),
                      startTime: options.timetableContainer.daysOfWeek[i].timetables[j].startTime,
                      endTime: options.timetableContainer.daysOfWeek[i].timetables[j].endTime,
                      id: options.timetableContainer.daysOfWeek[i].timetables[j].id
                    }
                  });
                }
                daysOfWeek.push({
                  DayOfWeek: {
                    dayOfWeek: pmTime.convertDayOfWeekFromFrontToBack(options.timetableContainer.daysOfWeek[i].dayOfWeek),
                    timetables: timetables
                  }
                });
              }
              var request = {
                concat: options.concat,
                action: options.action,
                requests: [
                  {
                    object: {
                      TimetableContainer: {
                        name: pmModelManager.convertStringToBack(options.timetableContainer.name),
                        id: options.timetableContainer.id,
                        schoolYearId: options.timetableContainer.schoolYearId,
                        cascadeEffect: options.timetableContainer.cascadeEffect,
                        cascadeEffectStartDate: pmTime.convertDateFromDateToBack(options.timetableContainer.cascadeEffectStartDate),
                        daysOfWeek: daysOfWeek
                      }
                    }
                  }
                ]
              };

              pmCacheBackManager.createUpdateDelete(request)
                  .then(function(response) {
                    // suppression du cache
                    if (response[0].TimetableContainer !== undefined) {
                      pmCache.remove('crudObjects:timetableContainer', 'schoolYearId:' + options.timetableContainer.schoolYearId);
                    }
                    deferred.resolve(response);

                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Supprime un ou plusieur TimetableContainer
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   schoolYearId: {integer}
             *   ids: {array} [ 
             *     {integer},
             *     {...}
             *   ]
             * }
             * @return {object} Promise
             */
            delete: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

              var deferred = $q.defer(),
                  requests = [];

              for (var i = 0, length = options.ids.length; i < length; i++) {
                requests.push(
                    {
                      object: {
                        TimetableContainer: {
                          id: options.ids[i]
                        }
                      }
                    }
                );
              }

              var request = {
                concat: options.concat,
                action: "delete",
                requests: requests
              };


              pmCacheBackManager.createUpdateDelete(request)
                  .then(function(response) {
                    // suppression du cache
                    pmCache.remove('crudObjects:timetableContainer', 'schoolYearId:' + options.schoolYearId);
                    deferred.resolve(response);

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