/** 
 * Modèle pour les Project
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var objectName = 'pm.common.projectModel';
    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$q',
                'pm.common.logService',
                'pm.common.backComHandlerService',
                function (
                        $q,
                        pmLog,
                        pmBackComHandler
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
                         * Renvoie la liste de tous les projets
                         * 
                         * @returns {promise}
                         */
                        readAll: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "readAll", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "readAll"});

                            var deferred = $q.defer();

                            pmBackComHandler.get('project/')
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });
                            return deferred.promise;
                        },
                        /*
                         * Renvoie les infos d'un projet
                         * 
                         * @param {Object} options: {
                         *      projectId {number}
                         * }
                         * @returns {promise}
                         */
                        readById: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "readById", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "readById"});

                            if (options === undefined || options.projectId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "readById"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();

                            pmBackComHandler.get('project/' + options.projectId)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });
                            return deferred.promise;
                        },
                        /*
                         * Crée un projet
                         * 
                         * @param {Object} options: {
                         *      id: , // connectedEntityId
                         *      title: {string},
                         *      description: {string},
                         *      budget: {number},
                         *      categoryId: {number},
                         *      image: {string}
                         * }
                         * 
                         * @return {promise}
                         */
                        create: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "create", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "create"});

                            if (options === undefined || options.title === undefined
                                    || options.description === undefined || options.id === undefined
                                    || options.budget === undefined || options.categoryId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "create"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            pmBackComHandler.post('project/create', options)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Mets à jour un projet
                         * 
                         * @param {Object} options: {
                         *      title: {string},
                         *      description: {string},
                         *      budget: {number},
                         *      categoryId: {number},
                         *      image: {string}
                         * }
                         * @param {integer} projectId
                         * 
                         * @return {promise}
                         */
                        update: function (options, projectId) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "update", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "update"});

                            if (options === undefined || projectId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "update"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }


                            var deferred = $q.defer();
                            pmBackComHandler.put('project/' + projectId, options)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Postuler à un projet
                         * 
                         * @param candidat {Object} : {
                         *   projectId: {number},
                         *   entityId: {number},
                         *   message: {string|undefined}
                         * }
                         */
                        postulate: function (candidat) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "postulate", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "postulate"});
                            
                            if (candidat === undefined || candidat.projectId === undefined
                                    || candidat.entityId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "postulate"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }
                            
                            var options = angular.copy(candidat);
                            delete options.projectId;
                            var deferred = $q.defer();
                            pmBackComHandler.post('applyToProject/' + candidat.projectId, options)
                                    .then(function (response) {
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