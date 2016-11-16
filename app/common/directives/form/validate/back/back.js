/** 
 * Directive abxFormValidateBack - gère les erreur de validation du back sur un champ de formulaire
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: back.js 516 2016-02-03 15:39:04Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxFormValidateBack';

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


    //***********
    // Directive
    //***********

    return {
      restrict: 'A',
      require: ['ngModel', '^abxForm'],
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, controllers) {
            
            var ngModelController = controllers[0],
                abxFormController = controllers[1],
                _model = {};

            var _resetModel = function() {
              _model.abxFormBackValidation = {
                errors: {},
                params: {}
              };
            };

            // initialisation du modèle pour les validations back
            _model = ngModelController;
            _resetModel();

            // enregistrement auprès de abxForm
            abxFormController.registerChildResetModel(_resetModel);

            // ajoute l'interface de gestion des erreurs
            _model.abxFormBackValidationRegisterError = function(errorCode, params) {

              // ajout d'une erreur générique au champ
              _model.$setValidity('abxFormValidateBack', false);

              // ajout de l'erreur pour affichage
              _model.abxFormBackValidation.errors[errorCode] = true;
              _model.abxFormBackValidation.params[errorCode] = params;
            };

            // ajoute un valideur global
            _model.$validators.abxFormValidateBack = function() {
              // on supprime l'erreur de champ car il vient d'être modifié
              // et qu'un ne sait pas si le champ est valide car c'est une validation du back
              // c'est un faux valideur qui retourne toujours true
              return true;
            };
            

          }
        };
      }
    };


  }

// fin IIFE
})();