/** 
 * Directive abxFormGroup - met en forme un groupe pour un formulaire
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: group-directive.js 510 2016-02-02 13:33:38Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxFormGroup';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            Directive]);

  function Directive(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    //********************
    // Propriétés privées
    //********************


    //******************
    // Méthodes privées
    //******************

    // directive
    return {
      restrict: 'E',
      require: ['form', '^abxForm'],
      templateUrl: 'app/common/directives/form/group/group-directive.html',
      replace: true,
      transclude: true,
      compile: function() {

        return {
          post: function(scope, iElement, iAttrs, controllers) {

            var formController = controllers[0],
                abxFormController = controllers[1],
                _model = {};

            var _resetModel = function() {
              _model.abxFormBackValidation = {
                errors: {},
                params: {}
              };
            };

            // initialisation du modèle pour les validations back
            _model = formController;
            _resetModel();

            // enregistrement auprès de abxForm
            abxFormController.registerChildResetModel(_resetModel);

            // ajoute l'interface de gestion des erreurs
            _model.abxFormBackValidationRegisterError = function(errorCode, params) {
              // ajout de l'erreur pour affichage
              _model.abxFormBackValidation.errors[errorCode] = true;
              _model.abxFormBackValidation.params[errorCode] = params;
            };
          }
        };
      }
    };
  }

// fin IIFE
})();