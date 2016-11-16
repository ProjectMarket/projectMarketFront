/** 
 * Initialisation du module global
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: pm-app.bootstrap.js 339 2015-12-04 15:39:15Z vguede $
 */

/* global angular, moment, e, pmLocalConfig */

// encapsulation dans une IIFE
(function() {

  'use strict';

  window.pmCommonConfigFrontBackTimestampInterval = 0;

  // initialise le service de log
  // en calculant la différence de timestamp entre le front et le back
  $.ajax(pmLocalConfig.backend.baseUrl + 'synchronize',
      {timeout: 3000})
      .done(function(data) {
        try {
          window.pmCommonConfigFrontBackTimestampInterval = data.Response.unitResponses[0].UnitResponse.objects[0].TimeStamp.instant - moment().unix();
        } catch (e) {
          if (pmLocalConfig.isDevelopment) {
            console.error(e.message);
          }
        }
      })
      .fail(function(data, status) {
        if (pmLocalConfig.isDevelopment) {
          console.error(data);
          console.error(status);
        }
      })
      .always(function() {
        // bootstrap de l'application
        angular.element(document).ready(function() {
          angular.bootstrap(document, ['pmApp']);
        });
      });

// fin IIFE
})();
