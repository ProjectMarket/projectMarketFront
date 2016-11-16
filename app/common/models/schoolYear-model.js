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

  var objectName = 'pm.common.schoolYearModel';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.userService',
        'pm.common.cacheBackManagerService',
        'pm.common.cacheService',
        'pm.common.timeService',
        function (
            $q,
            pmLog,
            pmUser,
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
             * Renvoie le nom des schoolYears
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
                  names.push(objects[i].SchoolYear.name);
                }
                return names;

              } catch (e) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Message d'exception={{exceptionMessage}}",
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


              pmCacheBackManager.read(request)
                  .then(function (response) {
                    if (response.isFromBack === true && response.result !== undefined && response.result.SchoolYear !== undefined) {
                      response.result.SchoolYear.dateStart = pmTime.convertDateFromBackToDate(response.result.SchoolYear.dateStart);
                      response.result.SchoolYear.dateEnd = pmTime.convertDateFromBackToDate(response.result.SchoolYear.dateEnd);
                      pmCache.put('crudObjects:schoolYear', 'current', response.result);
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readAll", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
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
                          searchCriteria: [pmUser.getSelectedSchoolId()],
                          query: 'SELECT_SCHOOLYEARS_BY_SCHOOLID'
                        }
                      }
                    ]
                  };


              pmCacheBackManager.read(request)
                  .then(function (response) {

                    for (var i = 0, length = response.result.length; i < length; i++) {
                      if (response.isFromBack === true && response.result[i] !== undefined && response.result[i].SchoolYear !== undefined) {

                        response.result[i].SchoolYear.dateStart = pmTime.convertDateFromBackToDate(response.result[i].SchoolYear.dateStart);
                        response.result[i].SchoolYear.dateEnd = pmTime.convertDateFromBackToDate(response.result[i].SchoolYear.dateEnd);
                        pmCache.put('crudObjects:schoolYear', 'current', response.result[i]);
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdate", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdate"});

              if (options.action !== 'create' && options.action !== 'update') {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. arguments={{params}}",
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
                        schoolId: pmUser.getSelectedSchoolId(),
                        dateStart: pmTime.convertDateFromDateToBack(options.schoolYear.dateStart),
                        dateEnd: pmTime.convertDateFromDateToBack(options.schoolYear.dateEnd),
                        id: options.schoolYear.id
                      }
                    }
                  }
                ]
              };
              return pmCacheBackManager.createUpdateDelete(request);
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();