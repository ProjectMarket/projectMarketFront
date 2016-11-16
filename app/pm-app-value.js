/** 
 * Affectation des values sur le module global
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
      .module('pmApp')
      .value('$routerRootComponent', 'pm.appComponent');

// fin IIFE
})();