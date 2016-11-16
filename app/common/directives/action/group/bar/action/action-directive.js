/** 
 * Directive abxActionGroupBarAction - Ajoute une action
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
  var directiveName = 'abxActionGroupBarAction';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          [
            'abx.common.logService',
            Directive
          ]);

  function Directive(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'A',
      require: ['^abxActionGroup', '^abxActionGroupBar'],
      scope: true,
      compile: function(tElement, tAttrs) {

        return {
          post: function(scope, iElement, iAttrs, controllers, transcludeFn) {

            var abxActionGroupController = controllers[0],
                action = iAttrs.abxActionGroupBarAction;

            scope.getSelectedIds = function() {
              return abxActionGroupController.getSelectedIds(action);
            };

            var vm = scope.vm = {};

            var watchCancel = scope.$watch(
                function() {
                  return abxActionGroupController.actionList.actions[action];
                },
                function(newValue, oldValue) {
                  if (newValue !== undefined) {
                    vm.action = newValue;
                    watchCancel();
                  }
                },
                true);
          }
        };
      }
    };
  }

// fin IIFE
})();