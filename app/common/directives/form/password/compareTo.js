/** 
 * Directive compareTo
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    // nom de la directive
    var directiveName = 'compareTo';

    //***********
    // Directive
    //***********
    angular
            .module('pm.commonModule')
            .directive(directiveName,
                    ['pm.common.logService',
                        Directive]);

    function Directive(
            pmLog
            ) {

        pmLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

        // directive
        return {
            scope: {
                otherModelValue: "=compareTo"
            },
            require: 'ngModel',
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue === scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });
            }
        };
    }

// fin IIFE
})();