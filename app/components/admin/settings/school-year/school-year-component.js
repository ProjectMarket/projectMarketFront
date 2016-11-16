/** 
 * Component pm.admin.settings.schoolYearComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: school-year-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.admin.settings.schoolYearComponent';

  //***********
  // Component
  //***********
  angular
      .module('pm.components.adminModule')
      .component(componentName, {
        $canActivate: ['pm.common.routerService',
          function(pmRouter) {
            return pmRouter.canActivate(componentName);
          }],
        require: {
          pmAppController: '^pm.appComponent'
        },
        templateUrl: 'app/components/admin/settings/school-year/school-year-component.html',
        controller: [
          'pm.common.logService',
          'pm.common.aclService',
          'pm.common.flashMessageService',
          'pm.common.routerService',
          'pm.common.modelManagerService',
          'pm.common.yearContainerModel',
          'pm.common.schoolYearModel',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      pmLog,
      pmAcl,
      pmFlashMessage,
      pmRouter,
      pmModelManager,
      pmYearContainerModel,
      pmSchoolYearModel
      ) {

    pmLog.trace({message: "Instanciation objet", object: componentName, tag: "objectInstantiation"});

    //********************
    // Propriétés privées
    //********************

    /*
     * @property {object} this
     */
    var _this = this;

    /*
     * Action du formulaire
     * 
     * @property {string} "create"|"update"
     */
    var _formAction = '';

    /*
     * Objets reçus du back
     * 
     * @property {object} 
     */
    var _backObjects = {
      schoolYear: {}
    };


    //******************
    // Méthodes privées
    //******************


    //*********************
    // Propriétés du scope
    //*********************

    /*
     * @property {object} vue-modèle
     */
    var vm = _this.vm = {};

    /*
     * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
     */
    vm.canDisplayView = false;

    /*
     * @property {string} Action du formulaire (create|update)
     */
    vm.formAction = '';

    /*
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * 
     * @property {boolean}
     */
    vm.isSaving = false;

    /*
     * @property {object} Objet schoolYear
     */
    vm.schoolYear = {
      objectDisplayName: undefined,
      dateStart: {
        value: undefined,
        minDate: undefined,
        maxDate: undefined
      },
      dateEnd: {
        value: undefined,
        minDate: undefined,
        maxDate: undefined
      }
    };

    /*
     * L'update est-il autorisé ?
     * 
     * @property {boolean}
     */
    vm.isAllowedUpdate = false;


    //*******************
    // Méthodes du scope
    //*******************

    /*
     * Navigation
     * 
     * @param {string} location
     * @return {void} 
     */
    vm.navigate = function(location) {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.navigate", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});

      var linkParams;
      switch (location) {
        case 'home':
          linkParams = ['Admin.settings.home'];
          break;
        case 'update':
          linkParams = ['Admin.settings.schoolYear', {action: 'update', schoolYearId: _backObjects.schoolYear.SchoolYear.id}];
          break;
        default :
          pmLog.error({message: "Paramètre incorrect. {{params}}",
            params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});
          return;
      }
      pmRouter.navigate(linkParams);
    };

    /*
     * Annulation du formulaire
     * 
     * @return {void} 
     */
    vm.cancel = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.cancel", tag: "methodEntry"});

      pmFlashMessage.showCancel();
      pmRouter.navigate(['Admin.settings.home']);
    };

    /*
     * Enregistrement du schoolYear
     * 
     * @return {void} 
     */
    vm.save = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "save", tag: "methodEntry"});

      // formulaire invalide
      if (!vm.ngForm.SchoolYear.$valid || vm.isSaving) {
        return;
      }

      try {
        pmFlashMessage.showWait();
        vm.isSaving = true;

        var formSchoolYear = {
          action: _formAction,
          schoolYear: {
            dateStart: vm.schoolYear.dateStart.value,
            dateEnd: vm.schoolYear.dateEnd.value,
            id: (_backObjects.schoolYear.SchoolYear !== undefined ? _backObjects.schoolYear.SchoolYear.id : undefined)
          }
        };

        pmSchoolYearModel.createUpdate(formSchoolYear)
            .then(function(response) {
              // succès
              if (response[0].SchoolYear !== undefined) {
                var textContent = "L'année scolaire a été "
                    + (_formAction === 'create' ? "créée" : "modifiée")
                    + " avec succès.";
                pmFlashMessage.showSuccess(textContent);
                pmRouter.navigate(['Admin.settings.home']);
                return;
              }

              // erreur
              pmLog.debug({message: "Erreur lors de l'enregistrement du schoolYear.", tag: "save", object: componentName, method: "vm.save"});
              vm.ngForm.SchoolYear.pmFormBackApplyErrors(response[0],
                  {redirectLinkParams: ['Admin.settings.home'],
                    errorMessage: "L'année scolaire que vous essayez de modifier n'existe pas."});

              vm.isSaving = false;

            });
      } catch (e) {
        pmLog.error({message: "Erreur lors de l'envoi de l'objet au back. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "save"});

        var options = {
          errorMessage: "La " + (_formAction === 'create' ? "création" : "modification") + " de l'année scolaire a échoué.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(options);
        vm.isSaving = false;
      }
    };


    //****************************
    // Méthodes du lifecycle hook
    //****************************

    /*
     * Hook lancé juste avant la fin de la navigation
     * 
     * @param {object} ComponentInstruction nextInstruction Composant en cours
     * @param {object} ComponentInstruction prevInstruction Composant précédent
     * @return {void} 
     */
    _this.$routerOnActivate = function(nextInstruction, prevInstruction) {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});
      
      _this.pmAppController.vm.setModule('admin.settings');

      try {
        // validation des paramètres
        var routeParams = angular.copy(nextInstruction.params);

        // validation :action
        if (["create", "read", "update"].indexOf(routeParams.action) < 0) {
          pmRouter.navigateToErrorPage('404', 'params');
          return;
        }

        // validation :schoolYearId
        var schoolYearId = parseInt(routeParams.schoolYearId);
        if (isNaN(schoolYearId)) {
          if (routeParams.action !== 'create') {
            pmLog.info({message: "SchoolYearId incorrect. action={{action}}|schoolYearId={{schoolYearId}}",
              params: {action: routeParams.action, schoolYearId: routeParams.schoolYearId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
            pmRouter.navigateToErrorPage('404', 'params');
            return;
          } else {
            schoolYearId = undefined;
          }
        }
        routeParams.schoolYearId = schoolYearId;

        // récupération des données + validation
        pmModelManager.addConcatRequest([
          {modelMethod: pmYearContainerModel.readCurrent, options: {forceBackRead: true}},
          {modelMethod: pmSchoolYearModel.readCurrent, options: {forceBackRead: true}}
        ])
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1];

              // erreur ou abscence de YearContainer
              if (pmModelManager.checkYearContainer(yearContainerResult) === false) {
                return;
              }

              // CREATE
              if (routeParams.action === 'create' && schoolYearResult === undefined) {
                // vérification des ACL
                if (!pmAcl.isAllowedManageCrudObject('SCHOOLYEAR', 'create')) {
                  pmRouter.navigateToErrorPage('acl', 'forbidden');
                  return;
                }
                _formAction = 'create';

                // UPDATE / READ
              } else {
                if (schoolYearResult.result !== undefined || schoolYearResult.SchoolYear === undefined) {
                  throw new Error("Impossible de récupérer l'année scolaire");
                }
                if (routeParams.action === 'create') {
                  routeParams.schoolYearId = schoolYearResult.SchoolYear.id;
                  routeParams.action = 'update';
                  var options = {
                    errorMessage: "Une année scolaire existe déjà.",
                    adviceMessage: "Vous pouvez modifier cette année scolaire."
                  };
                  pmFlashMessage.showError(options);
                }


                // vérification des ACL
                if (routeParams.action === 'read') {
                  if (!pmAcl.isAllowedManageCrudObject('SchoolYear', 'read')) {
                    pmRouter.navigateToErrorPage('acl', 'forbidden');
                    return;
                  }
                } else {
                  if (!pmAcl.isAllowedManageCrudObject(schoolYearResult.SchoolYear, 'update')) {
                    pmRouter.navigateToErrorPage('acl', 'forbidden');
                    return;
                  }
                }

                _formAction = routeParams.action;
                _backObjects.schoolYear = schoolYearResult;
              }

              // à partir de ce point, l'action est autorisée

              // affectations des données
              var yearContainer = yearContainerResult.YearContainer,
                  minDate = yearContainer.dateStart,
                  maxDate = yearContainer.dateEnd;



              // affectation de l'action et des valeurs par défaut
              vm.schoolYear.dateStart.minDate = vm.schoolYear.dateEnd.minDate = minDate;
              vm.schoolYear.dateStart.maxDate = vm.schoolYear.dateEnd.maxDate = maxDate;


              // CREATE
              if (_formAction === 'create') {
                if (yearContainer.defaultSchoolYearDateStart instanceof Date) {
                  vm.schoolYear.dateStart.value = yearContainer.defaultSchoolYearDateStart;
                }
                if (yearContainer.defaultSchoolYearDateEnd instanceof Date) {
                  vm.schoolYear.dateEnd.value = yearContainer.defaultSchoolYearDateEnd;
                }

                // UPDATE / READ
              } else {
                if (routeParams.action === "read") {
                  vm.isAllowedUpdate = pmAcl.isAllowedManageCrudObject(_backObjects.schoolYear.SchoolYear, 'update');
                }
                
                vm.schoolYear.objectDisplayName = pmSchoolYearModel.getObjectsDisplayNames([_backObjects.schoolYear])[0];
                vm.schoolYear.dateStart.value = _backObjects.schoolYear.SchoolYear.dateStart;
                vm.schoolYear.dateEnd.value = _backObjects.schoolYear.SchoolYear.dateEnd;
              }

              vm.formAction = _formAction;
              vm.canDisplayView = true;
            });

      } catch (e) {
        pmLog.error({message: "Erreur lors du $routerOnActivate. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});

        var options = {
          errorMessage: "Erreur lors de l'affectation des données de formulaire.",
          adviceMessage: "Vous ne pouvez pas créer ou modifier une année scolaire.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(options);

        pmRouter.navigate(['Core.home']);
      }

    };
  }

// fin IIFE
})();