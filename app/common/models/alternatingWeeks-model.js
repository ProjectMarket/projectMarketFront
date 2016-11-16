/** 
 * Modèle pour la gestion des objets AlternatingWeeks
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: alternatingWeeks-model.js 711 2016-03-22 16:14:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';

  var objectName = 'abx.common.alternatingWeeksModel';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.cacheService',
        'abx.common.timeService',
        'abx.common.modelManagerService',
        'abx.common.cacheBackManagerService',
        function (
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
             * Renvoie le nom des alternatingWeeks
             * 
             * @param {array} objects
             * @return {array} strings
             */
            getObjectsDisplayNames: function (objects) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getObjectsDisplayNames", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getObjectsDisplayNames"});

              try {
                var names = [];
                for (var i = 0, length = objects.length; i < length; i++) {
                  names.push(objects[i].AlternatingWeeks.name);
                }
                return names;

              } catch (e) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Renvoie un AlternatingWeeks et ses YearWeekCollections par alternatingWeeksId
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   alternatingWeeksId: {integer}
             * }
             * @return {object} Promise
             */
            readByAlternatingWeeksId: function (options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readByAlternatingWeeksId", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByAlternatingWeeksId"});

              if (options === undefined || options.alternatingWeeksId === undefined) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readByAlternatingWeeksId"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        request: {
                          searchCriteria: [options.alternatingWeeksId],
                          query: 'SELECT_ALTERNATINGWEEKS_BY_ID'
                        },
                        isUnique: true
                      }
                    ]
                  };


              abxCacheBackManager.read(request)
                  .then(function (response) {
                    deferred.resolve(response.result);
                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Renvoie une liste de AlternatingWeeks et ses yearWeekCollections par schoolYearId
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
            readBySchoolYearId: function (options) {
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
                          namespace: 'crudObjects:alternatingWeeks',
                          key: 'schoolYearId:' + options.schoolYearId,
                          forceBackRead: options.forceBackRead,
                        },
                        request: {
                          searchCriteria: [options.schoolYearId],
                          query: 'SELECT_ALTERNATINGWEEKS_BY_SCHOOLYEARID'
                        }
                      }
                    ]
                  };

              abxCacheBackManager.read(request)
                  .then(function (response) {
                    deferred.resolve(response.result);
                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;

            },
            /*
             * Crée ou modifie un AlternatingWeeks
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string}, // "create"/"update"
             *   alternatingWeeks: {
             *     name: {string},
             *     schoolYearId: {number}, 
             *     id: {undefined|number}, // uniquement si update
             *     labels: {object},
             *     startDateForWeeksGeneration:  {object}, Date,
             *     endDateForWeeksGeneration  {object}, Date,
             *       {...}
             *     
             *   }
             * }
             * @return {object} Promise
             */
            createUpdate: function (options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode.",
                  params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }

              var deferred = $q.defer();
              
              var request = {
                concat: options.concat,
                action: options.action,
                requests: [
                  {
                    object: {
                      AlternatingWeeks: {
                        name: abxModelManager.convertStringToBack(options.alternatingWeeks.name),
                        schoolYearId: options.alternatingWeeks.schoolYearId,
                        startDateForWeeksGeneration: abxTime.convertDateFromDateToBack(options.alternatingWeeks.startDateForWeeksGeneration),
                        endDateForWeeksGeneration: abxTime.convertDateFromDateToBack(options.alternatingWeeks.endDateForWeeksGeneration),
                        id: options.alternatingWeeks.id,
                        labels: options.alternatingWeeks.labels
                      }
                    }
                  }
                ]
              };

              abxCacheBackManager.createUpdateDelete(request)
                  .then(function (response) {
                    // suppression du cache
                    if (response[0].AlternatingWeeks !== undefined) {
                      abxCache.remove('crudObjects:alternatingWeeks', 'schoolYearId:' + options.alternatingWeeks.schoolYearId);
                    }
                    deferred.resolve(response);

                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Supprime un ou plusieurs AlternatingWeeks
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   schoolYearId: {integer},
             *   ids: {array} [ 
             *     {integer},
             *     {...}
             *   ]
             * }
             * @return {object} Promise
             */
            delete: function (options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

              var deferred = $q.defer(),
                  requests = [];

              for (var i = 0, length = options.ids.length; i < length; i++) {
                requests.push(
                    {
                      object: {
                        AlternatingWeeks: {
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
                  .then(function (response) {
                    // suppression du cache
                    abxCache.remove('crudObjects:alternatingWeeks', 'schoolYearId:' + options.schoolYearId);
                    deferred.resolve(response);

                  })
                  .catch(function (response) {
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