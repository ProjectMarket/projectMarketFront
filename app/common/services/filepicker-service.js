/** 
 * Service de gestion des documents
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.filepickerService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$window',
                'pm.common.logService',
                function (
                        $window,
                        pmLog
                        ) {

                    pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

                    //********************
                    // Propriétés privées
                    //********************


                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        getInstanceOfFilePicker: function () {
                            return $window.filepicker;
                        }
                    };
                    return _factory;
                }]
                    );
// fin IIFE
})();
