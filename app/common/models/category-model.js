/** 
 * Modèle pour les Category
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var objectName = 'pm.common.categoryModel';
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

                            pmBackComHandler.get('categories/')
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