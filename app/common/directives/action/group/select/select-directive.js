/** 
 * Directive abxActionGroupSelect - Ajoute une checkbox actions multiples
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: select-directive.js 613 2016-02-19 14:36:29Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxActionGroupSelect';

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
      templateUrl: 'app/common/directives/action/group/select/select-directive.html',
      require: ['^abxActionGroup'],
      scope: {
        id: '<abxOptionsId',
        actions: '<abxOptionsActions'
      },
      replace: true,
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, controllers, transcludeFn) {
            var abxActionGroupController = controllers[0];

            var vm = scope.vm = {};
            vm.hasActions = false;

            scope.$watch(
                function() {
                  return scope.actions;
                },
                function(newValue, oldValue) {
                  for (var action in newValue) {
                    if (newValue[action]) {
                      vm.hasActions = true;
                      return;
                    }
                  }
                  vm.hasActions = false;
                },
                true
                );

            var uid = abxActionGroupController.addSelect(scope);

            scope.$on('$destroy', function() {
              abxActionGroupController.deleteSelect(uid);
            });

          }
        };
      }
    };
  }

// fin IIFE
})();