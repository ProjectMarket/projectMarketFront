/** 
 * Component abx.admin.settings.yearWeekComponent
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
(function () {

  'use strict';

  var componentName = 'abx.admin.settings.yearWeekComponent';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.adminModule')
      .component(componentName, {
        $canActivate: ['abx.common.routerService',
          function (abxRouter) {
            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/admin/settings/year-week/year-week-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.aclService',
          'abx.common.flashMessageService',
          'abx.common.routerService',
          'abx.common.modelManagerService',
          'abx.common.yearContainerModel',
          'abx.common.schoolYearModel',
          'abx.common.yearWeekModel',
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
      abxYearWeekModel,
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
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * Interdit deux suppresions simultannées
     * 
     * @property {boolean}
     */
    var _isDeleting = false;

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
     * Numéro de semaine
     * 
     * @property {number}
     */

    var _yearWeekNumber;


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
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * 
     * @property {boolean}
     */
    vm.isSaving = false;

    /*
     * Numéro de la semaine 
     * 
     * @property {number} 
     */
    vm.yearWeekNumber = undefined;

    vm.listWeek = [];

    vm.allWeek = [];

    vm.finalWeek = [];


    //*******************
    // Méthodes du scope
    //*******************


    /*
     * Annulation du formulaire
     * 
     * @return {void} 
     */
    vm.cancel = function () {
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
    vm.navigate = function (location) {
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
     * Créer une semaine pour une alternatingWeek
     * 
     * @return {void} 
     */
    vm.create = function (weekId) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.create", tag: "methodEntry"});

      // formulaire déjà en cours d'enregistrement
      if (vm.isSaving) {
        return;
      }

      vm.isSaving = true;


      try {

        if (vm.yearWeekNumber === undefined) {
          vm.isSaving = false;
          return;
        }

        //On affecte le jour de la semaine à une variable privée pour l'utiliser dans le contrôleur de showCustomDialog
        _yearWeekNumber = parseInt(vm.yearWeekNumber);

        //On vérifie que la semaine est vide
        for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
          for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {

            if (_yearWeekNumber === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week) {
              var errorOptions = {
                errorMessage: "La semaine à créer existe déja.",
                adviceMessage: "Vous pouvez modifier cette semaine."
              };
              abxFlashMessage.showError(errorOptions);
              vm.isSaving = false;
              return;
            }
          }
        }

        var options = {
          templateUrl: 'app/common/services/flashMessage/createYearWeekDialog.html',
          controller: function ($scope, $mdDialog) {
            var vm = this.vm = {};

            vm.yearWeek = [];

            var yearWeekObjectModel = {
              name: ''
            };

            var yearWeekObject = {};

            //On récupère le nom des semaines
            for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
              yearWeekObject = angular.copy(yearWeekObjectModel);
              yearWeekObject.name = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label;
              vm.yearWeek.push(yearWeekObject);
            }

            vm.cancel = function () {

              $mdDialog.cancel();
            };

            vm.confirm = function (label) {

              var data = {
                yearWeekObject: {
                  name: ""
                }
              };
              if (data !== undefined) {
                data.yearWeekObject.name = label.name;
              }
              $mdDialog.hide(data);
            };
          }
        };

        abxFlashMessage.showCustomDialog(options)
            .then(function (data) {
              var formYearWeek = {
                action: 'create',
                yearWeek: {
                  year: '2016',
                  week: _yearWeekNumber,
                  yearWeekCollectionId: undefined,
                  schoolYearId: _backObjects.schoolYear.id
                }
              };

              //On récupère le yearWeekCollectionId
              for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
                if (data.yearWeekObject.name === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label) {
                  formYearWeek.yearWeek.yearWeekCollectionId = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.id;
                }
              }
              abxYearWeekModel.createUpdate(formYearWeek)
                  .then(function (response) {

                    // succès
                    if (response[0].YearWeek !== undefined) {
                      abxLog.debug({message: "YearWeek enregistré avec succès.", tag: "create", object: componentName, method: "vm.create"});
                      var textContent = "La semaine a été créée avec succès ";
                      abxFlashMessage.showSuccess(textContent);
                      abxRouter.navigate(['Admin.settings.home']);
                      return;
                    }

                    // erreur
                    abxLog.debug({message: "Erreur lors de l'enregistrement du YearWeek.", tag: "create", object: componentName, method: "vm.create"});
                    vm.ngForm.YearWeek.abxFormBackApplyErrors(response[0],
                        {redirectLinkParams: ['Admin.settings.home'],
                          errorMessage: "La semaine que vous essayez de créer n'existe pas ou plus."});

                    vm.isSaving = false;
                    abxRouter.navigate(['Admin.settings.home']);
                  });

            })
            .catch(function (data) {
              vm.isSaving = false;
              abxFlashMessage.showCancel();
            });

      } catch (e) {
        abxLog.error({message: "Erreur catchée lors de l'enregistrement du YearWeek. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.update"});

        var errorOptions = {
          errorMessage: "La création de la semaine a échoué.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(errorOptions);

        vm.isSaving = false;
      }

    };
    /*
     * Modifie une semaine pour une alternatingWeek
     * 
     * @return {void} 
     */
    vm.update = function () {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.update", tag: "methodEntry"});

      // formulaire invalide ou déjà en cours d'enregistrement
      if (vm.isSaving) {
        return;
      }

      vm.isSaving = true;

      try {

        var isAllowedUpdate = false;

        if (vm.yearWeekNumber === undefined) {
          vm.isSaving = false;
          return;
        }
        //On affecte le jour de la semaine à une variable privée pour l'utiliser dans le contrôleur de showCustomDialog
        _yearWeekNumber = parseInt(vm.yearWeekNumber);

        //On vérifie que la semaine n'est pas vide
        for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
          for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {

            if (_yearWeekNumber === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week) {
              isAllowedUpdate = true;
            }
          }
        }

        if (isAllowedUpdate === false) {
          var errorOptions = {
            errorMessage: "La semaine à modifier est vide.",
            adviceMessage: "Vous pouvez créer une nouvelle semaines."
          };
          abxFlashMessage.showError(errorOptions);
          vm.isSaving = false;
          return;
        }
        var options = {
          templateUrl: 'app/common/services/flashMessage/updateYearWeekDialog.html',
          controller: function ($scope, $mdDialog) {
            var vm = this.vm = {},
                yearWeekLabel,
                yearWeekObject = {};

            vm.yearWeek = [];

            var yearWeekObjectModel = {
              name: ''
            };

            for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
              if (_backObjects.alternatingWeeks.yearWeekCollections.length > 1) {
                for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {
                  // On récupére le nom de la semaine que l'on veut modifier          
                  if (_yearWeekNumber === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week) {
                    yearWeekLabel = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label;
                  }
                }
              }
              //On affecte les autres semaines    
              if (yearWeekLabel !== _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label) {
                yearWeekObject = angular.copy(yearWeekObjectModel);
                yearWeekObject.name = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label;
                vm.yearWeek.push(yearWeekObject);
              }
            }

            vm.cancel = function () {

              $mdDialog.cancel();
            };

            vm.confirm = function (label, updateMode) {

              var data = {
                yearWeekObject: {
                  name: "",
                  updateMode: 1 // Par défaut on modifie uniquement la semaine choisie
                }
              };

              if (label && updateMode !== undefined) {
                data.yearWeekObject.name = label.name;
                data.yearWeekObject.updateMode = updateMode;
              }
              $mdDialog.hide(data);
            };
          }
        };

        abxFlashMessage.showCustomDialog(options)

            .then(function (data) {

              var formYearWeek = {
                action: 'update',
                yearWeek: {
                  id: undefined,
                  yearWeekCollectionId: undefined,
                  schoolYearId: _backObjects.schoolYear.id,
                  updateMode: data.yearWeekObject.updateMode
                }
              };


              for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
                for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {
                  //On récupère le yearWeekCollectionId en fonction du nom de la semaine
                  if (data.yearWeekObject.name === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.label) {
                    formYearWeek.yearWeek.yearWeekCollectionId = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.id;

                  }
                  //On récupère le yearWeek id en fonction du numéro de semaine
                  if (_yearWeekNumber === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week) {
                    formYearWeek.yearWeek.id = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.id;
                  }
                }
              }

              abxYearWeekModel.createUpdate(formYearWeek)
                  .then(function (response) {
                    // succès
                    if (response[0].YearWeek !== undefined) {
                      abxLog.debug({message: "YearWeek modifié avec succès.", tag: "update", object: componentName, method: "vm.update"});
                      var textContent = "La semaine a été modifiée avec succès ";
                      abxFlashMessage.showSuccess(textContent);
                      abxRouter.navigate(['Admin.settings.home']);
                      return;
                    }

                    // erreur
                    abxLog.debug({message: "Erreur lors de la modificaiton du YearWeek.", tag: "update", object: componentName, method: "vm.update"});
                    vm.ngForm.YearWeek.abxFormBackApplyErrors(response[0],
                        {redirectLinkParams: ['Admin.settings.home'],
                          errorMessage: "La semaine que vous essayez de modifier n'existe pas ou plus."});

                    vm.isSaving = false;
                    abxRouter.navigate(['Admin.settings.home']);
                  });
            })
            .catch(function (data) {
              vm.isSaving = false;
              abxFlashMessage.showCancel();
            });
      } catch (e) {
        abxLog.error({message: "Erreur catchée lors de l'enregistrement du YearWeek. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "vm.update"});

        var errorOptions = {
          errorMessage: "La modification de la semaine a échoué.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(errorOptions);

        vm.isSaving = false;
      }


    };

    /*
     * Suppresion de données
     * 
     * @param {string} crudObject
     * @param {array} yearWeekNumber
     * @return {void} 
     */
    vm.delete = function (yearWeekNumber) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.delete", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.delete"});
      if (_isDeleting) {
        return;
      }

      try {
        var optionsDelete = {},
            optionsDeleteResult = {},
            crudObjectsList = [],
            reloadCrudObject = {},
            ids = [];
        _isDeleting = true;
        for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
          for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {
            for (var k = 0, length3 = yearWeekNumber.length; k < length3; k++) {

              if (parseInt(yearWeekNumber[k]) === _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week) {

                ids.push(_backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.id);
              }
            }
          }
        }

        // Récupération des nom des objects 
        for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
          for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {

            if (ids.indexOf(_backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.id) >= 0) {

              crudObjectsList.push(_backObjects.alternatingWeeks.yearWeekCollections[i]);
            }
          }
        }

        optionsDelete.objectsDisplayNames = abxYearWeekModel.getObjectsDisplayNames(crudObjectsList);
        optionsDelete.textContent = {
          singular: "la semaine",
          plural: "les semaines"
        };
        optionsDeleteResult = {
          success: {
            singular: "La semaine a été supprimée",
            plural: "Les semaines ont été supprimées"
          },
          error: {
            singular: "La semaine suivante n'a pas pu être supprimée",
            plural: "Les semaines suivantes n'ont pas pu être supprimées"
          }
        };
        reloadCrudObject = {
          method: "readBySchoolYearId",
          params: [{forceBackRead: true, schoolYearId: _backObjects.schoolYear.id}]
        };

        // dialog de confirmation
        abxFlashMessage.showDeleteConfirm(optionsDelete)
            .then(function () {

              abxFlashMessage.showWait();
              // DELETE
              var deleteOptions = {
                schoolYearId: _backObjects.schoolYear.id,
                ids: ids
              };

              abxYearWeekModel.delete(deleteOptions)
                  .then(function (response) {

                    var errorList = [];
                    for (var i = 0, length = response.length; i < length; i++) {
                      if (response[i].result !== undefined) {
                        abxLog.error({message: "Erreur de suppression de YearWeek. Objet d'erreur={{response}}",
                          params: {response: response[i]}, tag: "error", object: componentName, method: "_delete"});
                        errorList.push(ids[i]);
                      }
                    }

                    // succès
                    if (errorList.length === 0) {
                      abxFlashMessage.showSuccess((ids.length === 1 ? optionsDeleteResult.success.singular : optionsDeleteResult.success.plural) + " avec succès");
                      // erreur
                    } else {
                      var objectsDisplayNames = {};
                      for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
                        objectsDisplayNames[_backObjects.alternatingWeeks.yearWeekCollections[i]['YearWeek'].id] = abxYearWeekModel.getObjectsDisplayNames([_backObjects.alternatingWeeks.yearWeekCollections[i]])[0];
                      }
                      var textContent = (errorList.length === 1 ? optionsDeleteResult.error.singular : optionsDeleteResult.error.plural) + "&nbsp;:<ul>";
                      for (var i = 0, length = errorList.length; i < length; i++) {
                        textContent += "<li>" + objectsDisplayNames[errorList[i]] + "</li>";
                      }
                      textContent += "</ul>";
                      var options = {
                        errorMessage: textContent,
                        adviceMessage: "Vous pouvez réessayer ou signaler cet incident."
                      };
                      abxFlashMessage.showError(options);
                    }

                  });
            })
            .catch(function (e) {
              _isDeleting = false;
              abxFlashMessage.showCancel();
            });
      } catch (e) {
        abxLog.error({message: "Erreur lors de l'envoi de l'objet au back. Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "_delete"});
        var options = {
          errorMessage: "La suppresion a échoué.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(options);
        _isDeleting = false;
      }

    }
    ;
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
    _this.$routerOnActivate = function (nextInstruction, prevInstruction) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.abxAppController.vm.setModule('admin.settings');

      try {
        // validation des paramètres

        var routeParams = angular.copy(nextInstruction.params);

        // validation :alternatingWeeksId

        var alternatingWeeksId = parseInt(routeParams.alternatingWeeksId);
        if (isNaN(alternatingWeeksId)) {

          abxLog.info({message: "AlternatingWeeksId incorrect. action={{action}}|alternatingWeeksId={{alternatingWeeksId}}",
            params: {action: routeParams.action, alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
          abxRouter.navigateToErrorPage('404', 'params');
          return;
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
            .then(function (response) {

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
                  abxFlashMessage.showError({errorMessage: "L'alternance de semaines n'existe pas ou plus."});
                  abxRouter.navigate(['Admin.settings.home']);
                  return;

                } else if (alternatingWeeksResult.result !== undefined || alternatingWeeksResult.AlternatingWeeks === undefined) {
                  abxLog.error({message: "Impossible de récupérer un alternatingWeeks depuis le back : alternatingWeeksId={{alternatingWeeksId}}.", object: componentName,
                    params: {alternatingWeeksId: routeParams.alternatingWeeksId}, tag: "settings", method: "$routerOnActivate"});
                  var errorOptions = {
                    errorMessage: "Erreur lors de la récupération de l'alternance de semaines.",
                    adviceMessage: "Vous ne pouvez pas gérer les semaines cette alternance de semaines.",
                    errorObject: {objectName: 'AlternatingWeeks',
                      errorMessage: 'alternatingWeeksId = ' + routeParams.alternatingWeeksId}
                  };
                  abxFlashMessage.showError(errorOptions);
                  abxRouter.navigate(['Admin.settings.home']);
                  return;

                } else {
                  alternatingWeeks = alternatingWeeksResult.AlternatingWeeks;
                }

              }

              //vérification des ACL
              if (!abxAcl.isAllowedManageCrudObject(alternatingWeeks, "update") || !abxAcl.isAllowedManageCrudObject(alternatingWeeks, "delete") || !abxAcl.isAllowedManageCrudObject("alternatingWeeks", "create")) {
                abxRouter.navigateToErrorPage('acl', 'forbidden');
                return;
              }

              // à partir de ce point, les paramètres sont valides

              _routeParams.alternatingWeeksId = routeParams.alternatingWeeksId;
              _backObjects =
                  {yearContainer: yearContainerResult.YearContainer,
                    schoolYear: schoolYearResult.SchoolYear,
                    alternatingWeeks: alternatingWeeks};

              for (var i = 0, length = _backObjects.alternatingWeeks.yearWeekCollections.length; i < length; i++) {
                for (var j = 0, length2 = _backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks.length; j < length2; j++) {
                  //On récupère le yearWeekCollectionId en fonction du nom de la semaine

                  vm.listWeek.push(_backObjects.alternatingWeeks.yearWeekCollections[i].YearWeekCollection.yearWeeks[j].YearWeek.week);
                }
              }
              for (var i = 1; i < 53; i++) {
                vm.allWeek.push(i);

              }
              for (var i = 0, length = vm.allWeek.length; i < length; i++) {
                if (vm.listWeek.indexOf(vm.allWeek[i]) == -1) {
                  vm.finalWeek.push(i + 1);
                }
              }
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