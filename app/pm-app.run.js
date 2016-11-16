/** 
 * Run du module global
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
      .module('pmApp')
      .run([
        '$http',
        '$templateCache',
        '$rootRouter',
        function(
            $http,
            $templateCache,
            $rootRouter
            ) {

          // chargement des templates d'erreur de validation
          var templates = [
            {
              id: 'pm-front-generic-validation-messages',
              url: 'app/common/templates/validation/front-generic-validation-messages.html'
            },
            {
              id: 'pm-front-datetime-validation-messages',
              url: 'app/common/templates/validation/front-datetime-validation-messages.html'
            },
            {
              id: 'pm-back-global-validation-messages',
              url: 'app/common/templates/validation/back-global-validation-messages.html'
            },
            {
              id: 'pm-back-validation-messages',
              url: 'app/common/templates/validation/back-validation-messages.html'
            }
          ];

          for (var i = 0, length = templates.length; i < length; i++) {
            $http.get(templates[i].url, {i: i})
                .then(function(response) {
                  $templateCache.put(templates[response.config.i].id, response.data);
                });
          }

          // extension du router
          var $navigateByInstruction = $rootRouter.navigateByInstruction;
          $rootRouter.navigateByInstruction = function(instruction) {
            this.pmLastRequestedUrl = instruction.toRootUrl();
            $navigateByInstruction.apply(this, arguments);
          };

        }]);

// fin IIFE
})();