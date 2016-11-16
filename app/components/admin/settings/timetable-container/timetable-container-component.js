/** 
 * Component pm.admin.settings.timetableContainerComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: timetable-container-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.admin.settings.timetableContainerComponent';

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
        templateUrl: 'app/components/admin/settings/timetable-container/timetable-container-component.html',
        controller: [
          '$q',
          '$filter',
          'pm.common.logService',
          'pm.common.aclService',
          'pm.common.flashMessageService',
          'pm.common.routerService',
          'pm.common.modelManagerService',
          'pm.common.yearContainerModel',
          'pm.common.schoolYearModel',
          'pm.common.timetableContainerModel',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      $q,
      $filter,
      pmLog,
      pmAcl,
      pmFlashMessage,
      pmRouter,
      pmModelManager,
      pmYearContainerModel,
      pmSchoolYearModel,
      pmTimetableContainerModel
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
      schoolYear: {},
      timetableContainer: {}
    };

    /*
     * Objets Timetable modèle
     * 
     * @property {object} 
     */
    var _timetableObjectModel = {
      name: {
        value: '',
        minLength: 2,
        maxLength: 10
      },
      startTime: {
        value: undefined
      },
      endTime: {
        value: undefined
      },
      id: {
        value: undefined
      }
    };

    /*
     * Objet DayOfWeek modèle
     * 
     * @property {object} 
     */
    var _dayOfWeekObjectModel = {
      dayOfWeek: undefined,
      timetables: []
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
     * Index du dayOfWeek actif par défaut
     * 
     * @property {integer} 
     */
    vm.activeDayOfWeek = 0;

    /*
     * Nombre d'erreurs dans les dayOfWeeks
     * 
     * @property {integer} 
     */
    vm.daysOfWeekErrorsCount = 0;

    /*
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * 
     * @property {boolean}
     */
    vm.isSaving = false;

    /*
     * timetableContainer
     * 
     * @property {object}
     */
    vm.timetableContainer = {
      name: {
        value: '',
        minLength: 2,
        maxLength: 50
      },
      cascadeEffect: 2,
      cascadeEffectStartDate: {
        value: new Date(),
        minDate: undefined,
        maxDate: undefined
      },
      daysOfWeek: []
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
     * Ajout d'un Timetable
     * 
     * @param {integer} dayOfWeek 
     * @param {undefined|integer} index 
     * @return {void} 
     */
    vm.addTimetable = function(dayOfWeek, index) {

      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.addTimetable", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.addTimetable"});

      var timetable = angular.copy(_timetableObjectModel);

      if (index === undefined) {
        vm.timetableContainer.daysOfWeek[dayOfWeek].timetables.push(timetable);
      } else {
        vm.timetableContainer.daysOfWeek[dayOfWeek].timetables.splice(index + 1, 0, timetable);
      }

    };

    /*
     * Dupliquer un ou des Timetables
     * @param {integer} fromDayOfWeek     
     * @param {array} timetables 
     * @param {array} toDaysOfWeek 
     * @return {void} 
     */
    vm.duplicateTimetables = function(fromDayOfWeek, timetables, toDaysOfWeek) {

      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.duplicateTimetable", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.duplicateTimetable"});

      if (toDaysOfWeek === undefined || toDaysOfWeek.length === 0) {
        pmFlashMessage.showError({errorMessage: "Vous devez sélectionner au moins un jour vers lequel dupliquer les horaires."});
        return;
      }

      var notEmptyDaysOfWeek = 0,
          promise;

      // Vérifie si les autres jours ne contiennent pas d'horaire
      for (var i = 0, length = toDaysOfWeek.length; i < length; i++) {
        if (vm.timetableContainer.daysOfWeek[toDaysOfWeek[i]].timetables.length !== 0) {
          notEmptyDaysOfWeek++;
        }
      }

      if (notEmptyDaysOfWeek === 0) {
        promise = $q.when();
      } else {
        var textContent = "Il y a " + notEmptyDaysOfWeek + (notEmptyDaysOfWeek === 1 ? " jour sélectionné qui a" : " jours sélectionnés qui ont")
            + " déjà des horaires&nbsp;: ceux-ci seront remplacés lors de la duplication.";
        promise = pmFlashMessage.showWarningConfirm(textContent);
      }

      promise
          .then(function() {
            // tri car les timetables sont renvoyés par ordres d'uid et nom pas par $index
            timetables.sort(function(a, b) {
              return a > b;
            });
            for (var i = 0, length = toDaysOfWeek.length; i < length; i++) {
              vm.timetableContainer.daysOfWeek[toDaysOfWeek[i]].timetables = [];
              for (var j = 0, length2 = timetables.length; j < length2; j++) {
                if (vm.timetableContainer.daysOfWeek[fromDayOfWeek].timetables[timetables[j]] !== undefined) {
                  vm.timetableContainer.daysOfWeek[toDaysOfWeek[i]].timetables.push(angular.copy(vm.timetableContainer.daysOfWeek[fromDayOfWeek].timetables[timetables[j]]));
                }
              }
            }
            var textContent = timetables.length === 1 ? "L'horaire a été dupliqué." : "Les horaires ont été dupliqués.";
            pmFlashMessage.showSuccess(textContent);
          })
          .catch(function() {
            pmFlashMessage.showCancel();
          });
    };

    /*
     * Suppression d'un ou plusieurs Timetable
     * 
     * @param {integer} dayOfWeek 
     * @param {array} index 
     * @return {void}
     */
    vm.deleteTimetables = function(dayOfWeek, index) {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deleteTimetable", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.deleteTimetable"});

      // on trie index par ordre inverse pour ne pas modifier les indices à supprimer
      index.sort(function(a, b) {
        return b - a;
      });
      for (var i = 0, length = index.length; i < length; i++) {
        vm.timetableContainer.daysOfWeek[dayOfWeek].timetables.splice(index[i], 1);
      }
      var textContent = index.length === 1 ? "L'horaire a été supprimé." : "Les horaires ont été supprimés.";
      pmFlashMessage.showSuccess(textContent);
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
          linkParams = ['Admin.settings.timetableContainer', {action: 'update', timetableContainerId: _backObjects.timetableContainer.id}];
          break;
        default :
          pmLog.error({message: "Paramètre incorrect. {{params}}",
            params: {params: arguments}, tag: "params", object: componentName, method: "vm.navigate"});
          return;
      }
      pmRouter.navigate(linkParams);
    };

    /*
     * Enregistrement du timetableContainer
     * 
     * @return {void} 
     */
    vm.save = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.save", tag: "methodEntry"});

      // formulaire invalide ou déjà en cours d'enregistrement
      if (!vm.ngForm.TimetableContainer.$valid || vm.isSaving) {
        return;
      }

      vm.isSaving = true;

      try {
        var promise;
        if (vm.formAction === 'create') {
          promise = $q.when();
        } else {
          var textContent = "Attention&nbsp;: si vous avez modifié ou supprimé des horaires, cela impactera les séances de l'emploi du temps déjà existantes.";
          promise = pmFlashMessage.showWarningConfirm(textContent);
        }

        promise
            .catch(function() {
              pmFlashMessage.showCancel();
            })
            .then(function() {

              pmFlashMessage.showWait();

              var dayOfWeekObject = {},
                  timetableObject = {};

              var formTimetableContainer = {
                action: _formAction,
                timetableContainer: {
                  name: vm.timetableContainer.name.value,
                  schoolYearId: _backObjects.schoolYear.id,
                  id: _backObjects.timetableContainer.id,
                  cascadeEffect: (!isNaN(parseInt(vm.timetableContainer.cascadeEffect)) ? parseInt(vm.timetableContainer.cascadeEffect) : undefined),
                  cascadeEffectStartDate: vm.timetableContainer.cascadeEffectStartDate.value,
                  daysOfWeek: []
                }
              };

              for (var i = 0, length = vm.timetableContainer.daysOfWeek.length; i < length; i++) {
                dayOfWeekObject = angular.copy(_dayOfWeekObjectModel);
                dayOfWeekObject.dayOfWeek = vm.timetableContainer.daysOfWeek[i].dayOfWeek;
                formTimetableContainer.timetableContainer.daysOfWeek.push(dayOfWeekObject);

                for (var j = 0, length2 = vm.timetableContainer.daysOfWeek[i].timetables.length; j < length2; j++) {
                  timetableObject = {};
                  timetableObject.name = vm.timetableContainer.daysOfWeek[i].timetables[j].name.value;
                  timetableObject.startTime = vm.timetableContainer.daysOfWeek[i].timetables[j].startTime.value;
                  timetableObject.endTime = vm.timetableContainer.daysOfWeek[i].timetables[j].endTime.value;
                  timetableObject.id = vm.timetableContainer.daysOfWeek[i].timetables[j].id.value;

                  formTimetableContainer.timetableContainer.daysOfWeek[i].timetables.push(timetableObject);
                }

              }

              pmTimetableContainerModel.createUpdate(formTimetableContainer)
                  .then(function(response) {
                    // succès
                    if (response[0].TimetableContainer !== undefined) {
                      pmLog.debug({message: "TimetableContainer enregistré avec succès.", tag: "save", object: componentName, method: "vm.save"});
                      var textContent = "Le groupe d'horaires a été "
                          + (_formAction === 'create' ? "créé" : "modifié")
                          + " avec succès.";
                      pmFlashMessage.showSuccess(textContent);
                      pmRouter.navigate(['Admin.settings.home']);
                      return;
                    }

                    // erreur
                    pmLog.debug({message: "Erreur lors de l'enregistrement du TimetableContainer.", tag: "save", object: componentName, method: "vm.save"});

                    // parse l'objet d'erreur pour ajouter les jours en erreurs
                    if (response[0].objects !== undefined && response[0].objects[0] !== undefined
                        && response[0].objects[0].ErrorResponse !== undefined && response[0].objects[0].ErrorResponse.fieldErrors !== undefined) {
                      try {
                        var fieldErrors = response[0].objects[0].ErrorResponse.fieldErrors,
                            daysOfWeekError = [],
                            regExpResult,
                            daysOfWeekErrorsCount = 0;
                        for (var i = 0, length = fieldErrors.length; i < length; i++) {
                          regExpResult = /^daysOfWeek\[(\d+)\]/.exec(fieldErrors[i].FieldErrorResource.field);
                          if (regExpResult !== null) {
                            daysOfWeekErrorsCount++;
                            if (daysOfWeekError.indexOf(regExpResult[1]) === -1) {
                              daysOfWeekError.push(parseInt(regExpResult[1]));
                            }

                          }
                        }
                        if (daysOfWeekError.length > 0) {
                          daysOfWeekError = $filter('pmCommonOrderByDatetimeFilter')(daysOfWeekError, 'dayOfWeekList');
                          var newErrorObject = {
                            FieldErrorResource: {
                              resource: "TimetableContainer",
                              field: "daysOfWeek",
                              code: "daysOfWeek-in-error-list",
                              arguments: daysOfWeekError
                            }
                          };
                          response[0].objects[0].ErrorResponse.fieldErrors.push(newErrorObject);

                          // tri et affectation du dayOfWeek actif
                          var daysOfWeekList = $filter('pmCommonOrderByDatetimeFilter')([0, 1, 2, 3, 4, 5, 6], 'dayOfWeek');
                          vm.activeDayOfWeek = daysOfWeekList.indexOf(daysOfWeekError[0]);
                        } else {
                          vm.activeDayOfWeek = 0;
                        }
                        vm.daysOfWeekErrorsCount = daysOfWeekErrorsCount;

                      } catch (e) {
                        pmLog.error({message: "Erreur catchée lors du parsage de l'objet d'erreur. Message d'exception={{exceptionMessage}}",
                          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.save"});
                      }
                    } else {
                      vm.daysOfWeekErrorsCount = 0;
                    }

                    vm.ngForm.TimetableContainer.pmFormBackApplyErrors(response[0],
                        {redirectLinkParams: ['Admin.settings.home'],
                          errorMessage: "Le groupe d'horaires que vous essayez de modifier n'existe pas ou plus."});

                    vm.isSaving = false;
                  });
            });

      } catch (e) {
        pmLog.error({message: "Erreur catchée lors de l'enregistrement du TimetableContainer. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.save"});

        var errorOptions = {
          errorMessage: "La " + (_formAction === 'create' ? "création" : "modification") + " du groupe d'horaires a échoué.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(errorOptions);

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

        // validation :timetableContainerId

        var timetableContainerId = parseInt(routeParams.timetableContainerId);
        if (isNaN(timetableContainerId)) {
          if (routeParams.action !== 'create') {
            pmLog.info({message: "TimeTableContainerId incorrect. action={{action}}|timetableContainerId={{timetableContainerId}}",
              params: {action: routeParams.action, timetableContainerId: routeParams.timetableContainerId},
              tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
            pmRouter.navigateToErrorPage('404', 'params');
            return;
          } else {
            timetableContainerId = undefined;
          }
        }
        routeParams.timetableContainerId = timetableContainerId;

        // récupération des données
        var concatRequests = [
          {modelMethod: pmYearContainerModel.readCurrent, options: {}},
          {modelMethod: pmSchoolYearModel.readCurrent, options: {}}
        ];
        if (routeParams.timetableContainerId !== undefined) {
          concatRequests.push({modelMethod: pmTimetableContainerModel.readByTimetableContainerId,
            options: {timetableContainerId: routeParams.timetableContainerId, forceBackRead: true}});
        }

        pmModelManager.addConcatRequest(concatRequests)
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1],
                  timetableContainerResult = response[2],
                  timetableContainer = {};

              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (pmModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              // validation du :timetableContainerResult
              if (routeParams.timetableContainerId !== undefined) {
                // pas de timetableContainer trouvé
                if (timetableContainerResult === undefined) {
                  pmLog.debug({message: "TimetableContainerResult inexistant : timetableContainerId={{timetableContainerId}}.",
                    object: componentName, method: "$routerOnActivate",
                    params: {timetableContainerId: routeParams.timetableContainerId}, tag: "settings"});

                  // DUPLICATE
                  if (routeParams.action === "create") {
                    // transforme en CREATE
                    routeParams.timetableContainerId = undefined;
                    var errorOptions = {
                      errorMessage: "Le groupe d'horaires à dupliquer n'existe plus.",
                      adviceMessage: "Vous pouvez créer un nouveau groupe d'horaires."
                    };
                    pmFlashMessage.showError(errorOptions);

                  } else {
                    // UPDATE | READ
                    pmFlashMessage.showError({errorMessage: "Le groupe d'horaires n'existe pas ou plus."});
                    pmRouter.navigate(['Admin.settings.home']);
                    return;
                  }

                } else if (timetableContainerResult.result !== undefined || timetableContainerResult.TimetableContainer === undefined) {
                  pmLog.error({message: "Impossible de récupérer un timetableContainer depuis le back : timetableContainerId={{timetableContainerId}}.",
                    object: componentName, params: {timetableContainerId: routeParams.timetableContainerId}, tag: "settings", method: "$routerOnActivate"});

                  // DUPLICATE
                  if (routeParams.action === "create") {
                    // transforme en CREATE
                    routeParams.timetableContainerId = undefined;
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération du groupe d'horaires à dupliquer.",
                      adviceMessage: "Vous pouvez créer un nouveau groupe d'horaires."
                    };
                    pmFlashMessage.showError(errorOptions);

                  } else {
                    var errorOptions = {
                      errorMessage: "Erreur lors de la récupération du groupe d'horaires.",
                      adviceMessage: "Vous ne pouvez pas " + (routeParams.action === 'update' ? "modifier" : "afficher") + " ce groupe d'horaires.",
                      errorObject: {
                        objectName: 'timetableContainer',
                        errorMessage: 'timetableContainerId = ' + routeParams.timetableContainerId}
                    };
                    pmFlashMessage.showError(errorOptions);
                    pmRouter.navigate(['Admin.settings.home']);
                    return;
                  }
                } else {
                  timetableContainer = timetableContainerResult.TimetableContainer;
                }

              }

              // vérification des ACL
              var aclObjet = (routeParams.action === 'update' ? timetableContainer : 'timetableContainer');
              if (!pmAcl.isAllowedManageCrudObject(aclObjet, routeParams.action)) {
                pmRouter.navigateToErrorPage('acl', 'forbidden');
                return;
              }


              // à partir de ce point, les paramètres sont valides

              vm.formAction = _formAction = _routeParams.action = routeParams.action;
              _routeParams.timetableContainerId = routeParams.timetableContainerId;
              _backObjects = {
                yearContainer: yearContainerResult.YearContainer,
                schoolYear: schoolYearResult.SchoolYear,
                timetableContainer: timetableContainer
              };

              // affectations des données
              var dayOfWeekObject = {};

              for (var i = 0; i < 7; i++) {
                dayOfWeekObject = angular.copy(_dayOfWeekObjectModel);
                dayOfWeekObject.dayOfWeek = i;
                vm.timetableContainer.daysOfWeek.push(dayOfWeekObject);
              }

              // affectation de l'action et des valeurs par défaut
              // READ || UPDATE || DUPLICATE
              if (_routeParams.timetableContainerId !== undefined) {

                if (routeParams.action === "read") {
                  vm.isAllowedUpdate = pmAcl.isAllowedManageCrudObject(timetableContainer, 'update');
                }
                
                // pas de name si DUPLICATE pour éviter le doublon
                if (routeParams.action !== "create") {
                  vm.timetableContainer.name.value = _backObjects.timetableContainer.name;
                }

                vm.timetableContainer.cascadeEffectStartDate.minDate = _backObjects.yearContainer.dateStart;
                vm.timetableContainer.cascadeEffectStartDate.maxDate = _backObjects.yearContainer.dateEnd;

                var timetableObject = {};

                for (var i = 0, length = _backObjects.timetableContainer.daysOfWeek.length; i < length; i++) {

                  for (var j = 0, length2 = _backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.timetables.length; j < length2; j++) {
                    timetableObject = angular.copy(_timetableObjectModel);
                    timetableObject.name.value = _backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.timetables[j].Timetable.name;
                    timetableObject.startTime.value = _backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.timetables[j].Timetable.startTime;
                    timetableObject.endTime.value = _backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.timetables[j].Timetable.endTime;
                    timetableObject.id.value = _backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.timetables[j].Timetable.id;

                    vm.timetableContainer.daysOfWeek[_backObjects.timetableContainer.daysOfWeek[i].DayOfWeek.dayOfWeek].timetables.push(timetableObject);
                  }
                }
              }

              pmLog.debug({message: "timetableContainer initialisé : {{timetableContainer}}.", object: componentName,
                params: {timetableContainer: vm.timetableContainer}, tag: "vm", method: "$routerOnActivate"});

              if (routeParams.action === 'update') {
                var textContent = "Attention&nbsp;: si vous modifiez ou supprimez des horaires, cela impactera les séances de l'emploi du temps déjà existantes.";
                pmFlashMessage.showWarningConfirm(textContent)
                    .catch(function() {
                      pmFlashMessage.showCancel();
                      pmRouter.navigate(['Admin.settings.home']);
                    });
              }

              vm.canDisplayView = true;
            });

      } catch (e) {

        var errorMessage = "Erreur lors de l'affectation des données de formulaire.";
        pmLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas créer, modifier ou afficher ce groupe d'horaires.",
          errorObject: {errorMessage: e.message}
        };
        pmFlashMessage.showError(options);
        pmRouter.navigate(['Admin.settings.home']);
      }
      ;
    }
    ;
  }

// fin IIFE
})();