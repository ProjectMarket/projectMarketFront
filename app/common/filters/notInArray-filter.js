/** 
 * Filtre les éléments qui ne sont pas dans l'array fourni
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: school-filter.js 234 2015-11-04 15:52:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonNotInArrayFilter',
          function() {
            return filter;
          }
      );


  /*
   * Filtre les éléments qui sont déjà dans l'array fourni
   * 
   * @param {array} toFilterArray
   * @param {array} filterArray
   * @return {array} 
   */
  var filter = function(toFilterArray, filterArray) {
    console.info(angular.copy(toFilterArray), filterArray);
    for (var i = 0, length = toFilterArray.length; i < length; i++) {
      if (filterArray.indexOf(toFilterArray[i]) >= 0) {
        toFilterArray.splice(toFilterArray[i], 1);
      }
    }
    console.info(toFilterArray);
    return toFilterArray;
  };
// fin IIFE
})();