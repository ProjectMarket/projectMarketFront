/** 
 * Directive inputTextarea - étend les directives input et textarea de Angular Material afin de corriger le positionnement du compteur
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: exemple-directive.js 542 2016-02-10 10:26:00Z smonbrun $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'input';

  //***********
  // Directive
  //***********
  angular
      .module('material.components.input')
      .directive('input', inputTextareaDirective)
      .directive('textarea', inputTextareaDirective)

  function inputTextareaDirective($mdUtil, $window, $mdAria) {
    return {
      restrict: 'E',
      require: ['^?mdInputContainer', '?ngModel'],
      priority: 100,
      link: postLink
    };

    function postLink(scope, element, attr, ctrls) {
      var containerCtrl = ctrls[0];

      if (!containerCtrl)
        return;

      var errorsSpacer = angular.element(containerCtrl.element[0].querySelector('.md-errors-spacer'));
      element
          .after(errorsSpacer)
          .after('<div class="abx-clearfix">');
    }
  }

// fin IIFE
})();