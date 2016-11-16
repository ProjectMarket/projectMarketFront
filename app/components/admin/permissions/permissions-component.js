/** 
 * Component abx.admin.permissionsComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: home-component.js 515 2016-02-08 12:45:28Z rpoussin $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'abx.admin.permissionsComponent';

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
        templateUrl: 'app/components/admin/permissions/permissions-component.html',
        controller: [
          '$q',
          '$filter',
          'abx.common.logService',
          'abx.common.aclService',
          'abx.common.flashMessageService',
          'abx.common.routerService',
          'abx.common.modelManagerService',
          'abx.common.yearContainerModel',
          'abx.common.schoolYearModel',
          'abx.common.schoolYearRolePermissionModel',
          'abx.common.classRolePermissionModel',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      $q,
      $filter,
      abxLog,
      abxAcl,
      abxFlashMessage,
      abxRouter,
      abxModelManager,
      abxYearContainerModel,
      abxSchoolYearModel,
      abxSchoolYearRolePermissionModel,
      abxClassRolePermissionModel
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
     * Objets reçus du back
     * 
     * @property {object} 
     */
    var _backObjects = {
      schoolYear: {},
      schoolYearRolePermission: [],
      classRolePermission: {}
    };

    //******************
    // Méthodes privées
    //******************


    /*
     * Lecture et vérification des erreurs des SchoolYearRolePermission après sauvegarde
     * 
     * @param {boolean} hasError
     * @returns {void}
     */

    var _readSchoolYearRolePermissionAfterSave = function (hasError) {
      abxSchoolYearRolePermissionModel.readBySchoolYearId({forceBackRead: true, schoolYearId: _backObjects.schoolYear.id})
          .then(function (response) {
            vm.isSaving = false;
            if (response.result !== undefined) {
              var options = {
                errorMessage: "Impossible d'afficher les droits d'accès à ISA.",
                errorObject: {
                  objectName: "schoolYearRolePermission",
                  objects: [response]
                }
              };
              vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
              abxFlashMessage.showError(options);

            } else if (hasError) {
              _populateViewModel('schoolYearRolePermission', response);
              var options = {
                errorMessage: "Une erreur est survenue lors de l'enregistrement des droits d'accès à ISA.",
                errorObject: {
                  objectName: "schoolYearRolePermission",
                  objects: [response]
                }
              };
              abxFlashMessage.showError(options);

            } else {
              hasError = false;
              _populateViewModel('schoolYearRolePermission', response);
              abxFlashMessage.showSuccess("Les droits d'accès à ISA ont été modifiés avec succès.");
            }
          })
          .catch(function () {

          });
    };


    /*
     * Lecture et vérification des erreurs des ClassRolePermission après sauvegarde
     * 
     * @param {boolean} hasError
     * @returns {void}
     */

    var _readClassRolePermissionAfterSave = function (hasError) {
      abxClassRolePermissionModel.readBySchoolYearId({forceBackRead: true, schoolYearId: _backObjects.schoolYear.id})
          .then(function (response) {
            vm.isSaving = false;
            if (response.result !== undefined) {
              var options = {
                errorMessage: "Impossible d'afficher les droits d'accès à ISA.",
                errorObject: {
                  objectName: "ClassRolePermission",
                  objects: [response]
                }
              };
              abxFlashMessage.showError(options);
              vm.hasBackCrudObjectsError.classRolePermissions = true;

            } else if (hasError) {
              _populateViewModel('classRolePermission', response);
              var options = {
                errorMessage: "Une erreur est survenue lors de l'enregistrement des droits d'accès à ISA.",
                errorObject: {
                  objectName: "ClassRolePermission",
                  objects: [response]
                }
              };
              abxFlashMessage.showError(options);

            } else {
              hasError = false;
              _populateViewModel('classRolePermission', response);
              abxFlashMessage.showSuccess("Les droits d'accès à ISA ont été modifiés avec succès.");
            }
          })
          .catch(function () {

          });
    };


    /*
     * Affectation des données pour la vue
     * 
     * @param {string} crudObject
     * @param {object} result
     * @returns {void}
     */

    var _populateViewModel = function(crudObject, result) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});

      if (['schoolYearRolePermission', 'classRolePermission'].indexOf(crudObject) === -1) {
        abxLog.error({message: "CrudObject incorrect : {{crudObject}}",
          params: {crudObject: crudObject}, tag: "params", object: componentName, method: "_populateViewModel"});
        throw new Error('CrudObject incorrect : ' + crudObject);
      }

      try {
        // initialisations
        var errorMessage = "Erreur lors de la récupération ";
        switch (crudObject) {
          case 'schoolYearRolePermission':
            errorMessage += "des rôles autorisés à accéder à Isa.";
            _backObjects.schoolYearRolePermission = [];
            vm.crudObjects.schoolYearRolePermission = [];
            break;
          case 'classRolePermission':
            errorMessage += "des droits.";
            _backObjects.classRolePermission = {};
            vm.crudObjects.classRolePermission = {};
          default:
            break;
        }


        // affectation
        switch (crudObject) {
          case 'schoolYearRolePermission':
            // erreur de back
            if (result.result !== undefined) {
              vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
              return;
            }
            _backObjects.schoolYearRolePermission = result;
            var roleList = [
              'ROLE_INS',
              'ROLE_DIR',
              'ROLE_MANAGER',
              'ROLE_MANAGER_DM',
              'ROLE_MANAGER_SCHEDULE',
              'ROLE_MANAGER_WRB',
              'ROLE_MANAGER_DMS',
              'ROLE_MANAGER_COMP',
              'ROLE_TEACHER',
              'ROLE_STAFF_LTD',
              'ROLE_STUDENT',
              'ROLE_RESP'],
                schoolYearRolePermissionList = [];
            roleList = $filter('abxCommonOrderByRoleFilter')(roleList);
            
            for (var i = 0, length = roleList.length; i < length; i++) {
              schoolYearRolePermissionList.push(
                  {
                    role: roleList[i],
                    value: false,
                    id: undefined,
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.schoolYearRolePermission.create,
                      delete: false
                    }
                  }
              );
            }

            var roleIndex;
            for (var i = 0, length = result.length; i < length; i++) {
              roleIndex = roleList.indexOf(result[i].SchoolYearRolePermission.role);
              schoolYearRolePermissionList[roleIndex].value = true;
              schoolYearRolePermissionList[roleIndex].id = result[i].SchoolYearRolePermission.id;
              schoolYearRolePermissionList[roleIndex].frontEndAcl.delete = abxAcl.isAllowedManageCrudObject(result[i].SchoolYearRolePermission, 'delete');
            }
            vm.crudObjects.schoolYearRolePermission = schoolYearRolePermissionList;
            break;



          case 'classRolePermission':
            if (result.result !== undefined) {
              vm.hasBackCrudObjectsError.classRolePermission = true;
              return;
            }
            var classList = {
              Lesson: {
                read: {
                  ROLE_STUDENT: {
                    value: false,
                    id: undefined,
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.classRolePermission.create,
                      delete: false
                    }
                  },
                  ROLE_RESP: {
                    value: false,
                    id: undefined,
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.classRolePermission.create,
                      delete: false
                    }
                  },
                  ROLE_INS: {
                    value: false,
                    id: undefined,
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.classRolePermission.create,
                      delete: false
                    }
                  }
                },
                cud: {
                  ROLE_TEACHER: {
                    value: false,
                    ids: [],
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.classRolePermission.create,
                      delete: false
                    }
                  }
                }
              },
              Workbook: {
                read: {
                  ROLE_INS: {
                    value: false,
                    id: undefined,
                    frontEndAcl: {
                      create: vm.isAllowedManageCrudObjects.classRolePermission.create,
                      delete: false
                    }
                  }
                }
              }
            };
            
            // tri
            classList.Lesson.read = $filter('abxCommonOrderByRoleFilter')(classList.Lesson.read);
            classList.Lesson.cud = $filter('abxCommonOrderByRoleFilter')(classList.Lesson.cud);
            classList.Workbook.read = $filter('abxCommonOrderByRoleFilter')(classList.Workbook.read);

            for (var i = 0; i < result.length; i++) {
              if (result[i].ClassRolePermission.action === "READ") {
                classList[result[i].ClassRolePermission.clazz].read[result[i].ClassRolePermission.role].value = true;
                classList[result[i].ClassRolePermission.clazz].read[result[i].ClassRolePermission.role].id = result[i].ClassRolePermission.id;
                classList[result[i].ClassRolePermission.clazz].read[result[i].ClassRolePermission.role].frontEndAcl.delete = result[i].ClassRolePermission.frontEndAcl["DELETE"];
              } else {
                classList[result[i].ClassRolePermission.clazz].cud[result[i].ClassRolePermission.role].value = true;
                classList[result[i].ClassRolePermission.clazz].cud[result[i].ClassRolePermission.role].ids.push(result[i].ClassRolePermission.id);
                classList[result[i].ClassRolePermission.clazz].cud[result[i].ClassRolePermission.role].frontEndAcl.delete = result[i].ClassRolePermission.frontEndAcl["DELETE"];
              }
            }

            // teste que il y a 0 ou les 3 ids (CREATE, UPDATE, DELETE) pour une méthode CUD
            for (var roleObject in classList.Lesson.cud) {
              if (classList.Lesson.cud[roleObject].ids.length !== 0 && classList.Lesson.cud[roleObject].ids.length !== 3) {
                vm.hasBackCrudObjectsError.classRolePermission = true;
                return;
              }
            }

            vm.crudObjects.classRolePermission = classList;
            break;

          default:
            break;
        }
      } catch (e) {
        abxLog.error({message: "Erreur lors de l'affectation des données : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "_populateViewModel"});
        if (crudObject === 'schoolYearRolePermission') {
          vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
        } else if (crudObject === "classRolePermission") {
          vm.hasBackCrudObjectsError.classRolePermission = true;
        } else {
          vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
          vm.hasBackCrudObjectsError.classRolePermission = true;
        }
      }
    }
    ;
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
     * @property {object} liste des droits d'affichage
     */
    vm.isAllowedManageCrudObjects = {
      schoolYearRolePermission: {
        read: false,
        create: false
      },
      classRolePermission: {
        read: false,
        create: false
      }
    };
    /*
     * 
     * @property {object} Liste des objets à gérer
     */
    vm.crudObjects = {
      schoolYearRolePermission: [],
      classRolePermission: {}
    };
    /*
     * L'objet est-il en train d'être sauvegardé sur le back ?
     * Interdit deux suppresions simultannées
     * 
     * @property {boolean}
     */
    vm.isSaving = false;
    /*
     * 
     * @property {object} Liste des erreurs des models
     */
    vm.hasBackCrudObjectsError = {
      schoolYearRolePermissions: false,
      classRolePermission: false
    };
    //*******************
    // Méthodes du scope
    //*******************

    /*
     * Change les droits par lot
     * 
     * @param {string} crudObjectName
     * @param {boolean} newValue
     * @returns {void}
     */
    vm.toggle = function(crudObjectName, newValue) {
      if (crudObjectName === 'schoolYearRolePermission') {
        var crudObject;
        for (var i = 0; i < vm.crudObjects.schoolYearRolePermission.length; i++) {
          crudObject = vm.crudObjects.schoolYearRolePermission[i];
          if ((crudObject.value && (crudObject.frontEndAcl.delete || crudObject.id === undefined))
              || (!crudObject.value && (crudObject.frontEndAcl.create || crudObject.id !== undefined))) {
            vm.crudObjects.schoolYearRolePermission[i].value = newValue;
          }
        }
      }
    };
    /*
     * 
     * @param {type} nextInstruction
     * @param {type} prevInstruction
     * @returns {undefined}
     */
    vm.saveSchoolYearRolePermission = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.saveSchoolYearRolePermission", tag: "methodEntry"});
      vm.isSaving = true;

      var hasError = false;

      try {
        //Décomposition des différents create et delete à envoyer au back
        var toCreateObject = {
          action: '',
          objects: []
        },
        toDeleteObject = {
          action: '',
          objects: []
        },
        createPromise,
            deletePromise;
        for (var i = 0, length = vm.crudObjects.schoolYearRolePermission.length; i < length; i++) {

          // DELETE si il y avait un schoolYearRolePermission (= accès autorisé) et que l'on veut interdire l'accès
          if (vm.crudObjects.schoolYearRolePermission[i].id !== undefined && !vm.crudObjects.schoolYearRolePermission[i].value) {
            toDeleteObject.action = "delete";
            toDeleteObject.objects.push(
                {
                  id: vm.crudObjects.schoolYearRolePermission[i].id
                }
            );
            // CREATE si il n'y avait pas de schoolYearRolePermission (= accès interdit) et que l'on veut autoriser l'accès
          } else if (vm.crudObjects.schoolYearRolePermission[i].id === undefined && vm.crudObjects.schoolYearRolePermission[i].value) {
            toCreateObject.action = "create";
            toCreateObject.objects.push(
                {
                  role: vm.crudObjects.schoolYearRolePermission[i].role,
                  schoolYearId: _backObjects.schoolYear.id
                }
            );
          }
          // SINON => pas de changement
        }
        if (toCreateObject.objects.length === 0 && toDeleteObject.objects.length === 0) {
          abxFlashMessage.showInfo("Aucun changement à effectuer.");
          return;
        }

        abxFlashMessage.showWait();
        if (toCreateObject.objects.length > 0) {
          createPromise = abxSchoolYearRolePermissionModel.create(toCreateObject);
        } else {
          createPromise = $q.when();
        }
        if (toDeleteObject.objects.length > 0) {
          deletePromise = abxSchoolYearRolePermissionModel.delete(toDeleteObject);
        } else {
          deletePromise = $q.when();
        }

        $q.all([createPromise, deletePromise])
            .then(function(responses) {
              var createResult = responses[0],
                  deleteResult = responses[1];

              if (createResult !== undefined) {
                for (var i = 0, length = createResult.length; i < length; i++) {
                  if (createResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la création en back. SchoolYearRolePermission={{{SchoolYearRolePermission}}}",
                      params: {SchoolYearRolePermission: createResult[i]}, tag: "params", object: createResult[i], method: "saveSchoolYearRolePermission"});
                    hasError = true;
                  }
                }
              }

              if (deleteResult !== undefined) {
                for (var i = 0, length = deleteResult.length; i < length; i++) {
                  if (deleteResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la suppression en back. SchoolYearRolePermission={{{SchoolYearRolePermission}}}",
                      params: {SchoolYearRolePermission: deleteResult[i]}, tag: "params", object: deleteResult[i], method: "saveSchoolYearRolePermission"});
                    hasError = true;
                  }
                }
              }

              _readSchoolYearRolePermissionAfterSave(hasError);

            });

      } catch (e) {
        abxLog.error({message: "Erreur lors de l'enregistrement des SchoolYearRolePermission : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "saveSchoolYearRolePermission"});

        // FIXME ajouter erreur + charger les données
        abxFlashMessage.showError({errorMessage: "Une erreur est survenue lors de l'enregistrement des droits d'Isa.",
          errorObject: {objectName: "SchoolYearRolePermission"}
        });

        vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
        hasError = true;
        _readSchoolYearRolePermissionAfterSave(hasError);
      }
    };
    /*
     * 
     * @param {type} nextInstruction
     * @param {type} prevInstruction
     * @returns {undefined}
     */
    vm.saveClassRolePermission = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.saveClassRolePermission", tag: "methodEntry"});
      vm.isSaving = true;

      var hasError = false;

      try {
        //Décomposition des différents create et delete à envoyer au back
        var toCreateObjects = [],
            toDeleteObjects = [],
            createPromise = $q.when(),
            deletePromise = $q.when(),
            readClassList = ['Lesson', 'Workbook'],
            cudClassList = ['Lesson'];

        for (var i = 0, length = readClassList.length; i < length; i++) {
          for (var role in vm.crudObjects.classRolePermission[readClassList[i]].read) {
            if (vm.crudObjects.classRolePermission[readClassList[i]].read[role].id !== undefined && !vm.crudObjects.classRolePermission[readClassList[i]].read[role].value) {
              toDeleteObjects.push({id: vm.crudObjects.classRolePermission[readClassList[i]].read[role].id});
            } else if (vm.crudObjects.classRolePermission[readClassList[i]].read[role].id === undefined && vm.crudObjects.classRolePermission[readClassList[i]].read[role].value) {
              toCreateObjects.push(
                  {
                    role: role,
                    clazz: readClassList[i],
                    schoolYearId: _backObjects.schoolYear.id,
                    action: "READ"
                  }
              );
            }
          }
        }

        for (var i = 0, length = cudClassList.length; i < length; i++) {
          for (var role in vm.crudObjects.classRolePermission[cudClassList[i]].cud) {
            if (vm.crudObjects.classRolePermission[cudClassList[i]].cud[role].ids.length > 0 && !vm.crudObjects.classRolePermission[cudClassList[i]].cud[role].value) {
              for (var j = 0; j < 3; j++) {
                toDeleteObjects.push(
                    {
                      id: vm.crudObjects.classRolePermission[cudClassList[i]].cud[role].ids[j]
                    }
                );
              }
            } else if (vm.crudObjects.classRolePermission[cudClassList[i]].cud[role].ids.length === 0 && vm.crudObjects.classRolePermission[cudClassList[i]].cud[role].value) {
              for (var j = 0; j < 3; j++) {
                toCreateObjects.push(
                    {
                      role: role,
                      clazz: cudClassList[i],
                      schoolYearId: _backObjects.schoolYear.id,
                      action: ['CREATE', 'UPDATE', 'DELETE'][j]
                    }
                );
              }
            }
          }
        }

        // SINON => pas de changement
        if (toCreateObjects.length === 0 && toDeleteObjects.length === 0) {
          abxFlashMessage.showError({errorMessage: "Aucun changement à effectuer."});
          return;
        }

        abxFlashMessage.showWait();
        if (toCreateObjects.length > 0) {
          createPromise = abxClassRolePermissionModel.create({objects: toCreateObjects});
        }
        if (toDeleteObjects.length > 0) {
          deletePromise = abxClassRolePermissionModel.delete({objects: toDeleteObjects});
        }

        $q.all([createPromise, deletePromise])
            .then(function(responses) {
              var createResult = responses[0],
                  deleteResult = responses[1];

              if (createResult !== undefined) {
                for (var i = 0, length = createResult.length; i < length; i++) {
                  if (createResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la création en back d'un ClassRolePermission. Erreur={{{error}}}",
                      params: {error: createResult[i]}, tag: "params", object: componentName, method: "saveClassRolePermission"});
                    hasError = true;
                  }
                }
              }

              if (deleteResult !== undefined) {
                for (var i = 0, length = deleteResult.length; i < length; i++) {
                  if (deleteResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la suppression en back d'un ClassRolePermission. Erreur={{{error}}}",
                      params: {error: deleteResult[i]}, tag: "params", object: componentName, method: "saveClassRolePermission"});
                    hasError = true;
                  }
                }
              }

              _readClassRolePermissionAfterSave(hasError);
            });

      } catch (e) {
        abxLog.error({message: "Erreur lors de l'enregistrement des ClassRolePermissions : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "saveClassRolePermission"});

        vm.hasBackCrudObjectsError.classRolePermission = true;
        hasError = true;
        _readClassRolePermissionAfterSave(hasError);
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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});
      
      _this.abxAppController.vm.setModule('admin.permissions');
      
      try {
        // récupération des données
        var concatRequests = [
          {modelMethod: abxYearContainerModel.readCurrent, options: {}},
          {modelMethod: abxSchoolYearModel.readCurrent, options: {}}
        ];
        abxModelManager.addConcatRequest(concatRequests)
            .then(function(response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1];
              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (abxModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              _backObjects.schoolYear = schoolYearResult.SchoolYear;
              // récupération des autres paramétrages
              var concatRequests = [],
                  requestMapping = [];
              if (abxAcl.isAllowedManageCrudObject('schoolYearRolePermission', 'read')) {
                concatRequests.push({modelMethod: abxSchoolYearRolePermissionModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.schoolYear.id}});
                requestMapping.push('schoolYearRolePermission');
              }
              if (abxAcl.isAllowedManageCrudObject('classRolePermission', 'read')) {
                concatRequests.push({modelMethod: abxClassRolePermissionModel.readBySchoolYearId, options: {forceBackRead: true, schoolYearId: _backObjects.schoolYear.id}});
                requestMapping.push('classRolePermission');
              }

              if (concatRequests.length > 0) {
                abxModelManager.addConcatRequest(concatRequests)
                    .then(function(response) {
                      // schoolYearRolePermission
                      if (requestMapping.indexOf('schoolYearRolePermission') > -1) {
                        var schoolYearRolePermissionResult = response[requestMapping.indexOf('schoolYearRolePermission')];
                        // affectation des permissions et des acl
                        vm.isAllowedManageCrudObjects.schoolYearRolePermission = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('schoolYearRolePermission', 'create')
                        };
                        _populateViewModel('schoolYearRolePermission', schoolYearRolePermissionResult);
                      }

                      // classRolePermission
                      if (requestMapping.indexOf('classRolePermission') > -1) {
                        var classRolePermissionResult = response[requestMapping.indexOf('classRolePermission')];
                        // affectation des permissions et des acl
                        vm.isAllowedManageCrudObjects.classRolePermission = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('classRolePermission', 'create')
                        };
                        _populateViewModel('classRolePermission', classRolePermissionResult);
                      }
                      vm.canDisplayView = true;
                    });
              } else {
                abxLog.error({message: "Accès à " + componentName + " sans avoir les droits. Vérifier componentSecurity value.",
                  tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                  errorMessage: "Vous n'avez pas l'autorisation de gérer les droits."
                };
                abxFlashMessage.showError(options);
                abxRouter.navigate(['Core.home']);
              }

            });
      } catch (e) {
        var errorMessage = "Erreur lors de la récupération des données.";
        abxLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
          params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
        var options = {
          errorMessage: errorMessage,
          adviceMessage: "Vous ne pouvez pas modifier les droits.",
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
