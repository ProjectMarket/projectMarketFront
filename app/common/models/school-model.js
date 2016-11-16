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

  var objectName = 'abx.common.schoolModel';

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
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "readByOpenedRoleAndDisplayName", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "readByOpenedRoleAndDisplayName"});

              if (options === undefined || options.displayName === undefined || options.role === undefined) {
                abxLog.error({message: "Erreur de paramètres en entrée de méthode. options={{{optionsType}}}{{options}}",
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


              abxCacheBackManager.read(request)
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