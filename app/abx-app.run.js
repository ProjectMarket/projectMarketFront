/** 
 * Run du module global
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-app.run.js 646 2016-03-03 15:21:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  angular
      .module('abxApp')
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
              id: 'abx-front-generic-validation-messages',
              url: 'app/common/templates/validation/front-generic-validation-messages.html'
            },
            {
              id: 'abx-front-datetime-validation-messages',
              url: 'app/common/templates/validation/front-datetime-validation-messages.html'
            },
            {
              id: 'abx-back-global-validation-messages',
              url: 'app/common/templates/validation/back-global-validation-messages.html'
            },
            {
              id: 'abx-back-validation-messages',
              url: 'app/common/templates/validation/back-validation-messages.html'
            }
          ]

          // FIXME A supprimer quand le bug du router (templateUrl) sera corrigé
//          var componentsTemplates = [
//            'app/components/core/profile/profile-component.html',
//            'app/components/admin/settings/home/home-component.html',
//            'app/components/admin/settings/school-year/school-year-component.html',
//            'app/components/core/error/error-component.html',
//            'app/components/core/home/home-component.html',
//            'app/components/core/index/index-component.html',
//            'app/components/core/login/login-component.html',
//            'app/components/core/logout/logout-component.html',
//            'app/components/layout-component.html',
//            'app/components/admin/settings/period-type/period-type-component.html',
//            'app/components/admin/settings/timetable-container/timetable-container-component.html',
//            'app/components/admin/permissions/permissions-component.html'
//                , 'app/components/core/help/help-component.html'
//                //injectTemplateFromGulp
//
//          ],
//              componentsTemplatesLength = componentsTemplates.length;
//          for (var i = 0; i < componentsTemplatesLength; i++) {
//            templates.push({id: componentsTemplates[i], url: componentsTemplates[i]});
//          }

          for (var i = 0, length = templates.length; i < length; i++) {
            $http.get(templates[i].url, {i: i})
                .then(function(response) {
                  $templateCache.put(templates[response.config.i].id, response.data);
                });
          }

          // extension du router
          var $navigateByInstruction = $rootRouter.navigateByInstruction;
          $rootRouter.navigateByInstruction = function(instruction) {
            this.abxLastRequestedUrl = instruction.toRootUrl();
            $navigateByInstruction.apply(this, arguments);
          };

        }]);

// fin IIFE
})();