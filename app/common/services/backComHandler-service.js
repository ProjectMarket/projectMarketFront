/** 
 * Service de gestion de la communication avec le serveur backend
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: backComHandler-service.js 664 2016-03-08 12:55:42Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';
  var objectName = 'pm.common.backComHandlerService';
  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        '$http',
        'pm.common.logService',
        'pm.common.configService',
        'pm.common.userService',
        'pm.common.authService',
        function(
            $q,
            $http,
            pmLog,
            pmConfig,
            pmUser,
            pmAuth
            ) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});
          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Config locale d'pm
           */
          var _config = pmConfig.get();
          /*
           * @property {string} BaseUrl du serveur backend
           */
          var _backendBaseUrl = _config.backend.baseUrl;
          //********************
          // Méthodes privées
          //********************

          /*
           * Réalise une requête POST ou GET
           * 
           * @param {string] action post|get
           * @param {string] path path sur le serveur back
           * @param {array} requestObjects
           * @return {object} promise
           */
          var _postGet = function(action, path, requestObjects) {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_postGet", tag: "methodEntry"});
            pmLog.debug({message: "Paramètres méthode : {{params}}",
              params: {params: arguments}, tag: "params", object: objectName, method: "_postGet"});
            var deferred = $q.defer(),
                token = pmAuth.getToken(),
                profile = pmUser.getBackendSelectedProfile(),
                httpConfig = {
                  headers: {}
                },
            request = {
              Request: {
                objects: requestObjects
              }
            },
            promise;

            // génération des headers
            if (token !== undefined) {
              httpConfig.headers['X-Isa-Token'] = token;
            }
            if (profile !== undefined) {
              httpConfig.headers['X-Isa-SelectedProfile-Role'] = profile.role;
              httpConfig.headers['X-Isa-SelectedProfile-SchoolId'] = profile.schoolId;
              httpConfig.headers['X-Isa-SelectedProfile-StudentUserId'] = profile.studentUserId;
            }

            // lancement de la requête
            if (action === 'get') {
              promise = $http.get(_backendBaseUrl + path, httpConfig);
            } else {
              promise = $http.post(_backendBaseUrl + path, request, httpConfig);
            }

            promise
                .then(function(response) {

                  // erreur si l'objet n'existe pas (HTML au lieu de JSON par exemple)
                  try {
                    response.data.Response;
                  } catch (e) {
                    var errorMessage = "Erreur lors de la récupération de l'objet Response : pas de propriété Response.";
                    pmLog.error({message: errorMessage + " Status : {{status}}, data : {{data}}, error : {{error}}",
                      params: {status: response.status, data: response.data, error: e.message}, tag: 'backCommHandler', object: objectName, method: "_postGet"});
                    response.errorMessage = errorMessage;
                    response.errorType = 'back-global-error';
                    response.errorCode = 'back-global-error-200-no-response-property';
                    response.result = 'error';
                    return $q.reject(response);
                  }

                  try {
                    // erreur catchée et renvoyée par le backend
                    if (response.data.Response.result !== 'success') {
                      var errorMessage = "Erreur indiquée par le serveur backend dans l'objet Response.";
                      pmLog.error({message: errorMessage + " Status : {{status}}, errorCode : {{errorCode}}, errorMessage: {{errorMessage}}, data : {{data}}",
                        params: {status: response.status, errorCode: response.data.Response.objects[0].ErrorResource.code, errorMessage: response.data.Response.objects[0].ErrorResource.message, data: response.data},
                        tag: 'backCommHandler', object: objectName, method: "_postGet"});
                      response.errorMessage = errorMessage;
                      response.errorType = 'back-global-error';
                      response.errorCode = 'back-global-error-200-error-result';
                      response.result = 'error';
                      return $q.reject(response);
                    }

                    // succès
                    pmLog.debug({message: "Données renvoyées avec succès : Données={{data}}",
                      params: {data: response.data.Response.unitResponses}, tag: 'backCommHandler', object: objectName, method: "_postGet"});
                    deferred.resolve(response.data.Response.unitResponses);
                  } catch (e) {
                    var errorMessage = "Erreur lors de l'interprétation de l'objet Response.";
                    pmLog.error({message: errorMessage + " Status : {{status}}, data : {{data}}, error : {{error}}",
                      params: {status: response.status, data: response.data, error: e.message}, tag: 'backCommHandler', object: objectName, method: "_postGet"});
                    response.errorMessage = errorMessage;
                    response.errorType = 'back-global-error';
                    response.errorCode = 'back-global-error-200-parsing-response';
                    response.result = 'error';
                    return $q.reject(response);
                  }


                })
                .catch(function(response) {

                  var errorCode = null;
                  try {
                    errorCode = response.data.Response.objects[0].ErrorResource.code;
                    response.backErrorCode = errorCode;
                  } catch (e) {
                    errorCode = null;
                  }

                  if (response.status === 401) {
                    var errorMessage = "Erreur 401 lors d'une requête sur le backend.";
                    pmLog.info({message: errorMessage, tag: "backCommHandler", object: objectName, method: "_postGet"});
                    pmAuth.manage401(errorCode);
                    response.errorMessage = errorMessage;
                    response.errorCode = 'back-global-error-401';
                    response.hasPerformRedirect = true;
                  } else {
                    var errorMessage = "Erreur lors d'une requête sur le backend.";
                    pmLog.error({message: errorMessage + " Status : {{status}}, data : {{data}}",
                      params: {status: response.status, data: response.data}, tag: 'backCommHandler', object: objectName, method: "_postGet"});
                    if (response.status !== 200) {
                      response.errorMessage = errorMessage;
                      response.errorCode = 'back-global-error-' + response.status;
                    }
                    response.hasPerformRedirect = false;
                  }

                  response.errorType = 'back-global-error';
                  response.result = 'error';
                  deferred.reject(response);
                });

            return deferred.promise;
          };


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Réalise une requête POST
             * 
             * @param {string] path path sur le serveur back
             * @param {array} requestObjects
             * @return {object} promise
             */
            post: function(path, requestObjects) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "post", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "post"});

              return _postGet('post', path, requestObjects);
            },
            /*
             * Réalise une requête GET
             * 
             * @param {string] path path sur le serveur back
             * @return {object} promise
             */
            get: function(path) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "get", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "get"});

              return _postGet('get', path);
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();