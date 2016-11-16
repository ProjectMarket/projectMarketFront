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

  var objectName = 'pm.common.alternatingWeeksModel';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.cacheService',
        'pm.common.timeService',
        'pm.common.modelManagerService',
        'pm.common.cacheBackManagerService',
        function (
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
             * Renvoie le nom des alternatingWeeks
             * 
             * @param {array} objects
             * @return {array} strings
             */
            getObjectsDisplayNames: function (objects) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "getObjectsDisplayNames", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getObjectsDisplayNames"});

              try {
                var names = [];
                for (var i = 0, length = objects.length; i < length; i++) {
                  names.push(objects[i].AlternatingWeeks.name);
                }
                return names;

              } catch (e) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readByAlternatingWeeksId", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByAlternatingWeeksId"});

              if (options === undefined || options.alternatingWeeksId === undefined) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
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


              pmCacheBackManager.read(request)
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

              pmCacheBackManager.read(request)
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
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
                        name: pmModelManager.convertStringToBack(options.alternatingWeeks.name),
                        schoolYearId: options.alternatingWeeks.schoolYearId,
                        startDateForWeeksGeneration: pmTime.convertDateFromDateToBack(options.alternatingWeeks.startDateForWeeksGeneration),
                        endDateForWeeksGeneration: pmTime.convertDateFromDateToBack(options.alternatingWeeks.endDateForWeeksGeneration),
                        id: options.alternatingWeeks.id,
                        labels: options.alternatingWeeks.labels
                      }
                    }
                  }
                ]
              };

              pmCacheBackManager.createUpdateDelete(request)
                  .then(function (response) {
                    // suppression du cache
                    if (response[0].AlternatingWeeks !== undefined) {
                      pmCache.remove('crudObjects:alternatingWeeks', 'schoolYearId:' + options.alternatingWeeks.schoolYearId);
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
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


              pmCacheBackManager.createUpdateDelete(request)
                  .then(function (response) {
                    // suppression du cache
                    pmCache.remove('crudObjects:alternatingWeeks', 'schoolYearId:' + options.schoolYearId);
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