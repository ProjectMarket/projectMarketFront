/** 
 * Modèle pour la gestion des objets School
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: school-model.js 718 2016-03-25 16:58:40Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.schoolModel';

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
             * Renvoie des School par requête
             * 
             * @param {object} options
             * options = {undefined}|{
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   displayName: {string},
             *   role: {string}
             * }
             * @return {object} Promise
             */
            readByOpenedRoleAndDisplayName: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "readByOpenedRoleAndDisplayName", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByOpenedRoleAndDisplayName"});

              if (options === undefined || options.displayName === undefined || options.role === undefined) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
                  params: {options: options, optionsType: typeof options}, tag: "params", object: objectName, method: "readByOpenedRoleAndDisplayName"});
                throw new Error();
              }

              var deferred = $q.defer(),
                  request = {
                    concat: options.concat,
                    method: "openedschools",
                    requests: [
                      {
                        request: {
                          itemsPerPage: 50,
                          page: 1,
                          searchCriteria: [
                            options.displayName,
                            options.role
                          ],
                          query: "SELECT_SCHOOLS_BY_OPENED_ROLE_AND_DISPLAY_NAME"
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
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();