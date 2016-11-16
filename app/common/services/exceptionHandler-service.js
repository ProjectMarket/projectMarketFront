/** 
 * Service de gestion des erreurs (surcharge le service d'Angular)
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: exceptionHandler-service.js 368 2015-12-09 15:16:48Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = '$exceptionHandler';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$injector',
        function(
            $injector
            ) {

          //********************
          // Factory
          //********************
          return function(exception, cause) {
            console.error(exception, cause);
            var abxLog = $injector.get('abx.common.logService'),
                abxRouter = $injector.get('abx.common.routerService');

            // log
            abxLog.critical({message: exception, tag: objectName, object: cause || 'unknown'});

            // redirection vers la page d'erreur
            abxRouter.navigateToErrorPage('global', 'fatal');
          };

        }]
          );
// fin IIFE
})();