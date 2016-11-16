/** 
 * Component abx.admin.settings.homeComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: home-component.js 724 2016-04-01 14:57:55Z zvergne $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';
  var componentName = 'abx.admin.settings.homeComponent';
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
        templateUrl: 'app/components/admin/settings/home/home-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.aclService',
          'abx.common.flashMessageService',
          'abx.common.routerService',
          'abx.common.modelManagerService',
          'abx.common.yearContainerModel',
          'abx.common.schoolYearModel',
          'abx.common.periodTypeModel',
          'abx.common.timetableContainerModel',
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
      abxPeriodTypeModel,
      abxTimetableContainerModel,
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
      previousSchoolYear: {},
      periodTypes: [],
      timetableContainers: [],
      previousTimetableContainers: [],
      alternatingWeeks: []


    };
    //******************
    // Méthodes privées
    //******************


    /*
     * Affectation des données pour la vue
     * 
     * @param {string} crudObject
     * @param {object} result
     * @returns {void}
     */

    var _populateViewModel = function (crudObject, result) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});
      try {
        // initialisations
        var errorMessage = "Erreur lors de la récupération ";
        switch (crudObject) {
          case 'periodType':
            errorMessage += "des groupes de périodes.";
            _backObjects.periodTypes = [];
            vm.crudObjects.periodTypes = [];
            break;
          case 'timetableContainer':
            errorMessage += "des groupes d'horaires.";
            _backObjects.timetableContainers = [];
            vm.crudObjects.timetableContainers = [];
            break;
          case 'alternatingWeeks':
            errorMessage += "des alternances de semaines.";
            _backObjects.alternatingWeeks = [];
            vm.crudObjects.alternatingWeeks = [];
            break;
            // TODO : ajouter les autres crudObject
          default:
            abxLog.error({message: "Paramètres méthode incorrects : {{params}}",
              params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});
            throw new Error('CrudObject incorrect : ' + crudObject);
            break;
        }



        // affectation
        switch (crudObject) {
          case 'periodType':
            // erreur de back
            if (result.result !== undefined) {
              vm.hasBackCrudObjectsError.periodTypes = true;
            } else {
              _backObjects.periodTypes = result;
              for (var i = 0, length = result.length; i < length; i++) {
                vm.crudObjects.periodTypes.push({
                  objectDisplayName: abxPeriodTypeModel.getObjectsDisplayNames([result[i]])[0],
                  id: result[i].PeriodType.id,
                  frontEndAcl: {
                    update: abxAcl.isAllowedManageCrudObject(result[i].PeriodType, 'update'),
                    delete: abxAcl.isAllowedManageCrudObject(result[i].PeriodType, 'delete')
                  }
                });
              }
            }
            break;
          case 'timetableContainer':
            //erreur de back
            if (result.result !== undefined) {
              vm.hasBackCrudObjectsError.timetableContainers = true;
            } else {
              _backObjects.timetableContainers = result;
              for (var i = 0, length = result.length; i < length; i++) {
                vm.crudObjects.timetableContainers.push({
                  objectDisplayName: abxTimetableContainerModel.getObjectsDisplayNames([result[i]])[0],
                  id: result[i].TimetableContainer.id,
                  frontEndAcl: {
                    update: abxAcl.isAllowedManageCrudObject(result[i].TimetableContainer, 'update'),
                    delete: abxAcl.isAllowedManageCrudObject(result[i].TimetableContainer, 'delete')
                  }
                });
              }
            }
            break;
          case 'alternatingWeeks':
            // erreur de back
            if (result.result !== undefined) {
              vm.hasBackCrudObjectsError.alternatingWeeks = true;
            } else {
              _backObjects.alternatingWeeks = result;
              for (var i = 0, length = result.length; i < length; i++) {
                vm.crudObjects.alternatingWeeks.push({
                  objectDisplayName: abxAlternatingWeeksModel.getObjectsDisplayNames([result[i]])[0],
                  id: result[i].AlternatingWeeks.id,
                  frontEndAcl: {
                    update: abxAcl.isAllowedManageCrudObject(result[i].AlternatingWeeks, 'update'),
                    delete: abxAcl.isAllowedManageCrudObject(result[i].AlternatingWeeks, 'delete')
                  }
                });
              }
            }
            break;
            //TODO : Ajouter les autres crudObject pour l'affichage
          default:
            break;
        }
      } catch (e) {
        switch (crudObject) {
          case 'periodType':
            vm.hasBackCrudObjectsError.periodTypes = true;
            break;
          case 'timetableContainer' :
            vm.hasBackCrudObjectsError.timetableContainers = true;
            break;
          case 'alternatingWeeks':
            vm.hasBackCrudObjectsError.alternatingWeeks = true;
            break;
          default:
            vm.hasBackCrudObjectsError.periodTypes = true;
            vm.hasBackCrudObjectsError.timetableContainers = true;
            vm.hasBackCrudObjectsError.alternatingWeeks = true;
            break;
        }
      }
    };
    /*
     * Suppresion de données
     * 
     * @param {string} crudObject
     * @param {array} ids
     * @return {void} 
     */
    var _delete = function (crudObject, ids) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_delete", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_delete"});
      if (_isDeleting) {
        return;
      }

      try {
        var optionsDelete = {},
            optionsDeleteResult = {},
            backObjects,
            backCrudObjectName,
            crudObjectsList = [],
            abxModel,
            reloadCrudObject = {};
        _isDeleting = true;
        switch (crudObject) {
          case "periodType":
            abxModel = abxPeriodTypeModel;
            backObjects = _backObjects.periodTypes;
            backCrudObjectName = 'PeriodType';
            optionsDelete.textContent = {
              singular: "le groupe de périodes",
              plural: "les groupes de périodes"
            };
            optionsDeleteResult = {
              success: {
                singular: "Le groupe de périodes a été supprimé",
                plural: "Les groupes de périodes ont été supprimés"
              },
              error: {
                singular: "Le groupe de périodes suivant n'a pas pu être supprimé",
                plural: "Les groupes de périodes suivants n'ont pas pu être supprimés"
              }
            };
            reloadCrudObject = {
              method: "readBySchoolYearId",
              params: [{forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}]
            };
            break;
          case "timetableContainer":
            abxModel = abxTimetableContainerModel;
            backObjects = _backObjects.timetableContainers;
            backCrudObjectName = 'TimetableContainer';
            optionsDelete.textContent = {
              singular: "le groupe d'horaires",
              plural: "les groupes d'horaires"
            };
            optionsDeleteResult = {
              success: {
                singular: "Le groupe d'horaires a été supprimé",
                plural: "Les groupes d'horaires ont été supprimés"
              },
              error: {
                singular: "Le groupe d'horaires suivant n'a pas pu être supprimé",
                plural: "Les groupes d'horaires suivants n'ont pas pu être supprimés"
              }
            };
            reloadCrudObject = {
              method: "readBySchoolYearId",
              params: [{forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}]
            };
            break;
          case "alternatingWeeks":
            abxModel = abxAlternatingWeeksModel;
            backObjects = _backObjects.alternatingWeeks;
            backCrudObjectName = 'AlternatingWeeks';
            optionsDelete.textContent = {
              singular: "l'alternance de semaine",
              plural: "les alternances de semaines"
            };
            optionsDeleteResult = {
              success: {
                singular: "L'alternance de semaine a été supprimée",
                plural: "Les alternances de semaines ont été supprimées"
              },
              error: {
                singular: "L'alternance de semaine suivante n'a pas pu être supprimée",
                plural: "Les alternances de semaines suivantes n'ont pas pu être supprimées"
              }
            };
            reloadCrudObject = {
              method: "readBySchoolYearId",
              params: [{forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}]
            };
            break;
            // TODO (alternatingWeek ...)
          default :
            throw new Error('CrudObject inconnu : ' + crudObject);
            break;
        }

        // Récupération des nom des objects
        for (var i = 0, length = backObjects.length; i < length; i++) {
          if (ids.indexOf(backObjects[i][backCrudObjectName].id) >= 0) {
            crudObjectsList.push(backObjects[i]);
          }
        }
        optionsDelete.objectsDisplayNames = abxModel.getObjectsDisplayNames(crudObjectsList);
        // dialog de confirmation
        abxFlashMessage.showDeleteConfirm(optionsDelete)
            .then(function () {

              abxFlashMessage.showWait();
              // DELETE
              var deleteOptions = {
                schoolYearId: _backObjects.schoolYear.SchoolYear.id,
                ids: ids
              };
              abxModel.delete(deleteOptions)
                  .then(function (response) {

                    var errorList = [];
                    for (var i = 0, length = response.length; i < length; i++) {
                      if (response[i].result !== undefined) {
                        abxLog.error({message: "Erreur de suppression de " + backCrudObjectName + ". Objet d'erreur={{response}}",
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
                      for (var i = 0, length = backObjects.length; i < length; i++) {
                        objectsDisplayNames[backObjects[i][backCrudObjectName].id] = abxModel.getObjectsDisplayNames([backObjects[i]])[0];
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

                    // rechargement des données
                    abxModel[reloadCrudObject.method].apply(null, reloadCrudObject.params)
                        .then(function (result) {
                          _populateViewModel(crudObject, result);
                          _isDeleting = false;
                        });
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

    };
    //*********************
    // Propriétés du scope
    //*********************

    /*
     * @property {object} vue-modèle
     */
    var vm = _this.vm = {};
    /*
     * @property {boolean} le hook $RouterOnActivate est-t-il terminé ?
     */
    vm.canDisplayView = false;
    /*
     * @property {object} liste des droits d'affichage en fonction du YearContainer && SchoolYear
     */
    vm.isAllowedManageCrudObjects = {
      schoolYear: {
        read: false,
        create: false
      },
      periodType: {
        read: false,
        create: false
      },
      timetableContainer: {
        read: false,
        create: false
      },
      alternatingWeeks: {
        read: false,
        create: false
      }
    };
    /*
     * 
     * @property {object} Liste des objets à gérer
     */
    vm.crudObjects = {
      isTimeTableContainers: true,
      schoolYear: [],
      previousSchoolYear: [],
      periodTypes: [],
      timetableContainers: [],
      previousTimetableContainers: [],
      alternatingWeeks: []
    };
    /*
     * 
     * @property {object} Liste des erreurs des models
     */
    vm.hasBackCrudObjectsError = {
      periodTypes: false,
      timetableContainers: false,
      previousTimetableContainers: false,
      alternatingWeeks: false
    };
    //*******************
    // Méthodes du scope
    //*******************


    /*
     * Actions des menus contextuels
     * 
     * @param {string} crudObject
     * @param {string} action
     * @param {array} ids
     * @return {void} 
     */
    vm.menus = function (crudObject, action, ids) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.menus", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.menus"});
      if (action === "delete") {
        _delete(crudObject, ids);
        return;
      } else {
        // si pas DELETE
        if (crudObject !== 'yearWeek') {
          var params = {
            action: action
          };
          params[crudObject + 'Id'] = ids[0];
        } else {
          var params = {
            alternatingWeeksId: ids[0]
          };
        }

        abxRouter.navigate(['Admin.settings.' + crudObject, params]);

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
    _this.$routerOnActivate = function (nextInstruction, prevInstruction) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.abxAppController.vm.setModule('admin.settings');


      try {
        // récupération des données
        var concatRequests = [
          {modelMethod: abxYearContainerModel.readCurrent, options: {}},
          {modelMethod: abxSchoolYearModel.readCurrent, options: {forceBackRead: true}},
          {modelMethod: abxSchoolYearModel.readAll, options: {forceBackRead: true}}
        ];
        abxModelManager.addConcatRequest(concatRequests)
            .then(function (response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1],
                  allSchoolYearResult = response[2],
                  previousSchoolYearResult;

              // YearContainer    
              // erreur ou abscence de YearContainer
              if (abxModelManager.checkYearContainer(yearContainerResult) === false) {
                return;
              }
              _backObjects.yearContainer = yearContainerResult.YearContainer;

              // SchoolYear
              // erreur lors de la récupération du shoolYear
              if (schoolYearResult !== undefined && (schoolYearResult.result !== undefined
                  || schoolYearResult.SchoolYear === undefined)) {

                abxLog.error({message: "Erreur lors de la récupération du schoolYear.", tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                  errorMessage: "Erreur lors de la récupération de l'année scolaire. Vous ne pouvez pas paramétrer l'établissement.",
                  adviceMessage: "Vous pouvez réessayer ou signaler cet incident.",
                  errorObject: schoolYearResult
                };
                abxFlashMessage.showError(options);
                abxRouter.navigate(['Core.home']);
                return;
              }

              _backObjects.schoolYear = schoolYearResult;
              vm.isAllowedManageCrudObjects.schoolYear.read = abxAcl.isAllowedManageCrudObject('schoolYear', 'read');
              // pas de schoolYear
              if (schoolYearResult === undefined) {
                abxLog.debug({message: "SchoolYear inexistant.", object: componentName, method: "$routerOnActivate", tag: "settings"});
                vm.isAllowedManageCrudObjects.schoolYear.create = abxAcl.isAllowedManageCrudObject('schoolYear', 'create');
                // pas de schoolYear : le seul paramétrage possible est le schoolYear, donc return
                vm.canDisplayView = true;
                return;
              }
              // un seul schoolYear autorisé

              //affectation du schoolYear et des acl
              vm.crudObjects.schoolYear.push({
                objectDisplayName: abxSchoolYearModel.getObjectsDisplayNames([_backObjects.schoolYear])[0],
                id: _backObjects.schoolYear.SchoolYear.id,
                frontEndAcl: {
                  update: abxAcl.isAllowedManageCrudObject(_backObjects.schoolYear.SchoolYear, 'update'),
                  delete: abxAcl.isAllowedManageCrudObject(_backObjects.schoolYear.SchoolYear, 'delete')
                }
              });
              vm.isAllowedManageCrudObjects.schoolYear.create = false;

              //SchoolYear de l'année précédente                        
              // On vérifie que le SchoolYear de l'année précédente existe
              if (allSchoolYearResult.result === undefined && allSchoolYearResult[0] !== undefined && allSchoolYearResult.length >= 2) {
                // On récupère le SchoolYear de l'année précedente
                previousSchoolYearResult = allSchoolYearResult[allSchoolYearResult.length - 2];
                _backObjects.previousSchoolYear = previousSchoolYearResult;

                //affectation du schoolYear de l'année précédente
                vm.crudObjects.previousSchoolYear.push({
                  objectDisplayName: abxSchoolYearModel.getObjectsDisplayNames([_backObjects.previousSchoolYear])[0],
                  id: _backObjects.previousSchoolYear.SchoolYear.id,
                  frontEndAcl: {
                    update: abxAcl.isAllowedManageCrudObject(_backObjects.previousSchoolYear.SchoolYear, 'update'),
                    delete: abxAcl.isAllowedManageCrudObject(_backObjects.previousSchoolYear.SchoolYear, 'delete')
                  }
                });
              }

              // récupération des autres paramétrages
              var concatRequests = [],
                  requestMapping = [];
              // periodTypes
              if (abxAcl.isAllowedManageCrudObject('periodType', 'read')) {
                concatRequests.push({modelMethod: abxPeriodTypeModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}});
                requestMapping.push('periodType');
              }
              //timetableContainer
              if (abxAcl.isAllowedManageCrudObject('timetableContainer', 'read')) {
                concatRequests.push({modelMethod: abxTimetableContainerModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}});
                requestMapping.push('timetableContainer');
                //Si le SchoolYear de l'année précédente existe, on récupère les TimetableContainers
                if (_backObjects.previousSchoolYear.SchoolYear !== undefined) {
                  concatRequests.push({modelMethod: abxTimetableContainerModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.previousSchoolYear.SchoolYear.id}});
                  requestMapping.push('previousTimetableContainer');
                }
              }
              if (abxAcl.isAllowedManageCrudObject('alternatingWeeks', 'read')) {
                concatRequests.push({modelMethod: abxAlternatingWeeksModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.schoolYear.SchoolYear.id}});
                requestMapping.push('alternatingWeeks');
              }
              // TODO ajouter les autres paramétrages

              if (concatRequests.length > 0) {
                abxModelManager.addConcatRequest(concatRequests)
                    .then(function (response) {
                      // periodTypes
                      if (requestMapping.indexOf('periodType') > -1) {
                        var periodTypeResult = response[requestMapping.indexOf('periodType')];
                        // affectation des periodTypes et des acl
                        vm.isAllowedManageCrudObjects.periodType = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('periodType', 'create')
                        };
                        _populateViewModel('periodType', periodTypeResult);
                      }

                      //timetableContainer
                      if (requestMapping.indexOf('timetableContainer') > -1) {
                        var timetableContainerResult = response[requestMapping.indexOf('timetableContainer')];
                        // affectation des timetableContainer et des acl
                        vm.isAllowedManageCrudObjects.timetableContainer = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('timetableContainer', 'create')
                        };
                        _populateViewModel('timetableContainer', timetableContainerResult);
                      }
                      //alternatingWeeks
                      if (requestMapping.indexOf('alternatingWeeks') > -1) {
                        var alternatingWeeksResult = response[requestMapping.indexOf('alternatingWeeks')];
                        // affectation des periodTypes et des acl
                        vm.isAllowedManageCrudObjects.alternatingWeeks = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('alternatingWeeks', 'create')
                        };
                        _populateViewModel('alternatingWeeks', alternatingWeeksResult);
                      }

                      if (requestMapping.indexOf('previousTimetableContainer') > -1) {
                        var previousTimetableContainerResult = response[requestMapping.indexOf('previousTimetableContainer')];
                        //erreur de back
                        if (previousTimetableContainerResult.result !== undefined) {
                          vm.hasBackCrudObjectsError.previousTimetableContainers = true;
                        } else {
                          _backObjects.previousTimetableContainers = previousTimetableContainerResult;
                          for (var i = 0, length = previousTimetableContainerResult.length; i < length; i++) {

                            vm.crudObjects.previousTimetableContainers.push({
                              objectDisplayName: abxTimetableContainerModel.getObjectsDisplayNames([previousTimetableContainerResult[i]])[0],
                              id: previousTimetableContainerResult[i].TimetableContainer.id,
                              frontEndAcl: {
                                update: abxAcl.isAllowedManageCrudObject(previousTimetableContainerResult[i].TimetableContainer, 'update'),
                                delete: abxAcl.isAllowedManageCrudObject(previousTimetableContainerResult[i].TimetableContainer, 'delete')
                              }
                            });
                          }
                        }

                      }
                      vm.canDisplayView = true;
                    });
              } else {
                vm.canDisplayView = true;
              }
            });
      } catch (e) {
        var errorMessage = "Erreur lors de la récupération des données.";
        abxLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas visualiser les données de cette page.",
          errorObject: {errorMessage: e.message}
        };
        abxFlashMessage.showError(options);
        abxRouter.navigate(['Core.home']);
      }
    }
    ;
  }

// fin IIFE
})();