/** 
 * Directive abxFormFilterDatetime - met en forme une datetime dans un input
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: datetime-directive.js 442 2016-01-19 15:18:46Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxFormFilterDatetime';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            'abxCommonDatetimeFilterFilter',
            Directive]);

  function Directive(
      abxLog,
      abxFilterDatetime
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        abxFilterFormat: '@'
      },
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, ngModelController) {
            ngModelController.$formatters.push(function(data) {
              return abxFilterDatetime(data, scope.abxFilterFormat);
            });
          }
        };
      }
    };
  }

// fin IIFE
})();