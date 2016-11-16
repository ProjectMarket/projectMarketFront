/** 
 * Directive abxHelp - met en forme un dialog d'aide
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: help-directive.js 421 2016-01-15 09:33:44Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxHelp';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            'abx.common.flashMessageService',
            Directive]);

  function Directive(
      abxLog,
      abxFlashMessage
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      templateUrl: 'app/common/directives/help/help-directive.html',
      replace: true,
      transclude: true,
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, ctrls, transcludeFn) {
            scope.openHelp = function() {
              // on wrap le transcludeFm dans un div pour pourvoir récupérer tout son contenu via html() même s'il y a des balises
              abxFlashMessage.showHelp($('<div>').append(transcludeFn().clone()).html());
            };
          }
        };
      }
    };
  }

// fin IIFE
})();