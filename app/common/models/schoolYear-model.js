/** 
 * Modèle pour la gestion des objets SchoolYear
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: schoolYear-model.js 711 2016-03-22 16:14:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';

  var objectName = 'abx.common.schoolYearModel';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.userService',
        'abx.common.cacheBackManagerService',
        'abx.common.cacheService',
        'abx.common.timeService',
        function (
            $q,
            abxLog,
            abxUser,
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
             * Renvoie le nom des schoolYears
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
                  names.push(objects[i].SchoolYear.name);
                }
                return names;

              } catch (e) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: objectName, method: "getObjectsDisplayNames"});
                throw new Error(e.message);
              }
            },
            /*
             * Renvoie le SchoolYear en cours
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
            readCurrent: function (options) {
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
                          namespace: 'crudObjects:schoolYear',
                          key: 'current',
                          forceBackRead: options.forceBackRead,
                          isForbiddenPutInCache: true
                        },
                        request: {
                          query: 'SELECT_CURRENT_SCHOOLYEAR'
                        },
                        isUnique: true
                      }
                    ]
                  };


              abxCacheBackManager.read(request)
                  .then(function (response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.SchoolYear !== undefined) {
                      response.result.SchoolYear.dateStart = abxTime.convertDateFromBackToDate(response.result.SchoolYear.dateStart);
                      response.result.SchoolYear.dateEnd = abxTime.convertDateFromBackToDate(response.result.SchoolYear.dateEnd);
                      abxCache.put('crudObjects:schoolYear', 'current', response.result);
                    }
                    deferred.resolve(response.result);
                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;
            },
            /*
             * Renvoie tous les SchoolYear
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
            readAll: function (options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readAll", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readAll"});

              if (options === undefined) {
                options = {};
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    requests: [
                      {
                        cache: {
                          namespace: 'crudObjects:schoolYear',
                          key: 'current',
                          forceBackRead: options.forceBackRead,
                          isForbiddenPutInCache: true
                        },
                        request: {
                          searchCriteria: [abxUser.getSelectedSchoolId()],
                          query: 'SELECT_SCHOOLYEARS_BY_SCHOOLID'
                        }
                      }
                    ]
                  };


              abxCacheBackManager.read(request)
                  .then(function (response) {

                    for (var i = 0, length = response.result.length; i < length; i++) {
                      if (response.isFromBack === true && response.result[i] !== undefined && response.result[i].SchoolYear !== undefined) {

                        response.result[i].SchoolYear.dateStart = abxTime.convertDateFromBackToDate(response.result[i].SchoolYear.dateStart);
                        response.result[i].SchoolYear.dateEnd = abxTime.convertDateFromBackToDate(response.result[i].SchoolYear.dateEnd);
                        abxCache.put('crudObjects:schoolYear', 'current', response.result[i]);
                      }
                    }
                    deferred.resolve(response.result);
                  })
                  .catch(function (response) {
                    deferred.reject(response);
                  });

              return deferred.promise;

            },
            /*
             * Crée ou modifie un SchoolYear
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string}, // "create"/"update"
             *   schoolYear: {
             *     dateStart: {object} Date,
             *     dateEnd: {object} Date,
             *     id: {undefined|number} // uniquement si update
             *   }
             * }
             * @return {object} Promise
             */
            createUpdate: function (options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. arguments={{params}}",
                  params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }

              var request = {
                concat: options.concat,
                action: options.action,
                requests: [
                  {
                    cache: {
                      namespace: 'crudObjects:schoolYear',
                      key: 'current'
                    },
                    object: {
                      SchoolYear: {
                        schoolId: abxUser.getSelectedSchoolId(),
                        dateStart: abxTime.convertDateFromDateToBack(options.schoolYear.dateStart),
                        dateEnd: abxTime.convertDateFromDateToBack(options.schoolYear.dateEnd),
                        id: options.schoolYear.id
                      }
                    }
                  }
                ]
              };
              return abxCacheBackManager.createUpdateDelete(request);
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();