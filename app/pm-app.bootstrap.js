/** 
 * Initialisation du module global
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, moment, e, pmLocalConfig */

// encapsulation dans une IIFE
(function() {

  'use strict';
//
//  window.pmCommonConfigFrontBackTimestampInterval = 0;
//
//  // initialise le service de log
//  // en calculant la différence de timestamp entre le front et le back
//  $.ajax(pmLocalConfig.backend.baseUrl + 'synchronize',
//      {timeout: 3000})
//      .done(function(data) {
//        try {
//          window.pmCommonConfigFrontBackTimestampInterval = data.Response.unitResponses[0].UnitResponse.objects[0].TimeStamp.instant - moment().unix();
//        } catch (e) {
//          if (pmLocalConfig.isDevelopment) {
//            console.error(e.message);
//          }
//        }
//      })
//      .fail(function(data, status) {
//        if (pmLocalConfig.isDevelopment) {
//          console.error(data);
//          console.error(status);
//        }
//      })
//      .always(function() {
//        // bootstrap de l'application
//        angular.element(document).ready(function() {
//          angular.bootstrap(document, ['pmApp']);
//        });
//      });
      
      
      angular.element(document).ready(function() {
          angular.bootstrap(document, ['pmApp']);
        });

// fin IIFE
})();
