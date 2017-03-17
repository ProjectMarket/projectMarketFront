/** 
 * Modèle pour les Message
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var objectName = 'pm.common.messageModel';
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
                         * Envoie un message à une Entity
                         * 
                         * @param message {string} message à envoyer
                         * @param entityId {number} id de l'entité destinatrice
                         * 
                         * @returns {promise}
                         */
                        send: function (message, entityId) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "send", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "send"});

                            if (message === undefined || message.trim().length === 0 || entityId === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "send"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();

                            pmBackComHandler.get('message/' + entityId, {
                                message: message
                            })
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });
                            return deferred.promise;
                        },
                        /*
                         * Marque une liste de message comme lus
                         * 
                         * @param {array} messageIds
                         * 
                         * @return {promise}
                         */
                        markedAsRead: function (messageIds) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "markedAsRead", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "markedAsRead"});

                            if (messageIds === undefined || messageIds.length === 0) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "markedAsRead"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            pmBackComHandler.post('markedAsRead', {
                                messageIds: messageIds
                            })
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Marque une liste de message comme non lus
                         * 
                         * @param {array} messageIds
                         * 
                         * @return {promise}
                         */
                        markedAsNotRead: function (messageIds) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "markedAsNotRead", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "markedAsNotRead"});

                            if (messageIds === undefined || messageIds.length === 0) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "markedAsNotRead"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            pmBackComHandler.post('markedAsNotRead', {
                                messageIds: messageIds
                            })
                                    .then(function (response) {
                                        deferred.resolve(response);
                                    })
                                    .catch(function (response) {
                                        deferred.reject(response);
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Supprime une liste de messages
                         * @param {array} messageIds
                         * 
                         * @return {promise}
                         */
                        delete: function (messageIds) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "delete", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "delete"});

                            if (messageIds === undefined || messageIds.length === 0) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode.",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "markedAsNotRead"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            pmBackComHandler.delete('message/', {
                                messageIds: messageIds
                            })
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