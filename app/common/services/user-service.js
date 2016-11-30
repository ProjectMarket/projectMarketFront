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
                         * 
                         * @returns {redirectUrl|String}
                         */
                        removeUser: function() {
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