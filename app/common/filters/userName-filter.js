/** 
 * Filtre de mise en forme des noms des users
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: userName-filter.js 277 2015-11-18 15:08:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonUserNameFilter',
          function() {
            return filter;
          }
      );


  /*
   * Mise en forme d'un nom d'user
   * 
   * @param {object} userIdentity 
   * @param {string} format format de la mise en forme
   * @return {string} 
   */
  var filter = function(userIdentity, format) {
    if (userIdentity === undefined || userIdentity.lastName === undefined || userIdentity.firstName === undefined || userIdentity.sex === undefined) {
      return '';
    }
    var output = '';
    switch (format) {
      case 'fn_ln':
        output = userIdentity.firstName + ' ' + userIdentity.lastName;
        break;
      case 'LN_fn':
        output = userIdentity.lastName.toUpperCase() + ' ' + userIdentity.firstName;
        break;
      case 'civ_LN':
        userIdentity.sex === 'm' ? output = 'M.' : output = "Mme";
        output += ' ' + userIdentity.lastName.toUpperCase();
        break;
      default :
        output = userIdentity.firstName + ' ' + userIdentity.lastName;
        break;
    }

    return output;
  };
  
// fin IIFE
})();