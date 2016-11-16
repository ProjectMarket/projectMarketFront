/** 
 * Filtre de mise en forme des noms des établissements
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
      .filter('abxCommonSchoolFilter',
          function() {
            return filter;
          }
      );


  /*
   * Mise en forme du nom d'un établissement
   * 
   * @param {object} school
   * @return {string} 
   */
  var filter = function(school) {
    if (school === undefined) {
      return '';
    }
    var output = '';
    if (typeof school.nameType === 'string' && school.nameType.length > 0) {
      output += school.nameType + ' ';
    } else if (typeof school.type === 'string' && school.type.length > 0) {
      output += school.type + ' ';
    }
    if (school.name !== undefined && school.name !== null && school.name.length > 0) {
      output += school.name;
    } else if (school.city !== undefined && school.city !== null && school.city.length > 0) {
      output += school.city;
    } else {
      output = school.uai + ' - ' + output;
    }
    return output;
  };
// fin IIFE
})();