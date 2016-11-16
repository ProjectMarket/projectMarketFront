/** 
 * Directive abxForm - met en forme un formulaire
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: form-directive.js 646 2016-03-03 15:21:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxForm';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName, [
        'abx.common.logService',
        'abx.common.flashMessageService',
        'abx.common.routerService',
        Directive
      ]);

  function Directive(
      abxLog,
      abxFlashMessage,
      abxRouter
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
      require: 'form',
      templateUrl: 'app/common/directives/form/form-directive.html',
      replace: true,
      transclude: true,
      controller: function($scope, $element, $attrs) {

        $scope._childsResetModel = [];

        this.registerChildResetModel = function(childResetModel) {
          $scope._childsResetModel.push(childResetModel);
        };
      },
      compile: function() {
        return {
          post: function(scope, iElement, iAttrs, formController) {

            iElement.append('* Champ(s) obligatoire(s)');
            
            var _model = {};

            var _resetModel = function() {
              _model.abxFormBackValidation = {
                errors: {},
                params: {}
              };
            };

            // initialisation du modèle pour les validations back
            _model = formController;
            _resetModel();

            // ajoute l'interface de gestion des erreurs
            _model.abxFormBackValidationRegisterError = function(errorCode, params) {
              // ajout de l'erreur pour affichage
              _model.abxFormBackValidation.errors[errorCode] = true;
              _model.abxFormBackValidation.params[errorCode] = params;
            };


            /*
             * Ajout des erreurs de back
             * 
             * @param {object} errorObject
             * @param {object} options
             * options = {undefined|object} {
             *   redirectLinkParams: {undefined|array},
             *   errorMessage: {undefined|string},
             *   advice: {undefined|string}
             * }
             * @return {boolean} L'objet est-il valide ?
             */
            _model.abxFormBackApplyErrors = function(errorObject, options) {
              abxLog.trace({message: "Entrée méthode", object: directiveName, method: "_model.abxFormBackApplyErrors", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: directiveName, method: "_model.abxFormBackApplyErrors"});

              try {
                // réinitialisation des models
                _resetModel();
                var childsResetModel = scope._childsResetModel;
                for (var i = 0, length = childsResetModel.length; i < length; i++) {
                  if (typeof childsResetModel[i] === 'function') {
                    childsResetModel[i]();
                  }
                }

                // pas d'erreur
                if (errorObject.result !== 'error') {
                  return true;
                }

                // erreur générique (500...)
                if (errorObject.errorType === 'back-global-error') {
                  // affectation en erreur globale au formulaire
                  _model.abxFormBackValidationRegisterError(errorObject.errorCode);

                  var options = {
                    errorMessage: "Erreur lors de la soumission du formulaire.",
                    adviceMessage: "Vous pouvez réessayer ou revenir à l'accueil.",
                    errorObject: errorObject
                  };
                  abxFlashMessage.showError(options);

                  return false;
                }

                // erreurs de validation
                var errorResponse = errorObject.objects[0].ErrorResponse,
                    hasGlobalErrors = false,
                    hasFieldErrors = false;

                // globalErrors
                if (errorResponse.globalErrors !== undefined && errorResponse.globalErrors.length > 0) {
                  hasGlobalErrors = true;
                  var globalErrors = errorResponse.globalErrors;
                  for (var i = 0, length = globalErrors.length; i < length; i++) {
                    _model.abxFormBackValidationRegisterError(globalErrors[i].GlobalErrorResource.code, globalErrors[i].GlobalErrorResource.arguments);
                  }
                }

                // fieldsErrors
                if (errorResponse.fieldErrors !== undefined && errorResponse.fieldErrors.length > 0) {
                  hasFieldErrors = true;
                  var fieldErrors = errorResponse.fieldErrors,
                      fieldErrorResource = {},
                      splittedField = [],
                      model = {};

                  for (var i = 0, length = fieldErrors.length; i < length; i++) {
                    fieldErrorResource = fieldErrors[i].FieldErrorResource;

                    // objet incorrect
                    if (fieldErrorResource === undefined || !fieldErrorResource.field) {
                      continue;
                    }

                    // objet inexistant
                    if (fieldErrorResource.field === 'id' && fieldErrorResource.code === 'id-does-not-exist') {
                      if (options === undefined) {
                        options = {};
                      }
                      if (options.redirectLinkParams === undefined) {
                        options.redirectLinkParams = ['Core.home'];
                      }
                      if (options.errorMessage === undefined) {
                        options.errorMessage = "L'élément que vous essayez de modifier n'existe pas ou plus.";
                      }

                      var errorOptions = {
                        errorMessage: options.errorMessage,
                        advice: options.advice
                      };
                      abxFlashMessage.showError(errorOptions);
                      abxRouter.navigate(options.redirectLinkParams);
                      return false;
                    }

                    // affectation au champ
                    splittedField = fieldErrorResource.field.split(/\[(\d+)\]|\./).filter(function(e) {
                      return (e !== undefined && e !== '');
                    });

                    model = _model;
                    for (var j = 0, splittedFieldLength = splittedField.length; j < splittedFieldLength; j++) {
                      if (model[splittedField[j]] === undefined) {
                        break;
                      }
                      model = model[splittedField[j]];
                    }

                    if (typeof model.abxFormBackValidationRegisterError !== "function") {
                      hasGlobalErrors = true;
                      _model.abxFormBackValidationRegisterError(fieldErrorResource.code, fieldErrorResource.arguments);
                    } else {
                      hasFieldErrors = true;
                      model.abxFormBackValidationRegisterError(fieldErrorResource.code, fieldErrorResource.arguments);
                    }
                  }
                }

                // erreur inconnue
                if (!hasGlobalErrors && !hasFieldErrors) {
                  _model.abxFormBackValidationRegisterError(errorResponse.code);
                }

                abxFlashMessage.showValidationError();
                return false;

              } catch (e) {
                abxLog.error({message: "Erreur lors de l'envoi du formulaire. Message d'exception={{exceptionMessage}}",
                  params: {exceptionMessage: e.message}, tag: "error", object: directiveName, method: "abxFormBackApplyErrors"});

                var options = {
                  errorMessage: "Erreur lors de l'envoi du formulaire.",
                  errorObject: {errorMessage: e.message}
                };
                abxFlashMessage.showError(options);
                return false;
              }
            };
          }
        };
      }
    };


  }

// fin IIFE
})();