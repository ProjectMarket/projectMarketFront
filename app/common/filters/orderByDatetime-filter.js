/** 
 * Filtre permettant de trier les dates
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: orderByDatetime-filter.js 623 2016-03-01 14:38:42Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonOrderByDatetimeFilter',
          [
            'abx.common.timeService',
            function(
                abxTime
                ) {

              /*
               * @param {object} toFilterObject
               * @param {string} format
               * @return {object} 
               */
              var filter = function(toFilterObject, format) {
                var filteredObject = [];

                switch (format) {
                  case 'dayOfWeek':
                    var firstDayOfWeek = abxTime.moment.localeData().firstDayOfWeek();
                    
                    // le tableau en entrée doit obligatoirement être ordonné : 0 = dimanche, 1 = lundi...
                    for (var i = firstDayOfWeek; i < 7; i++) {
                      filteredObject.push(toFilterObject[i]);
                      if (i === 6 && firstDayOfWeek > 0) {
                        i = -1;
                      }
                      if (i === firstDayOfWeek - 1) {
                        break;
                      }
                    }
                    break;
                    
                  case 'dayOfWeekList':
                    var firstDayOfWeek = abxTime.moment.localeData().firstDayOfWeek();
                    
                    for (var i = firstDayOfWeek; i < 7; i++) {
                      if (toFilterObject.indexOf(i) >= 0) {
                        filteredObject.push(i);
                      }
                      
                      if (i === 6 && firstDayOfWeek > 0) {
                        i = -1;
                      }
                      if (i === firstDayOfWeek - 1) {
                        break;
                      }
                    }
                    break;
                }
                
                return filteredObject;

              };
              return filter;
            }]
          );




// fin IIFE
})();