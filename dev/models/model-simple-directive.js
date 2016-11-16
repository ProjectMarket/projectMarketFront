/** 
 * Directive abxXXX
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: model-simple-directive.js 329 2015-12-01 16:18:13Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxXXX';

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
      priority: 0,
      template: '',
      templateUrl: '',
      replace: true,
      transclude: true,
      scope: {},
      require: '',
      controller: function($scope, $element, $attrs) {
        
      },
      compile: function(tElement, tAttrs) {
        
        return {
          pre: function(scope, iElement, iAttrs, ctrls, transcludeFn) {
            
          },
          post: function(scope, iElement, iAttrs, ctrls, transcludeFn) {
            
          }
        };
      }
    };
  }

// fin IIFE
})();