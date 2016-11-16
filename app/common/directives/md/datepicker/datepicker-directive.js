/** 
 * Directive mdDatepicker - étend la directive md-datepicker de Angular Material afin de corriger son positionnement et son affichage
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
  var directiveName = 'mdDatepicker';

  //***********
  // Directive
  //***********
  angular
      .module('material.components.datepicker')
      .directive(directiveName,
          datePickerDirective);

  function datePickerDirective($mdUtil) {

    // directive
    return {
      require: ['ngModel', 'mdDatepicker', '?^mdInputContainer'],
      link: postLink
    };

    function postLink(scope, element, attr, ctrls) {
      var ngModelCtrl = ctrls[0];
      var mdDatePickerCtrl = ctrls[1];

      var $inputContainer = angular.element(mdDatePickerCtrl.inputContainer);
      var $input = angular.element(mdDatePickerCtrl.inputElement);

      var inputId = 'input_' + mdDatePickerCtrl.$mdUtil.nextUid();
      $input
          .attr('id', inputId);
      if (attr.abxLabel && !attr.mdPlaceholder) {
        $('<label>')
            .attr('for', inputId)
            .text(attr.abxLabel)
            .prependTo($inputContainer);
      }
      if (attr.abxExample) {
        $('<div>')
            .addClass('abx-form-field-example')
            .text('Exemple : ' +attr.abxExample)
            .appendTo($inputContainer);
      }

      ngModelCtrl.$parsers.push(ngModelPipelineCheckValue);
      ngModelCtrl.$formatters.push(ngModelPipelineCheckValue);

      $input.on('input', inputCheckValue);

      mdDatePickerCtrl._setFocused = mdDatePickerCtrl.setFocused;
      delete mdDatePickerCtrl['setFocused'];

      mdDatePickerCtrl.setFocused = function(isFocused) {
        this._setFocused(isFocused);

        element.toggleClass('md-datepicker-focused', !!isFocused);

        if (!isFocused) {
          inputCheckValue();
        }
      };

      function ngModelPipelineCheckValue(arg) {
        setHasValue(!ngModelCtrl.$isEmpty(arg));
        return arg;
      }

      function inputCheckValue() {
        // An input's value counts if its length > 0,
        // or if the input's validity state says it has bad input (eg string in a number input)
        setHasValue($input.val().length > 0 || ($input[0].validity || {}).badInput);
      }

      function setHasValue(hasValue) {
        element.toggleClass('md-datepicker-has-value', !!hasValue);
      }
    }
  }

// fin IIFE
})();