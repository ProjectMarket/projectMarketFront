/** 
 * Filtre de date
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('pm.commonModule')
      .filter('pmCommonDatetimeFilter',
          [
            'pm.common.timeService',
            function(
                pmTime
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
                    return pmTime.moment(date).format('L');
                    break;
                  case 'longDate':
                    return pmTime.moment(date).format('dddd L');
                    break;
                  case 'shortDateTime':
                    return (pmTime.moment(date).format('L') + ' ' + pmTime.moment(date).format('LTS'));
                    break;
                  case 'timestamp':
                    return pmTime.moment(date).unix();
                    break;
                  case 'longDayOfWeek':
                    return pmTime.moment.weekdays()[date];
                    break;
                }
                
              };
              return filter;
            }]
          );




// fin IIFE
})();