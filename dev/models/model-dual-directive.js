/** 
 * Directives pmXXX
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: model-dual-directive.js 613 2016-02-19 14:36:29Z vguede $
 */

/** 
 * On implémente deux directives qui portent le même nom mais avec des priorités différentes
 * pour pouvoir ajouter des directives aux enfants avant le transclude (et donc avant leur compilation).
 * 
 * S'il n'y a pas de transclude, la compilation se fait de l'extérieur vers l'intérieur, le DOM non compilé des enfants
 * est disponible dans la méthode compile du parent.
 * En revanche, si une directive fait un transclude, l'ordre de compilation est inversé (de l'intérieur vers l'extérieur).
 * Les élèments enfants sont supprimés du DOM avant la compilation de l'élément parent, ils ne sont pas disponibles
 * dans le compile de l'élément parent. Dans la phase de postLink, les éléments enfants sont déjà compilés,
 * on ne peut donc pas leut ajouter de directives. 
 * 
 * La directive #1, avec une priorité supérieure à la directive #2, ne fait pas de transclude et peut donc modifier le DOM des enfants
 * (= leur ajouter des directives) avant leur compilation.
 * La directive #2 peut ensuite faire le transclude du DOM modifié et un replace avec un template.
 * 
 * Les priorités sont supérieurs à 1000 => les directives sont compilées avant toutes celles d'Angular (max = 1000).
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'pmXXX';

  //**************
  // Directive #1
  //**************
  angular
      .module('pm.commonModule')
      .directive(directiveName,
          ['pm.common.logService',
            FirstDirective]);

  function FirstDirective(
      pmLog
      ) {

    pmLog.trace({message: "Instanciation objet", object: directiveName + '#1', tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      priority: 1500.1,
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

  //**************
  // Directive #2
  //**************
  angular
      .module('pm.commonModule')
      .directive(directiveName,
          ['pm.common.logService',
            SecondDirective]);

  function SecondDirective(
      pmLog
      ) {

    pmLog.trace({message: "Instanciation objet", object: directiveName + '#2', tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      priority: 1500,
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