/** 
 * Filtre permettant de trier les rôles
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: orderByRole-filter.js 673 2016-03-14 14:47:14Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonSelectedRoleFilter',
          [
            function (
                ) {

              /*
               * @param {object|array} toFilterObject
               * @return {object} 
               */
              var filter = function (toFilterObject, roleFilter) {
                var filterRoles = [],
                    arrayRoles = [];
                // Listing des rôles à filtrer
                for (var role in roleFilter) {
                  if (roleFilter[role]) {
                    filterRoles.push(role);
                  }
                }

                if (filterRoles.length > 0) {
                  for (var i = 0; i < toFilterObject.length; i++) {
                    var hasRole = true;
                    for (var j = 0; j < filterRoles.length; j++) {
                      if (!toFilterObject[i].roles[filterRoles[j]].value) {
                        hasRole = false;
                        break;
                      }
                    }
                    if(hasRole) {
                      arrayRoles.push(toFilterObject[i]);
                    }
                  }
                  return arrayRoles;
                }
                return toFilterObject;
              };
              return filter;
            }]
          );




// fin IIFE
})();