/** 
 * Component abx.admin.settings.periodTypeComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: period-type-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'abx.admin.settings.periodTypeComponent';

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
        templateUrl: 'app/components/admin/settings/period-type/period-type-component.html',
        controller: [
          '$scope',
          'abx.common.logService',
          'abx.common.aclService',
          'abx.common.flashMessageService',
          'abx.common.routerService',
          'abx.common.timeService',
          'abx.common.modelManagerService',
          'abx.common.yearContainerModel',
          'abx.common.schoolYearModel',
          'abx.common.periodTypeModel',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      $scope,
      abxLog,
      abxAcl,
      abxFlashMessage,
      abxRouter,
      abxTime,
      abxModelManager,
      abxYearContainerModel,
      abxSchoolYearModel,
      abxPeriodTypeModel
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
      periodType: {}
    };

    /*
     * Modèle d'objet Period
     * 
     * @property {object}
     */
    var _periodObjectModel = {
      name: {
        value: '',
        minLength: 2,
        maxLength: 50
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
      },
      canDelete: false
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
     * Peut-on ajouter une période ?
     * 
     * @property {boolean}
     */
    vm.isAllowedAddPeriod = false;

    /*
     * Liste des périodes
     * 
     * @property {array} 
     */
    vm.periods = [];

    /*
     * PeriodType
     * 
     * @property {object}
     */
    vm.periodType = {};

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
     * Ajout d'une période
     * 
     * @return {void} 
     */
    vm.addPeriod = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.addPeriod", tag: "methodEntry"});

      var period = angular.copy(_periodObjectModel),
          lastPeriodDateEnd = vm.periods[vm.periods.length - 1].dateEnd.value,
          schoolYearDateEnd = _backObjects.schoolYear.dateEnd;

      period.canDelete = true;
      period.dateStart.canEdit = false;

      // si le SchoolYear.dateEnd - lastPeriod.dateEnd >= 2 jours => period.dateEnd = SchoolYear.dateEnd
      if (!lastPeriodDateEnd instanceof Date || abxTime.moment(lastPeriodDateEnd).add(2, 'day').isSameOrBefore(schoolYearDateEnd)) {
        period.dateEnd.value = schoolYearDateEnd;

        // si le lastPeriod.dateEnd = SchoolYear.dateEnd => lastPeriod.dateEnd = null, period.dateEnd = SchoolYear.dateEnd
      } else if (lastPeriodDateEnd instanceof Date && abxTime.moment(lastPeriodDateEnd).isSame(schoolYearDateEnd)) {
        vm.periods[vm.periods.length - 1].dateEnd.value = null;
        period.dateEnd.value = schoolYearDateEnd;
      }

      vm.periods.push(period);
    };

    /*
     * Suppression d'une ou plusieurs périodes
     * 
     * @param {array} index
     * @return {void} 
     */
    vm.deletePeriods = function(index) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deletePeriod", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.deletePeriod"});

      // on trie index par ordre inverse pour ne pas modifier les indices à supprimer
      index.sort(function(a, b) {
        return b - a;
      });

      for (var i = 0, length = index.length; i < length; i++) {
        // si l'avant-dernière date de fin n'est pas définie, elle prend la valeur de la date de fin supprimée
        if (!(vm.periods[index[i] - 1].dateEnd.value instanceof Date)) {
          vm.periods[index[i] - 1].dateEnd.value = vm.periods[index[i]].dateEnd.value;
        }
        vm.periods.splice(index[i], 1);
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
          linkParams = ['Admin.settings.periodType', {action: 'update', periodTypeId: _backObjects.periodType.id}];
          break;
        default :
          abxLog.error({message: "Paramètre incorrect. {{params}}",
            params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});
          return;
      }
      abxRouter.navigate(linkParams);
    };

    /*
     * Enregistrement du periodType
     * 
     * @return {void} 
     */
    vm.save = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.save", tag: "methodEntry"});

      // formulaire invalide ou déjà en cours d'enregistrement
      if (!vm.ngForm.PeriodType.$valid || vm.isSaving) {
        return;
      }

      abxFlashMessage.showWait();
      vm.isSaving = true;


      try {
        var formPeriodType = {
          action: _formAction,
          periodType: {
            name: vm.periodType.name.value,
            schoolYearId: _backObjects.schoolYear.id,
            id: _backObjects.periodType.id,
            periods: []
          }
        };

        for (var i = 0, length = vm.periods.length; i < length; i++) {
          formPeriodType.periodType.periods.push({
            name: vm.periods[i].name.value,
            dateStart: vm.periods[i].dateStart.value,
            dateEnd: vm.periods[i].dateEnd.value,
            id: (_backObjects.periodType.periods === undefined ? undefined : _backObjects.periodType.periods[i].Period.id)
          });
        }

        abxPeriodTypeModel.createUpdate(formPeriodType)
            .then(function(response) {
              // succès
              if (response[0].PeriodType !== undefined) {
                abxLog.debug({message: "PeriodType enregistré avec succès.", tag: "save", object: componentName, method: "vm.save"});
                var textContent = "Le groupe de périodes a été "
                    + (_formAction === 'create' ? "créée" : "modifiée")
                    + " avec succès.";
                abxFlashMessage.showSuccess(textContent);
                abxRouter.navigate(['Admin.settings.home']);
                return;
              }

              // erreur
              abxLog.debug({message: "Erreur lors de l'enregistrement du PeriodType.", tag: "save", object: componentName, method: "vm.save"});
              vm.ngForm.PeriodType.abxFormBackApplyErrors(response[0],
                  {redirectLinkParams: ['Admin.settings.home'],
                    errorMessage: "Le groupe de périodes que vous essayez de modifier n'existe pas ou plus."});

              vm.isSaving = false;
            });

      } catch (e) {
        abxLog.error({message: "Erreur catchée lors de l'enregistrement du PeriodType. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.save"});

        var errorOptions = {
          errorMessage: "La " + (_formAction === 'create' ? "création" : "modification") + " du groupe de périodes a échoué.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(errorOptions);

        vm.isSaving = false;
      }
    };


    //************
    // Listeners
    //************

    /*
     * Watch sur les dates de fin des périodes
     * 
     * @returns {void}
     */

    $scope.$watch(function() {
      // -1 : pas le dernier dateEnd
      var periodsLength = vm.periods.length - 1,
          watchArray = [];
      for (var i = 0; i < periodsLength; i++) {
        watchArray.push(vm.periods[i].dateEnd.value);
      }
      return watchArray;
    }, function() {
      // -1 : pas le dernier dateEnd
      var periodsLength = vm.periods.length - 1;
      for (var i = 0; i < periodsLength; i++) {
        if (vm.periods[i].dateEnd.value instanceof Date) {
          vm.periods[i + 1].dateStart.value = abxTime.moment(vm.periods[i].dateEnd.value).add(1, 'day').toDate();
        } else {
          vm.periods[i + 1].dateStart.value = null;
        }
      }
    }, true);


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

        // validation :periodTypeId

        var periodTypeId = parseInt(routeParams.periodTypeId);
        if (isNaN(periodTypeId)) {
          if (routeParams.action !== 'create') {
            abxLog.info({message: "PeriodTypeId incorrect. action={{action}}|periodTypeId={{periodTypeId}}",
              params: {action: routeParams.action, periodTypeId: routeParams.periodTypeId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
            abxRouter.navigateToErrorPage('404', 'params');
            return;
          } else {
            periodTypeId = undefined;
          }
        }
        routeParams.periodTypeId = periodTypeId;

        // récupération des données
        var concatRequests = [
          {modelMethod: abxYearContainerModel.readCurrent, options: {}},
          {modelMethod: abxSchoolYearModel.readCurrent, options: {forceBackRead: true}}
        ];
        if (routeParams.periodTypeId !== undefined) {
          concatRequests.push({modelMethod: abxPeriodTypeModel.readByPeriodTypeId, options: {periodTypeId: routeParams.periodTypeId, forceBackRead: true}});
        }

        abxModelManager.addConcatRequest(concatRequests)
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1],
                  periodTypeResult = response[2],
                  periodType = {};

              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (abxModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              // validation du :periodTypeResult
              if (routeParams.periodTypeId !== undefined) {
                // pas de periodType trouvé
                if (periodTypeResult === undefined) {
                  abxLog.debug({message: "PeriodType inexistant : periodTypeId={{periodTypeId}}.", object: componentName, method: "$routerOnActivate",
                    params: {periodTypeId: routeParams.periodTypeId}, tag: "settings"});

                  // DUPLICATE
                  if (routeParams.action === "create") {
                    // transforme en CREATE
                    routeParams.periodTypeId = undefined;
                    var errorOptions = {
                      errorMessage: "Le groupe de périodes à dupliquer n'existe plus.",
                      adviceMessage: "Vous pouvez créer un nouveau groupe de périodes."
                    };
                    abxFlashMessage.showError(errorOptions);

                  } else {
                    // UPDATE | READ
                    abxFlashMessage.showError({errorMessage: "Le groupe de périodes n'existe pas ou plus."});
                    abxRouter.navigate(['Admin.settings.home']);
                    return;
                  }

                } else if (periodTypeResult.result !== undefined || periodTypeResult.PeriodType === undefined) {
                  abxLog.error({message: "Impossible de récupérer un periodType depuis le back : periodTypeId={{periodTypeId}}.", object: componentName,
                    params: {periodTypeId: routeParams.periodTypeId}, tag: "settings", method: "$routerOnActivate"});

                  if (routeParams.action === "create") {
                    routeParams.periodTypeId = undefined;
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération du groupe de périodes à dupliquer.",
                      adviceMessage: "Vous pouvez créer un nouveau groupe de périodes."
                    };
                    abxFlashMessage.showError(errorOptions);

                  } else {
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération du groupe de périodes.",
                      adviceMessage: "Vous ne pouvez pas " + (routeParams.action === 'update' ? "modifier" : "afficher") + " ce groupe de périodes.",
                      errorObject: {objectName: 'PeriodType',
                        errorMessage: 'periodTypeId = ' + routeParams.periodTypeId}
                    };
                    abxFlashMessage.showError(errorOptions);
                    abxRouter.navigate(['Admin.settings.home']);
                    return;
                  }
                } else {
                  periodType = periodTypeResult.PeriodType;
                }

              }

              // vérification des ACL
              var aclObjet = (routeParams.action === 'update' ? periodType : 'periodType');
              if (!abxAcl.isAllowedManageCrudObject(aclObjet, routeParams.action)) {
                abxRouter.navigateToErrorPage('acl', 'forbidden');
                return;
              }


              // à partir de ce point, les paramètres sont valides


              vm.formAction = _formAction = _routeParams.action = routeParams.action;
              _routeParams.periodTypeId = routeParams.periodTypeId;
              _backObjects =
                  {yearContainer: yearContainerResult.YearContainer,
                    schoolYear: schoolYearResult.SchoolYear,
                    periodType: periodType};

              // affectations des données
              _periodObjectModel.dateStart.minDate = _periodObjectModel.dateEnd.minDate = _backObjects.yearContainer.dateStart;
              _periodObjectModel.dateStart.maxDate = _periodObjectModel.dateEnd.maxDate = _backObjects.yearContainer.dateEnd;
              var periodTypeNameModel = {
                value: '',
                minLength: 2,
                maxLength: 50
              };

              // affectation de l'action et des valeurs par défaut
              // CREATE
              if (_routeParams.periodTypeId === undefined) {
                vm.isAllowedAddPeriod = true;

                vm.periodType.name = periodTypeNameModel;

                // period #1
                var period = angular.copy(_periodObjectModel);
                period.dateStart.value = _backObjects.schoolYear.dateStart;
                vm.periods.push(period);

                // period #2
                period = angular.copy(_periodObjectModel);
                period.dateStart.canEdit = false;
                period.canDelete = true;
                vm.periods.push(period);

                // period #3
                period = angular.copy(_periodObjectModel);
                period.dateStart.canEdit = false;
                period.dateEnd.value = _backObjects.schoolYear.dateEnd;
                period.canDelete = true;
                vm.periods.push(period);

                // READ || UPDATE || DUPLICATE
              } else {
                
                if (routeParams.action === "read") {
                  vm.isAllowedUpdate = abxAcl.isAllowedManageCrudObject(_backObjects.periodType, 'update');
                }

                routeParams.action === 'create' ? vm.isAllowedAddPeriod = true : vm.isAllowedAddPeriod = false;

                vm.periodType.name = periodTypeNameModel;
                // pas de name si DUPLICATE pour éviter le doublon
                if (routeParams.action !== "create") {
                  vm.periodType.name.value = _backObjects.periodType.name;
                }

                var periodObject = {};

                for (var i = 0, length = _backObjects.periodType.periods.length; i < length; i++) {
                  periodObject = angular.copy(_periodObjectModel);
                  periodObject.name.value = _backObjects.periodType.periods[i].Period.name;
                  periodObject.dateStart.value = _backObjects.periodType.periods[i].Period.dateStart;
                  periodObject.dateEnd.value = _backObjects.periodType.periods[i].Period.dateEnd;
                  if (i > 0) {
                    periodObject.dateStart.canEdit = false;
                    if (routeParams.action === "create") {
                      periodObject.canDelete = true;
                    }
                  }
                  vm.periods.push(periodObject);
                }
              }

              abxLog.debug({message: "PeriodType initialisé : {{periodType}}.", object: componentName,
                params: {periodType: vm.periodType}, tag: "vm", method: "$routerOnActivate"});
              abxLog.debug({message: "Periods initialisées : {{periods}}.", object: componentName,
                params: {periods: vm.periods}, tag: "vm", method: "$routerOnActivate"});

              vm.canDisplayView = true;
            });
      } catch (e) {

        var errorMessage = "Erreur lors de l'affectation des données de formulaire.";
        abxLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas créer, modifier ou afficher ce groupe de périodes.",
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