/** 
 * Component abx.admin.settings.alternatingWeeksComponent
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

  var componentName = 'abx.admin.settings.alternatingWeeksComponent';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.adminModule')
      .component(componentName, {
        $canActivate: ['abx.common.routerService',
          function(abxRouter) {
            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/admin/settings/alternating-weeks/alternating-weeks-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.aclService',
          'abx.common.flashMessageService',
          'abx.common.routerService',
          'abx.common.modelManagerService',
          'abx.common.yearContainerModel',
          'abx.common.schoolYearModel',
          'abx.common.alternatingWeeksModel',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      abxLog,
      abxAcl,
      abxFlashMessage,
      abxRouter,
      abxModelManager,
      abxYearContainerModel,
      abxSchoolYearModel,
      abxAlternatingWeeksModel
      ) {

    abxLog.trace({message: "Instanciation objet", object: componentName, tag: "objectInstantiation"});

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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.addYearWeekCollections", tag: "methodEntry"});

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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deleteYearWeekCollections", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.cancel", tag: "methodEntry"});

      abxFlashMessage.showCancel();
      abxRouter.navigate(['Admin.settings.home']);
    };

    /*
     * Navigation
     * 
     * @param {string} location
     * @return {void} 
     */
    vm.navigate = function(location) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.navigate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
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
          abxLog.error({message: "Paramètre incorrect. {{params}}",
            params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});
          return;
      }
      abxRouter.navigate(linkParams);
    };

    /*
     * Enregistrement du alternatingWeeks
     * 
     * @return {void} 
     */
    vm.save = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.save", tag: "methodEntry"});

      // formulaire invalide ou déjà en cours d'enregistrement
      if (!vm.ngForm.AlternatingWeeks.$valid || vm.isSaving) {
        return;
      }

      abxFlashMessage.showWait();
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

        abxAlternatingWeeksModel.createUpdate(formAlternatingWeeks)
            .then(function(response) {

              // succès
              if (response[0].AlternatingWeeks !== undefined) {
                abxLog.debug({message: "AlternatingWeeks enregistré avec succès.", tag: "save", object: componentName, method: "vm.save"});
                var textContent = "L'alternance de semaines a été "
                    + (_formAction === 'create' ? "créée" : "modifiée")
                    + " avec succès.";
                abxFlashMessage.showSuccess(textContent);
                abxRouter.navigate(['Admin.settings.home']);
                return;
              }

              // erreur
              abxLog.debug({message: "Erreur lors de l'enregistrement de l'AlternatingWeeks.", tag: "save", object: componentName, method: "vm.save"});
              vm.ngForm.AlternatingWeeks.abxFormBackApplyErrors(response[0],
                  {redirectLinkParams: ['Admin.settings.home'],
                    errorMessage: "L'alternance de semaines que vous essayez de modifier n'existe pas ou plus."});

              vm.isSaving = false;
            });

      } catch (e) {
        abxLog.error({message: "Erreur catchée lors de l'enregistrement de l'alternance de semaines. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.save"});

        var errorOptions = {
          errorMessage: "La " + (_formAction === 'create' ? "création" : "modification") + " de l'alternance de semaines a échoué.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(errorOptions);

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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.abxAppController.vm.setModule('admin.settings');

      try {
        // validation des paramètres
        var routeParams = angular.copy(nextInstruction.params);
        // validation :action
        if (["create", "read", "update"].indexOf(routeParams.action) < 0) {
          abxRouter.navigateToErrorPage('404', 'params');
          return;
        }

        // validation :alternatingWeeksId

        var alternatingWeeksId = parseInt(routeParams.alternatingWeeksId);
        if (isNaN(alternatingWeeksId)) {
          if (routeParams.action !== 'create') {
            abxLog.info({message: "AlternatingWeeksId incorrect. action={{action}}|alternatingWeeksId={{alternatingWeeksId}}",
              params: {action: routeParams.action, alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
            abxRouter.navigateToErrorPage('404', 'params');
            return;
          } else {
            alternatingWeeksId = undefined;
          }
        }
        routeParams.alternatingWeeksId = alternatingWeeksId;

        // récupération des données
        var concatRequests = [
          {modelMethod: abxYearContainerModel.readCurrent, options: {}},
          {modelMethod: abxSchoolYearModel.readCurrent, options: {forceBackRead: true}}
        ];
        if (routeParams.alternatingWeeksId !== undefined) {
          concatRequests.push({modelMethod: abxAlternatingWeeksModel.readByAlternatingWeeksId, options: {alternatingWeeksId: routeParams.alternatingWeeksId, forceBackRead: true}});
        }

        abxModelManager.addConcatRequest(concatRequests)
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1],
                  alternatingWeeksResult = response[2],
                  alternatingWeeks = {};

              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (abxModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              // validation du :alternatingWeeksResult
              if (routeParams.alternatingWeeksId !== undefined) {
                // pas de alternatingWeeks trouvé
                if (alternatingWeeksResult === undefined) {
                  abxLog.debug({message: "AlternatingWeeks inexistant : alternatingWeeksId={{alternatingWeeksId}}.", object: componentName, method: "$routerOnActivate",
                    params: {alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "settings"});

                  // DUPLICATE
                  if (routeParams.action === "create") {
                    // transforme en CREATE
                    routeParams.alternatingWeeksId = undefined;
                    var errorOptions = {
                      errorMessage: "L'alternance de semaines à dupliquer n'existe plus.",
                      adviceMessage: "Vous pouvez créer une nouvelle alternance de semaines."
                    };
                    abxFlashMessage.showError(errorOptions);

                  } else {
                    // UPDATE | READ
                    abxFlashMessage.showError({errorMessage: "L'alternance de semaines n'existe pas ou plus."});
                    abxRouter.navigate(['Admin.settings.home']);
                    return;
                  }

                } else if (alternatingWeeksResult.result !== undefined || alternatingWeeksResult.AlternatingWeeks === undefined) {
                  abxLog.error({message: "Impossible de récupérer un alternatingWeeks depuis le back : alternatingWeeksId={{alternatingWeeksId}}.", object: componentName,
                    params: {alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "settings", method: "$routerOnActivate"});

                  if (routeParams.action === "create") {
                    routeParams.alternatingWeeksId = undefined;
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération de l'alternance de semaines à dupliquer.",
                      adviceMessage: "Vous pouvez créer une nouvelle alternance de semaines."
                    };
                    abxFlashMessage.showError(errorOptions);

                  } else {
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération de l'alternance de semaines.",
                      adviceMessage: "Vous ne pouvez pas " + (routeParams.action === 'update' ? "modifier" : "afficher") + " cette alternance de semaines.",
                      errorObject: {objectName: 'AlternatingWeeks',
                        errorMessage: 'alternatingWeeksId = ' + routeParams.alternatingWeeksId}
                    };
                    abxFlashMessage.showError(errorOptions);
                    abxRouter.navigate(['Admin.settings.home']);
                    return;
                  }
                } else {
                  alternatingWeeks = alternatingWeeksResult.AlternatingWeeks;
                }

              }

              // vérification des ACL
              var aclObjet = (routeParams.action === 'update' ? alternatingWeeks : 'alternatingWeeks');
              if (!abxAcl.isAllowedManageCrudObject(aclObjet, routeParams.action)) {
                abxRouter.navigateToErrorPage('acl', 'forbidden');
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
                  vm.isAllowedUpdate = abxAcl.isAllowedManageCrudObject(_backObjects.alternatingWeeks, 'update');
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

              abxLog.debug({message: "AlternatingWeeks initialisé : {{alternatingWeeks}}.", object: componentName,
                params: {alternatingWeeks: vm.alternatingWeeks}, tag: "vm", method: "$routerOnActivate"});
              abxLog.debug({message: "YearWeekCollections initialisées : {{yearWeekCollections}}.", object: componentName,
                params: {yearWeekCollections: vm.yearWeekCollections}, tag: "vm", method: "$routerOnActivate"});

              vm.canDisplayView = true;
            });
      } catch (e) {

        var errorMessage = "Erreur lors de l'affectation des données de formulaire.";
        abxLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas créer, modifier ou afficher cette alternance de semaines.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(options);
        abxRouter.navigate(['Admin.settings.home']);
      }
      ;
    };
  }

// fin IIFE
})();