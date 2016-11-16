/** 
 * Service d'encapsulation de stacktrace.js
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */
/* global angular, printStackTrace */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.stacktraceService';

    angular
            .module('pm.commonModule')
            .factory(objectName,
                    function () {

                        //********************
                        // Factory
                        //********************

                        var _factory = {
                            StackTrace: StackTrace
                        };
                        return _factory;
                    }
            );

// fin IIFE
})();