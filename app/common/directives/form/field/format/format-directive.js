/** 
 * Directive abxFormFieldFormat - met en forme et valorise le format pour un champ
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: format-directive.js 421 2016-01-15 09:33:44Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxFormFieldFormat';

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
      restrict: 'E',
      templateUrl: 'app/common/directives/form/field/format/format-directive.html',
      replace: true,
      transclude: true,
      scope: {
        abxFormat: '@'
      },
      compile: function() {
        return {
          post: function(scope) {
            scope.formatText = '';

            switch (scope.abxFormat) {
              case 'date':
                scope.formatText = 'Date au format JJ/MM/AAAA (ex&nbsp;: 25/12/2016)';
                break;
            }
          }
        };
      }
    };
  }

// fin IIFE
})();