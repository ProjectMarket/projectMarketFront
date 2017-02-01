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
                    var _account = {
                        type: undefined
                    };

                    //********************
                    // Méthodes privées
                    //********************

                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Affecte le compte connecté
                         * 
                         * @param {object} account
                         * @return {void}
                         */
                        setAccount: function (account) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "setAccount", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "setAccount"});
                            _account = account;
                            console.info(_account);
                        },
                        /*
                         * Renvoie l'id du compte connecté
                         * 
                         * @return {number}
                         */
                        getAccountId: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "getAccountId", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "getAccountId"});
                            return _account.id;

                        },
                        /*
                         * Revnoie le type de compte connecté
                         * 
                         * @returns {string}
                         */
                        getType: function () {
                            return _account.type;
                        },
                        /*
                         * Renvoie si l'utilisateur est admin d'une société
                         * 
                         * @returns {boolean}
                         */
                        isSociety: function () {
                            return _account.type === "society";
                        },
                        /*
                         * 
                         * @returns {redirectUrl|String}
                         */
                        removeUser: function () {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "removeUser", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "removeUser"});
                            _account = {};
                        }
                    };
                    return _factory;
                }]
                    );
// fin IIFE
})();