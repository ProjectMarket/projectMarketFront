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
(function () {

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
                function (
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
                     * @param {Object} requestObject
                     * @return {object} promise
                     */
                    var _postGetPutDelete = function (action, path, requestObject) {
                        pmLog.trace({message: "Entrée méthode", object: objectName, method: "_postGetPutDelete", tag: "methodEntry"});
                        pmLog.debug({message: "Paramètres méthode : {{params}}",
                            params: {params: arguments}, tag: "params", object: objectName, method: "_postGetPutDelete"});
                        var token = pmAuth.getToken(),
                                httpConfig = {
                                    headers: {}
                                },
                        promise;
                        // génération des headers
                        if (token !== undefined) {
                            httpConfig = {headers: {
                                    "Authorization": "JWT " + token
                                }};
                        }
                        // lancement de la requête
                        if (action === 'get') {
                            promise = $http.get(_backendBaseUrl + path, httpConfig);
                        } else if(action === 'post') {
                            promise = $http.post(_backendBaseUrl + path, requestObject, httpConfig);
                        } else if(action === 'put'){
                            promise = $http.put(_backendBaseUrl + path, requestObject, httpConfig);
                        } else if (action === "delete"){
                            promise = $http.delete(_backendBaseUrl + path, httpConfig);
                        }

                        var deferred = $q.defer();
                        promise.then(function (response) {

                            if (response.status >= 200 && response.status < 300) {
                                deferred.resolve(response.data);
                            } else {
                                deferred.reject(response.data);
                            }
                        })
                                .catch(function (response) {
                                    deferred.reject(response.data);
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
                         * @param {Object} requestObject
                         * @return {object} promise
                         */
                        post: function (path, requestObject) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "post", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "post"});

                            return _postGetPutDelete('post', path, requestObject);
                        },
                        /*
                         * Réalise une requête GET
                         * 
                         * @param {string] path path sur le serveur back
                         * @return {object} promise
                         */
                        get: function (path) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "get", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "get"});

                            return _postGetPutDelete('get', path);
                        },
                        /*
                         * Réalise une requête PUT
                         * 
                         * @param {string] path path sur le serveur back
                         * @param {Object} requestObject
                         * @return {object} promise
                         */
                        put: function (path, requestObject) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "put", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "put"});

                            return _postGetPutDelete('put', path, requestObject);
                        },
                        /*
                         * Réalise une requête DELETE
                         * @param {string] path path sur le serveur back
                         * @return {object} promise
                         */
                        delete: function(path) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});
                            
                            return _postGetPutDelete('delete', path);
                        }
                    };
                    return _factory;
                }]
                    );
// fin IIFE
})();