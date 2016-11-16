/** 
 * Module global
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  angular
      .module('pmApp', [
        'ngComponentRouter',
        'ngMaterial',
        'material.core.colors',
        'ngSanitize',
        'ngMessages',
        'ngMessageFormat',
        'ui.select',
        'ui.mask',
        'pm.commonModule',
        'pm.componentsModule'
      ]);

// fin IIFE
})();