/** 
 * Modèle pour la gestion des objets ClassRolePermission
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: classRolePermission-model.js 657 2016-03-07 16:43:19Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.classRolePermissionModel';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.cacheBackManagerService',
        function(
            $q,
            pmLog,
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
             * Renvoie une liste de classRolePermission par schoolYearId
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
                        request: {
                          searchCriteria: [options.schoolYearId],
                          query: 'SELECT_CLASSROLEPERMISSIONS_BY_SCHOOLYEARID'
                        }
                      }
                    ]
                  };

              pmCacheBackManager.read(request)
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "create", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "create"});

              var requests = [];

              for (var i = 0, length = options.objects.length; i < length; i++) {
                requests.push(
                    {
                      object: { 
                        ClassRolePermission: {
                          role: options.objects[i].role,
                          schoolYearId: options.objects[i].schoolYearId,
                          clazz: options.objects[i].clazz,
                          action: options.objects[i].action
                        }
                      }
                    }
                );
              }

              var request = {
                concat: options.concat,
                action: 'create',
                requests: requests
              };

              return pmCacheBackManager.createUpdateDelete(request);
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
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

              var requests = [];

              for (var i = 0, length = options.objects.length; i < length; i++) {
                requests.push(
                    {
                      object: { 
                        ClassRolePermission: {
                          id: options.objects[i].id
                        }
                      }
                    }
                );
              }

              var request = {
                concat: options.concat,
                action: 'delete',
                requests: requests
              };

              return pmCacheBackManager.createUpdateDelete(request);
            }
            

          };

          return _factory;
        }]
          );
// fin IIFE
})();