/** 
 * Component pm.admin.settings.alternatingWeeksComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: period-type-component.js 675 2016-03-14 16:08:09Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.admin.settings.alternatingWeeksComponent';

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
        templateUrl: 'app/components/admin/settings/alternating-weeks/alternating-weeks-component.html',
        controller: [
          'pm.common.logService',
          'pm.common.aclService',
          'pm.common.flashMessageService',
          'pm.common.routerService',
          'pm.common.modelManagerService',
          'pm.common.yearContainerModel',
          'pm.common.schoolYearModel',
          'pm.common.alternatingWeeksModel',
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
      pmSchoolYearModel,
      pmAlternatingWeeksModel
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
     * @property {object} Paramètres de la route
     */
    var _routeParams = {};

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
      yearContainer: {},
      schoolYear: {},
      alternatingWeeks: {}
    };

    /*
     * Modèle d'objet yearWeekCollections
     * 
     * @property {object}
     */
    var _yearWeekCollectionsObjectModel = {
      name: {
        value: null,
        minLength: 1,
        maxLength: 20
      },
      canDelete: false
    };

    /*
     * Modèle d'objet alternatingWeeks
     * 
     * @property {object}
     */
    var _alternatingWeeksObjectModel = {
      name: {
        value: '',
        minLength: 2,
        maxLength: 30
      },
      dateStart: {
        value: null,
        minDate: null,
        maxDate: null,
        canEdit: true
      },
      dateEnd: {
        value: null,
        minDate: null,
        maxDate: null,
        canEdit: true
      }
    };
    //******************
    // Méthodes privées
    //******************


    //*********************
    // Propriétés du scope
    //*********************

    /*
     * Vue-modèle
     * 
     * @property {object} 
     */
    var vm = _this.vm = {};

    /*
     * Le hook $routerOnActivate est-t-il terminé ?
     * 
     * @property {boolean} 
     */
    vm.canDisplayView = false;

    /*
     * Action du formulaire (create|update)
     * 
     * @property {string} 
     */
    vm.formAction = '';

    /*
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * 
     * @property {boolean}
     */
    vm.isSaving = false;

    /*
     * Peut-on ajouter une semaine ?
     * 
     * @property {boolean}
     */
    vm.isAllowedAddYearWeekCollections = false;

    /*
     * Liste des yearWeekCollections
     * 
     * @property {array} 
     */
    vm.yearWeekCollections = [];

    /*
     * AlternatingWeeks
     * 
     * @property {object}
     */
    vm.alternatingWeeks = {};

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
     * Ajout d'une semaine
     * 
     * @return {void} 
     */
    vm.addYearWeekCollections = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.addYearWeekCollections", tag: "methodEntry"});

      var yearWeekCollections = angular.copy(_yearWeekCollectionsObjectModel);

      yearWeekCollections.canDelete = true;

      vm.yearWeekCollections.push(yearWeekCollections);
    };

    /*
     * Suppression d'une ou plusieurs semaines
     * 
     * @param {array} index
     * @return {void} 
     */
    vm.deleteYearWeekCollections = function(index) {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deleteYearWeekCollections", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.deleteYearWeekCollections"});

      // on trie index par ordre inverse pour ne pas modifier les indices à supprimer
      index.sort(function(a, b) {
        return b - a;
      });

      for (var i = 0, length = index.length; i < length; i++) {
        vm.yearWeekCollections.splice(index[i], 1);
      }
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
          linkParams = ['Admin.settings.alternatingWeeks', {action: 'update', alternatingWeeksId: _backObjects.alternatingWeeks.id}];
          break;
        default :
          pmLog.error({message: "Paramètre incorrect. {{params}}",
            params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});
          return;
      }
      pmRouter.navigate(linkParams);
    };

    /*
     * Enregistrement du alternatingWeeks
     * 
     * @return {void} 
     */
    vm.save = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.save", tag: "methodEntry"});

      // formulaire invalide ou déjà en cours d'enregistrement
      if (!vm.ngForm.AlternatingWeeks.$valid || vm.isSaving) {
        return;
      }

      pmFlashMessage.showWait();
      vm.isSaving = true;


      try {
        var formAlternatingWeeks = {
          action: _formAction,
          alternatingWeeks: {
            name: vm.alternatingWeeks.name.value,
            schoolYearId: _backObjects.schoolYear.id,
            startDateForWeeksGeneration: vm.alternatingWeeks.dateStart.value,
            endDateForWeeksGeneration: vm.alternatingWeeks.dateEnd.value,
            id: _backObjects.alternatingWeeks.id,
            labels: {}
          }
        };

        for (var i = 0, length = vm.yearWeekCollections.length; i < length; i++) {
          formAlternatingWeeks.alternatingWeeks.labels[i] = vm.yearWeekCollections[i].name.value;
        }

        pmAlternatingWeeksModel.createUpdate(formAlternatingWeeks)
            .then(function(response) {

              // succès
              if (response[0].AlternatingWeeks !== undefined) {
                pmLog.debug({message: "AlternatingWeeks enregistré avec succès.", tag: "save", object: componentName, method: "vm.save"});
                var textContent = "L'alternance de semaines a été "
                    + (_formAction === 'create' ? "créée" : "modifiée")
                    + " avec succès.";
                pmFlashMessage.showSuccess(textContent);
                pmRouter.navigate(['Admin.settings.home']);
                return;
              }

              // erreur
              pmLog.debug({message: "Erreur lors de l'enregistrement de l'AlternatingWeeks.", tag: "save", object: componentName, method: "vm.save"});
              vm.ngForm.AlternatingWeeks.pmFormBackApplyErrors(response[0],
                  {redirectLinkParams: ['Admin.settings.home'],
                    errorMessage: "L'alternance de semaines que vous essayez de modifier n'existe pas ou plus."});

              vm.isSaving = false;
            });

      } catch (e) {
        pmLog.error({message: "Erreur catchée lors de l'enregistrement de l'alternance de semaines. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.save"});

        var errorOptions = {
          errorMessage: "La " + (_formAction === 'create' ? "création" : "modification") + " de l'alternance de semaines a échoué.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(errorOptions);

        vm.isSaving = false;
      }
    };


    //************
    // Listeners
    //************


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

        // validation :alternatingWeeksId

        var alternatingWeeksId = parseInt(routeParams.alternatingWeeksId);
        if (isNaN(alternatingWeeksId)) {
          if (routeParams.action !== 'create') {
            pmLog.info({message: "AlternatingWeeksId incorrect. action={{action}}|alternatingWeeksId={{alternatingWeeksId}}",
              params: {action: routeParams.action, alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
            pmRouter.navigateToErrorPage('404', 'params');
            return;
          } else {
            alternatingWeeksId = undefined;
          }
        }
        routeParams.alternatingWeeksId = alternatingWeeksId;

        // récupération des données
        var concatRequests = [
          {modelMethod: pmYearContainerModel.readCurrent, options: {}},
          {modelMethod: pmSchoolYearModel.readCurrent, options: {forceBackRead: true}}
        ];
        if (routeParams.alternatingWeeksId !== undefined) {
          concatRequests.push({modelMethod: pmAlternatingWeeksModel.readByAlternatingWeeksId, options: {alternatingWeeksId: routeParams.alternatingWeeksId, forceBackRead: true}});
        }

        pmModelManager.addConcatRequest(concatRequests)
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1],
                  alternatingWeeksResult = response[2],
                  alternatingWeeks = {};

              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (pmModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              // validation du :alternatingWeeksResult
              if (routeParams.alternatingWeeksId !== undefined) {
                // pas de alternatingWeeks trouvé
                if (alternatingWeeksResult === undefined) {
                  pmLog.debug({message: "AlternatingWeeks inexistant : alternatingWeeksId={{alternatingWeeksId}}.", object: componentName, method: "$routerOnActivate",
                    params: {alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "settings"});

                  // DUPLICATE
                  if (routeParams.action === "create") {
                    // transforme en CREATE
                    routeParams.alternatingWeeksId = undefined;
                    var errorOptions = {
                      errorMessage: "L'alternance de semaines à dupliquer n'existe plus.",
                      adviceMessage: "Vous pouvez créer une nouvelle alternance de semaines."
                    };
                    pmFlashMessage.showError(errorOptions);

                  } else {
                    // UPDATE | READ
                    pmFlashMessage.showError({errorMessage: "L'alternance de semaines n'existe pas ou plus."});
                    pmRouter.navigate(['Admin.settings.home']);
                    return;
                  }

                } else if (alternatingWeeksResult.result !== undefined || alternatingWeeksResult.AlternatingWeeks === undefined) {
                  pmLog.error({message: "Impossible de récupérer un alternatingWeeks depuis le back : alternatingWeeksId={{alternatingWeeksId}}.", object: componentName,
                    params: {alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "settings", method: "$routerOnActivate"});

                  if (routeParams.action === "create") {
                    routeParams.alternatingWeeksId = undefined;
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération de l'alternance de semaines à dupliquer.",
                      adviceMessage: "Vous pouvez créer une nouvelle alternance de semaines."
                    };
                    pmFlashMessage.showError(errorOptions);

                  } else {
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération de l'alternance de semaines.",
                      adviceMessage: "Vous ne pouvez pas " + (routeParams.action === 'update' ? "modifier" : "afficher") + " cette alternance de semaines.",
                      errorObject: {objectName: 'AlternatingWeeks',
                        errorMessage: 'alternatingWeeksId = ' + routeParams.alternatingWeeksId}
                    };
                    pmFlashMessage.showError(errorOptions);
                    pmRouter.navigate(['Admin.settings.home']);
                    return;
                  }
                } else {
                  alternatingWeeks = alternatingWeeksResult.AlternatingWeeks;
                }

              }

              // vérification des ACL
              var aclObjet = (routeParams.action === 'update' ? alternatingWeeks : 'alternatingWeeks');
              if (!pmAcl.isAllowedManageCrudObject(aclObjet, routeParams.action)) {
                pmRouter.navigateToErrorPage('acl', 'forbidden');
                return;
              }


              // à partir de ce point, les paramètres sont valides


              vm.formAction = _formAction = _routeParams.action = routeParams.action;
              _routeParams.alternatingWeeksId = routeParams.alternatingWeeksId;
              _backObjects =
                  {yearContainer: yearContainerResult.YearContainer,
                    schoolYear: schoolYearResult.SchoolYear,
                    alternatingWeeks: alternatingWeeks};

              // affectations des données
              _alternatingWeeksObjectModel.dateStart.minDate = _alternatingWeeksObjectModel.dateEnd.minDate = _backObjects.yearContainer.dateStart;
              _alternatingWeeksObjectModel.dateStart.maxDate = _alternatingWeeksObjectModel.dateEnd.maxDate = _backObjects.yearContainer.dateEnd;

              // affectation de l'action et des valeurs par défaut
              // CREATE
              if (_routeParams.alternatingWeeksId === undefined) {
                vm.isAllowedAddYearWeekCollections = true;

                vm.alternatingWeeks = angular.copy(_alternatingWeeksObjectModel);

                vm.alternatingWeeks.dateStart.value = _backObjects.schoolYear.dateStart;
                vm.alternatingWeeks.dateEnd.value = _backObjects.schoolYear.dateEnd;

                // Semaine #1
                var week = angular.copy(_yearWeekCollectionsObjectModel);
                vm.yearWeekCollections.push(week);

                // Semaine #2
                week = angular.copy(_yearWeekCollectionsObjectModel);
                week.canDelete = true;
                vm.yearWeekCollections.push(week);

                // READ || UPDATE || DUPLICATE
              } else {

                if (routeParams.action === "read") {
                  vm.isAllowedUpdate = pmAcl.isAllowedManageCrudObject(_backObjects.alternatingWeeks, 'update');
                }

                routeParams.action === 'create' ? vm.isAllowedAddYearWeekCollections = true : vm.isAllowedAddYearWeekCollections = false;

                vm.alternatingWeeks = angular.copy(_alternatingWeeksObjectModel);
                // pas de name si DUPLICATE pour éviter le doublon
                if (routeParams.action !== "create") {
                  vm.alternatingWeeks.name.value = _backObjects.alternatingWeeks.name;
                }

                if (routeParams.action === "create") {
                  vm.alternatingWeeks.dateStart.value = _backObjects.schoolYear.dateStart;
                  vm.alternatingWeeks.dateEnd.value = _backObjects.schoolYear.dateEnd;
                } else {
                  vm.alternatingWeeks.dateStart.canEdit = vm.alternatingWeeks.dateEnd.canEdit = false;
                }

                var yearWeekCollectionsObject = {};
                for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
                  yearWeekCollectionsObject = angular.copy(_yearWeekCollectionsObjectModel);
                  yearWeekCollectionsObject.name.value = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label;
                  vm.yearWeekCollections.push(yearWeekCollectionsObject);
                  if (i > 1 && routeParams.action === "create") {
                    yearWeekCollectionsObject.canDelete = true;
                  }
                }

              }

              pmLog.debug({message: "AlternatingWeeks initialisé : {{alternatingWeeks}}.", object: componentName,
                params: {alternatingWeeks: vm.alternatingWeeks}, tag: "vm", method: "$routerOnActivate"});
              pmLog.debug({message: "YearWeekCollections initialisées : {{yearWeekCollections}}.", object: componentName,
                params: {yearWeekCollections: vm.yearWeekCollections}, tag: "vm", method: "$routerOnActivate"});

              vm.canDisplayView = true;
            });
      } catch (e) {

        var errorMessage = "Erreur lors de l'affectation des données de formulaire.";
        pmLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas créer, modifier ou afficher cette alternance de semaines.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(options);
        pmRouter.navigate(['Admin.settings.home']);
      }
      ;
    };
  }

// fin IIFE
})();