/** 
 * Initialisation du module global
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, moment, e, pmLocalConfig */

// encapsulation dans une IIFE
(function () {

    'use strict';

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['pmApp']);
    });

// fin IIFE
})();
