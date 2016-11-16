/** 
 * Directive abxActionGroupBar - Ajoute une barre d'actions multiples
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
  var directiveName = 'abxActionGroupBar';

  //**************
  // Directive #1
  //**************
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            FirstDirective]);

  function FirstDirective(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName + '#1', tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      priority: 1500.1,
      compile: function(tElement) {
        tElement.find('[abx-action-group-bar-action]').attr({
          'ng-show': "vm.action.total > 0",
          'ng-disabled': "vm.action.selected < 1"
        });
      }
    };
  }

  //**************
  // Directive #2
  //**************
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            SecondDirective]);

  function SecondDirective(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName + '#2', tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      priority: 1500,
      templateUrl: 'app/common/directives/action/group/bar/bar-directive.html',
      require: ['^abxActionGroup'],
      scope: {},
      replace: true,
      transclude: true,
      controller: function($scope, $element, $attrs) {

      },
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, controllers, transcludeFn) {
            var abxActionGroupController = controllers[0];

            var vm = scope.vm = {};
            vm.actionList = abxActionGroupController.actionList;
            vm.checkUncheckAllValue = false;

            vm.checkUncheckAll = function() {
              abxActionGroupController.checkUncheckAll(vm.checkUncheckAllValue);
            };
            
            scope.$watch(
                function() {
                  return [
                    abxActionGroupController.actionList.selected,
                    abxActionGroupController.actionList.total
                  ];
                },
                function() {
                  abxActionGroupController.actionList.selected === abxActionGroupController.actionList.total ? vm.checkUncheckAllValue = true : vm.checkUncheckAllValue = false;
                },
                true
                );

          }
        };
      }
    };
  }

// fin IIFE
})();