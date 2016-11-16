/** 
 * Modèle pour la gestion des objets SchoolYearRolePermission
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: schoolYearRolePermission-model.js 599 2016-02-19 09:54:48Z rpoussin $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.schoolYearRolePermissionModel';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        'abx.common.logService',
        'abx.common.cacheBackManagerService',
        function(
            $q,
            abxLog,
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
             * Renvoie une liste de PeriodType et ses Period par schoolYearId
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
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
                        request: {
                          searchCriteria: [options.schoolYearId],
                          query: 'SELECT_SCHOOLYEARROLEPERMISSIONS_BY_SCHOOLYEARID'
                        }
                      }
                    ]
                  };

              abxCacheBackManager.read(request)
                  .then(function(response) {
                    deferred.resolve(response.result);
                  })
                  .catch(function(response) {
                    deferred.reject(response);
                  });

              return deferred.promise;

            },
            /*
             * Autorise l'accès à ISA
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string} //create
             *   objects: [
             *     {
             *        role: {string},
             *        schoolYearId: {integer}
             *    },
             *    {...}
             *   ]
             * }
             * @return {object} Promise
             */
            create: function(options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "create", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "create"});

              var requests = [];

              for (var i = 0, length = options.objects.length; i < length; i++) {
                requests.push(
                    {
                      object: { 
                        SchoolYearRolePermission: {
                          role: options.objects[i].role,
                          schoolYearId: options.objects[i].schoolYearId
                        }
                      }
                    }
                );
              }

              var request = {
                concat: options.concat,
                action: options.action,
                requests: requests
              };

              return abxCacheBackManager.createUpdateDelete(request);
            },
            /*
             * Interdit l'accès à ISA
             * 
             * @param {object} options
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string} delete
             *   objects: [
             *     {
             *        id: {integer}
             *    },
             *    {...}
             *   ]
             * }
             * @return {object} Promise
             */
            delete: function(options) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

              var requests = [];

              for (var i = 0, length = options.objects.length; i < length; i++) {
                requests.push(
                    {
                      object: { 
                        SchoolYearRolePermission: {
                          id: options.objects[i].id
                        }
                      }
                    }
                );
              }

              var request = {
                concat: options.concat,
                action: options.action,
                requests: requests
              };

              return abxCacheBackManager.createUpdateDelete(request);
            }
            

          };

          return _factory;
        }]
          );
// fin IIFE
})();