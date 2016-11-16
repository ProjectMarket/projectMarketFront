/** 
 * Modèle pour la gestion des objets PeriodTypes
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: periodType-model.js 711 2016-03-22 16:14:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.periodTypeModel';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.cacheService',
        'abx.common.timeService',
        'abx.common.modelManagerService',
        'abx.common.cacheBackManagerService',
        function(
            $q,
            abxLog,
            abxCache,
            abxTime,
            abxModelManager,
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
             * Renvoie le nom des periodTypes
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
                  names.push(objects[i].PeriodType.name);
                }
                return names;

              } catch (e) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Renvoie un PeriodType et ses Period par periodTypeId
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   periodTypeId: {integer}
             * }
             * @return {object} Promise
             */
            readByPeriodTypeId: function(options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readByPeriodTypeId", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByPeriodTypeId"});

              if (options === undefined || options.periodTypeId === undefined) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readByPeriodTypeId"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        request: {
                          searchCriteria: [options.periodTypeId],
                          query: 'SELECT_PERIODTYPE_BY_ID'
                        },
                        isUnique: true
                      }
                    ]
                  };


              abxCacheBackManager.read(request)
                  .then(function(response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.PeriodType !== undefined) {
                      for (var i = 0, length = response.result.PeriodType.periods.length; i < length; i++) {
                        response.result.PeriodType.periods[i].Period.dateStart = abxTime.convertDateFromBackToDate(response.result.PeriodType.periods[i].Period.dateStart);
                        response.result.PeriodType.periods[i].Period.dateEnd = abxTime.convertDateFromBackToDate(response.result.PeriodType.periods[i].Period.dateEnd);
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
             * Renvoie une liste de PeriodType et ses Period par schoolYearId
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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readBySchoolYearId", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readBySchoolYearId"});

              if (options === undefined || options.schoolYearId === undefined) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readbySchoolYearId"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        cache: {
                          namespace: 'crudObjects:periodType',
                          key: 'schoolYearId:' + options.schoolYearId,
                          forceBackRead: options.forceBackRead,
                          isForbiddenPutInCache: true
                        },
                        request: {
                          searchCriteria: [options.schoolYearId],
                          query: 'SELECT_PERIODTYPES_BY_SCHOOLYEARID'
                        }
                      }
                    ]
                  };

              abxCacheBackManager.read(request)
                  .then(function(response) {

                    if (response.isFromBack === true && response.result.result === undefined && response.result[0] !== undefined && response.result[0].PeriodType !== undefined) {
                      for (var i = 0, length = response.result.length; i < length; i++) {
                        for (var j = 0, length2 = response.result[i].PeriodType.periods.length; j < length2; j++) {
                          response.result[i].PeriodType.periods[j].Period.dateStart = abxTime.convertDateFromBackToDate(response.result[i].PeriodType.periods[j].Period.dateStart);
                          response.result[i].PeriodType.periods[j].Period.dateEnd = abxTime.convertDateFromBackToDate(response.result[i].PeriodType.periods[j].Period.dateEnd);
                        }
                      }
                      abxCache.put('crudObjects:periodType', 'schoolYearId:' + options.schoolYearId, response.result);
                    }

                    deferred.resolve(response.result);
                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;

            },
            /*
             * Crée ou modifie un PeriodType
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string}, // "create"/"update"
             *   periodType: {
             *     name: {string},
             *     schoolYearId: {number}, 
             *     id: {undefined|number}, // uniquement si update
             *     periods: {array} [
             *       {
             *         name: {string},
             *         dateStart: {object}, Date,
             *         dateEnd: {object}, Date
             *         id: {undefined|number} // uniquement si update
             *       },
             *       {...}
             *     ]
             *   }
             * }
             * @return {object} Promise
             */
            createUpdate: function(options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode.",
                  params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }


              var deferred = $q.defer(),
                  periods = [],
                  periodsLength = options.periodType.periods.length;
              for (var i = 0; i < periodsLength; i++) {
                periods.push({
                  Period: {
                    name: abxModelManager.convertStringToBack(options.periodType.periods[i].name),
                    dateStart: abxTime.convertDateFromDateToBack(options.periodType.periods[i].dateStart),
                    dateEnd: abxTime.convertDateFromDateToBack(options.periodType.periods[i].dateEnd),
                    id: options.periodType.periods[i].id
                  }
                });
              }

              var request = {
                concat: options.concat,
                action: options.action,
                requests: [
                  {
                    object: {
                      PeriodType: {
                        name: abxModelManager.convertStringToBack(options.periodType.name),
                        schoolYearId: options.periodType.schoolYearId,
                        id: options.periodType.id,
                        periods: periods
                      }
                    }
                  }
                ]
              };

              abxCacheBackManager.createUpdateDelete(request)
                  .then(function(response) {
                    // suppression du cache
                    if (response[0].PeriodType !== undefined) {
                      abxCache.remove('crudObjects:periodType', 'schoolYearId:' + options.periodType.schoolYearId);
                    }
                    deferred.resolve(response);

                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Supprime un ou plusieur PeriodType
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   schoolYearId: {number}, 
             *   ids: {array} [ 
             *     {integer},
             *     {...}
             *   ]
             * }
             * @return {object} Promise
             */
            delete: function(options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

              var deferred = $q.defer(),
                  requests = [];

              for (var i = 0, length = options.ids.length; i < length; i++) {
                requests.push(
                    {
                      object: {
                        PeriodType: {
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


              abxCacheBackManager.createUpdateDelete(request)
                  .then(function(response) {
                    // suppression du cache
                    abxCache.remove('crudObjects:periodType', 'schoolYearId:' + options.schoolYearId);
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