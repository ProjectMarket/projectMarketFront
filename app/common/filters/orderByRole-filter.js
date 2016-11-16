/** 
 * Filtre permettant de trier les rôles
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: orderByRole-filter.js 716 2016-03-24 08:36:33Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('pm.commonModule')
      .filter('pmCommonOrderByRoleFilter',
          [
            function(
                ) {

              /*
               * @param {object|array} toFilterObject
               * @return {object} 
               */
              var filter = function(toFilterObject) {
                var filteredObject = {},
                    sortedRoles = [
                      'ROLE_SADMIN',
                      'ROLE_INS',
                      'ROLE_DIR',
                      'ROLE_ADMIN',
                      'ROLE_MANAGER',
                      'ROLE_MANAGER_DM',
                      'ROLE_MANAGER_SCHEDULE',
                      'ROLE_MANAGER_WRB',
                      'ROLE_MANAGER_DMS',
                      'ROLE_MANAGER_COMP',
                      'ROLE_TEACHER',
                      'ROLE_STAFF_LTD',
                      'ROLE_STUDENT',
                      'ROLE_RESP'
                    ],
                    rolesArray = [];

                if (angular.isArray(toFilterObject)) {
                  return toFilterObject.sort(function(a, b) {
                    return sortedRoles.indexOf(a) - sortedRoles.indexOf(b);
                  });
                }

                for (var role in toFilterObject) {
                  rolesArray.push(role);
                }

                rolesArray.sort(function(a, b) {
                  return sortedRoles.indexOf(a) - sortedRoles.indexOf(b);
                });

                for (var i = 0, length = rolesArray.length; i < length; i++) {
                  filteredObject[rolesArray[i]] = toFilterObject[rolesArray[i]];
                }

                return filteredObject;
              };
              return filter;
            }]
          );




// fin IIFE
})();