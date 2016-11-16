/** 
 * Filtre de date
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: datetime-filter.js 543 2016-02-11 09:17:56Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonDatetimeFilter',
          [
            'abx.common.timeService',
            function(
                abxTime
                ) {

              /*
               * @param {object|string|null|undefined} Date date
               * @param {string} format
               * @return {string} 
               */
              var filter = function(date, format) {
                if (date === undefined || date === null || (typeof date === 'string' && date.length === 0)) {
                  return '';
                }
                switch (format) {
                  case 'shortDate':
                    return abxTime.moment(date).format('L');
                    break;
                  case 'longDate':
                    return abxTime.moment(date).format('dddd L');
                    break;
                  case 'shortDateTime':
                    return (abxTime.moment(date).format('L') + ' ' + abxTime.moment(date).format('LTS'));
                    break;
                  case 'timestamp':
                    return abxTime.moment(date).unix();
                    break;
                  case 'longDayOfWeek':
                    return abxTime.moment.weekdays()[date];
                    break;
                }
                
              };
              return filter;
            }]
          );




// fin IIFE
})();