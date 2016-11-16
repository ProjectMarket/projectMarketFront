/** 
 * Initialisation du module global
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-app.bootstrap.js 339 2015-12-04 15:39:15Z vguede $
 */

/* global angular, moment, e, abxLocalConfig */

// encapsulation dans une IIFE
(function() {

  'use strict';

  window.abxCommonConfigFrontBackTimestampInterval = 0;

  // initialise le service de log
  // en calculant la différence de timestamp entre le front et le back
  $.ajax(abxLocalConfig.backend.baseUrl + 'synchronize',
      {timeout: 3000})
      .done(function(data) {
        try {
          window.abxCommonConfigFrontBackTimestampInterval = data.Response.unitResponses[0].UnitResponse.objects[0].TimeStamp.instant - moment().unix();
        } catch (e) {
          if (abxLocalConfig.isDevelopment) {
            console.error(e.message);
          }
        }
      })
      .fail(function(data, status) {
        if (abxLocalConfig.isDevelopment) {
          console.error(data);
          console.error(status);
        }
      })
      .always(function() {
        // bootstrap de l'application
        angular.element(document).ready(function() {
          angular.bootstrap(document, ['abxApp']);
        });
      });

// fin IIFE
})();
