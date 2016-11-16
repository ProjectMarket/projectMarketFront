/** 
 * Modèle pour la gestion des objets YearWeek
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: yearWeek-model.js 724 2016-04-01 14:57:55Z zvergne $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';

  var objectName = 'pm.common.yearWeekModel';

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
             * Renvoie le nom des yearWeek
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
                  names.push(objects[i].YearWeekCollection.label);
                }

                return names;

              } catch (e) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Crée ou modifie un yearWeek
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   id: {undefined|number}, // uniquement si update
             *   year: {integer},
             *   week: {integer},
             *   yearWeekCollectionId: {integer}
             *   updateMode : {undefined|number}, // uniquement si update
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
                      YearWeek: {
                        id : options.yearWeek.id,
                        year: options.yearWeek.year,
                        week: options.yearWeek.week,
                        yearWeekCollectionId: options.yearWeek.yearWeekCollectionId,
                        updateMode : options.yearWeek.updateMode
                      }
                    }
                  }
                ]
              };

              pmCacheBackManager.createUpdateDelete(request)
                  .then(function (response) {
                    // suppression du cache
                    
                    if (response[0].YearWeek !== undefined) {
                      pmCache.remove('crudObjects:yearWeek', 'schoolYearId:' + options.yearWeek.schoolYearId);
                    }
                    deferred.resolve(response);

                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Supprime un ou plusieurs YearWeek
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
                        YearWeek: {
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
                    pmCache.remove('crudObjects:yearWeek', 'schoolYearId:' + options.schoolYearId);
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