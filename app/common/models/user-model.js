/** 
 * Modèle pour les User
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var objectName = 'pm.common.userModel';
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
                         * Renvoie les infos d'un utilisateur
                         * 
                         * @param {Object} options: {
                         *      entityId {number}
                         * }
                         * @returns {promise}
                         */
                        readById: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "read", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "read"});

                            if (options === undefined || options.entityId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "read"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();

                            pmBackComHandler.get('entity/' + options.entityId)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });
                            return deferred.promise;
                        },
                        /*
                         * Crée un utilisateur
                         * 
                         * @param {Object} options: {
                         *      firstname: {string},
                         *      lastname: {string},
                         *      email: {string},
                         *      password: {string},
                         *      avatar: {string||undefined}
                         * }
                         * 
                         * @return {promise}
                         */
                        create: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "create", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "create"});

                            if (options === undefined || options.email === undefined
                                    || options.password === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "create"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            pmBackComHandler.post('signup', options)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },

                        /*
                         * Met à jour les données de l'utilisateur
                         * 
                         * @param {Object} options: {
                         *      entityId {number}
                         *      email {string|undefined}
                         *      password {string|undefined}
                         *      firstname {string|undefined}
                         *      lastname {string|undefined}
                         *      legalname {string|undefined}
                         *      siretnumber {number|undefined}
                         *      avatar {string|undefined}
                         *      address {string|undefined}
                         *      postalcode {number|undefined}
                         *      city {string|undefined}
                         *      country {string|undefined}
                         * }
                         * 
                         * @return {promise}
                         */
                        update: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "update", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "update"});

                            if (options === undefined || options.entityId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "read"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }


                            var deferred = $q.defer();
                            var params = {
                                email: options.email,
                                description: options.description,
                                firstname: options.firstname,
                                lastname: options.lastname,
                                legalname: options.legalname,
                                siretnumber: options.siretnumber,
                                avatar: options.avatar,
                                address: options.address,
                                postalcode: options.postalcode,
                                city: options.city,
                                country: options.country
                            };

                            pmBackComHandler.put('updateProfile/' + options.entityId, params)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },

                        /*
                         * Met à jour les mot de passe de l'utilisateur
                         * 
                         * @param {Object} options: {
                         *      entityId {number}
                         *      email {string|undefined}
                         *      password {string|undefined}
                         *      country {string|undefined}
                         * }
                         * 
                         * @return {promise}
                         */
                        updatePassword: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "update", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "update"});

                            if (options === undefined || options.entityId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "read"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }


                            var deferred = $q.defer();

                            var params = {
                                oldpassword: options.oldpassword,
                                newpassword: options.newpassword
                            };

                            pmBackComHandler.put('updatePassword/' + options.entityId, params)
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },

                        /*
                         * Supprime le compte de l'utilisateur courant
                         * 
                         * @return {promise}
                         */
                        delete: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
                            var deferred = $q.defer();
                            pmBackComHandler.delete('entity/' + options.entityId)
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