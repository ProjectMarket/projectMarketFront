/** 
 * Directive abxActionList - met en forme une liste d'actions (menus ou boutons)
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: list-directive.js 521 2016-02-04 17:55:47Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxActionList';

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
      templateUrl: 'app/common/directives/action/list/list-directive.html',
      replace: true,
      scope: {
        /*
         * Options globales
         * 
         * {object}
         * {
         *   breakPoints: {undefined|object} {
         *     button: {integer} default: 1,
         *     icon: {integer} default: 2
         *   },
         *   forceDisplay: {undefined|string} "button"|"icon"|"menu" default: undefined
         * }
         */
        abxOptionsGlobal: '=',
        /*
         * Liste des actions
         * 
         * {array}
         * [
         *   {
         *    mustShow: {undefined|boolean} default: true,
         *    action: {expression},
         *    actionArguments: {undefined|expression},
         *    actionName: {string},
         *    actionText: {undefined|string} default: undefined,
         *    icon: {undefined|string} default: undefined
         *    }
         * ]
         */
        abxOptionsList: '='
      },
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, ctrls, transcludeFn) {

            scope.displayMenuType = 'menu';
            scope.actions = [];

            scope.execAction = function(index) {
              if (scope.abxOptionsList[index]['actionArguments'] === undefined) {
                scope.abxOptionsList[index]['action']();
              } else {
                scope.abxOptionsList[index]['action'].apply(null, scope.abxOptionsList[index]['actionArguments']);
              }
            };
            
            var initGlobalOptions = function() {
              if (scope.abxOptionsGlobal.forceDisplay !== undefined) {
                scope.displayMenuType = scope.abxOptionsGlobal.forceDisplay;
              } else {
                var breakPoints = {
                  button: 1,
                  icon: 2
                };
                if (scope.abxOptionsGlobal.breakPoint !== undefined) {
                  breakPoints = scope.abxOptionsGlobal.breakPoint;
                }
                if (scope.actions.length <= breakPoints.button) {
                  scope.displayMenuType = 'button';
                } else if (scope.actions.length <= breakPoints.icon) {
                  scope.displayMenuType = 'icon';
                } else {
                  scope.displayMenuType = 'menu';
                }
              }
            };


          }
        };
      }
    };
  }

// fin IIFE
})();