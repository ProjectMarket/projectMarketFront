/** 
 * Service de gestion des données de l'utilisateur connecté
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, e */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.userService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                'pm.common.logService',
                function (
                        pmLog
                        ) {

                    pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

                    //********************
                    // Propriétés privées
                    //********************

                    /*
                     * @property {object} user connecté
                     */
                    var _user = {};

                    //********************
                    // Méthodes privées
                    //********************

                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Affecte le user
                         * 
                         * @param {object} user
                         * @return {void}
                         */
                        setUser: function (user) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "setUser", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "setUser"});
                            _user = user;

                        },
                        /*
                         * Renvoie le user connecté
                         * 
                         * @return {Object}
                         */
                        getUserConnected: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getUserConnected", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "getUserConnected"});
                            return _user;
                        },
                        /*
                         * Renvoie l'id du user connecté
                         * 
                         * @return {number}
                         */
                        getUserId: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getUserId", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "getUserId"});
                            return _user.id;

                        },
                        /*
                         * Renvoie si l'utilisateur est admin d'une société
                         * 
                         * @returns {boolean}
                         */
                        isAdmin: function () {console.info(_user.societyAdmin);
                            return (_user.societyAdmin !== undefined && _user.societyAdmin !== null);
                        },
                        /*
                         * 
                         * @returns {redirectUrl|String}
                         */
                        removeUser: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "removeUser", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "removeUser"});
                            _user = {};
                        }
                    };
                    return _factory;
                }]
                    );
// fin IIFE
})();