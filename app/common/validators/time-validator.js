/** 
 * Directive abxTimeValidator
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: time-validator.js 623 2016-03-01 14:38:42Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxTimeValidator';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            Directive]);

  function Directive(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'A',
      require: 'ngModel',
      compile: function(tElement, tAttrs) {
        
        return {
          post: function(scope, iElement, iAttrs, ngModelController) {
            ngModelController.$validators.abxTimeValidator = function(modelValue, viewValue) {
              if (ngModelController.$isEmpty(modelValue)) {
                return true;
              }
              return (viewValue.search(/^(([0-1]{1}\d{1})|(2{1}[0-3]{1})):[0-5]{1}\d{1}$/) >= 0);
            };
          }
        };
      }
    };
  }

// fin IIFE
})();