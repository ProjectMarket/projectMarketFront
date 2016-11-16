/** 
 * Component abx.admin.userSchoolRolesComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: user-school-roles-component.js 515 2016-02-08 12:45:28Z rpoussin $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';
  var componentName = 'abx.admin.userSchoolRolesComponent';
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
        templateUrl: 'app/components/admin/user-school-roles/user-school-roles-component.html',
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
          'abx.common.userSchoolRolesModel',
          'abx.common.userService',
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
      abxUserSchoolRolesModel,
      abxUserService
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
      school: {
        id: undefined
      },
      userSchoolRoles: []
    };
    //******************
    // Méthodes privées
    //******************


    /*
     * Lecture et vérification des erreurs des ClassRolePermission après sauvegarde
     * 
     * @param {boolean} hasError
     * @returns {void}
     */

    var _readUserSchoolRolesAfterSave = function (hasError) {
      abxUserSchoolRolesModel.readBySchoolId({forceBackRead: true, schoolId: _backObjects.school.id})
          .then(function (response) {
            vm.isSaving = false;
            if (response.result !== undefined) {
              var options = {
                errorMessage: "Impossible d'afficher les rôles d'ISA.",
                errorObject: {
                  objectName: "UserSchoolRoles",
                  objects: [response]
                }
              };
              abxFlashMessage.showError(options);
              vm.hasBackCrudObjectsError.classRolePermissions = true;
            } else if (hasError) {
              _populateViewModel('USERSCHOOLROLE', response);
              var options = {
                errorMessage: "Une erreur est survenue lors de l'enregistrement des rôles d'accès à ISA.",
                errorObject: {
                  objectName: "UserSchoolRoles",
                  objects: [response]
                }
              };
              abxFlashMessage.showError(options);
            } else {
              hasError = false;
              _populateViewModel('USERSCHOOLROLE', response);
              abxFlashMessage.showSuccess("Les rôles d'ISA ont été modifiés avec succès.");
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

    var _populateViewModel = function (crudObject, result) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});
      if (crudObject !== "USERSCHOOLROLE") {
        abxLog.error({message: "CrudObject incorrect : {{crudObject}}",
          params: {crudObject: crudObject}, tag: "params", object: componentName, method: "_populateViewModel"});
        throw new Error('CrudObject incorrect : ' + crudObject);
      }

      try {
        // initialisations
        var errorMessage = "Erreur lors de la récupération des rôles d'Isa.";
        _backObjects.userSchoolRoles = [];
        vm.crudObjects.userSchoolRoles = [];
        if (result.result !== undefined) {
          vm.hasBackCrudObjectsError.schoolYearRolePermissions = true;
          return;
        }

        var roleObjectModel = {
          userId: undefined,
          firstName: '',
          lastName: '',
          sex: '',
          roles: {
            ROLE_TEACHER: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_ADMIN: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_DIR: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER_DM: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER_SCHEDULE: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER_WRB: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER_DMS: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            ROLE_MANAGER_COMP: {
              value: false,
              isAuto: false,
              canEdit: true
            },
            // Le rôle ROLE_STAFF_LTD ne doit jamais être modifié.
            ROLE_STAFF_LTD: {
              value: false,
              isAuto: true,
              canEdit: false
            }
          }
        };

        for (var i = 0, length = result.length; i < length; i++) {

          var role = angular.copy(roleObjectModel);

          role.userId = result[i].Staff.id;
          role.firstName = result[i].Staff.firstName;
          role.lastName = result[i].Staff.lastName;
          role.sex = result[i].Staff.sex;

          for (var j = 0, length2 = result[i].Staff.userSchoolRoles.length; j < length2; j++) {

            role.roles[result[i].Staff.userSchoolRoles[j].UserSchoolRole.role].value = true;
            role.roles[result[i].Staff.userSchoolRoles[j].UserSchoolRole.role].isAuto = result[i].Staff.userSchoolRoles[j].UserSchoolRole.recordType === "auto" ? true : false;

            /*
             * Si une fontion d'Aneto a été créé de façon auto, on ne doit pas pour le modifier.
             * La fonction DIR d'Aneto donne 4 rôles : ROLE_ADMIN, ROLE_MANAGER, ROLE_TEACHER et ROLE_DIR.
             * Si ROLE_DIR a été donné de façon manuel (!= auto), les rôles ROLE_ADMIN, ROLE_MANAGER et ROLE_TEACHER ne doivent pas être supprimables.
             */
            if (role.roles[result[i].Staff.userSchoolRoles[j].UserSchoolRole.role].isAuto || ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_TEACHER"].indexOf(result[i].Staff.userSchoolRoles[j].UserSchoolRole.role) > -1
                && role.roles["ROLE_DIR"].value && !role.roles["ROLE_DIR"].isAuto) {
              role.roles[result[i].Staff.userSchoolRoles[j].UserSchoolRole.role].canEdit = false;
            }
          }

          /* Ajout du userSchoolRoles à la liste de StaffLimited
           * si le rôle ROLE_STAFF_LTD existe et qu'il est manual
           */
          if (!role.roles["ROLE_STAFF_LTD"].isAuto && role.roles["ROLE_STAFF_LTD"].value) {
            vm.crudObjects.staffsLimited.push(role);
          }

          vm.crudObjects.userSchoolRoles.push(role);
        }
        console.info("vm.crudObjects.staffsLimited", vm.crudObjects.staffsLimited);
        // Copie pour permettre le passage par valeur et non par référence
        _backObjects.userSchoolRoles = angular.copy(vm.crudObjects.userSchoolRoles);

        vm.isAllowedManageCrudObjects.userSchoolRoles = {
          read: true
        };

        vm.canDisplayView = true;

      } catch (e) {
        abxLog.error({message: "Erreur lors de l'affectation des données : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "_populateViewModel"});
        vm.hasBackCrudObjectsError.userSchoolRoles = true;
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
      userSchoolRoles: {
        read: false,
        create: false
      }
    };
    /*
     * 
     * @property {object} Liste des objets à gérer
     */
    vm.crudObjects = {
      userSchoolRoles: [],
      staffsLimited: []
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
      userSchoolRoles: false
    };
    /*
     * 
     * @property {array} Liste des rôles à afficher
     */
    vm.roles = {
      ROLE_DIR: false,
      ROLE_ADMIN: false,
      ROLE_MANAGER: false,
      ROLE_MANAGER_DM: false,
      ROLE_MANAGER_SCHEDULE: false,
      ROLE_MANAGER_WRB: false,
      ROLE_MANAGER_DMS: false,
      ROLE_MANAGER_COMP: false,
      ROLE_TEACHER: false,
      ROLE_STAFF_LTD: false
    };
    //*******************
    // Méthodes du scope
    //*******************

    /*
     * 
     * @param {type} nextInstruction
     * @param {type} prevInstruction
     * @returns {undefined}
     */
    vm.saveUserSchoolRoles = function () {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.saveRole", tag: "methodEntry"});
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

        for (var i = 0, length = vm.crudObjects.userSchoolRoles.length; i < length; i++) {

          for (var roles in  vm.crudObjects.userSchoolRoles[i].roles) {

            var role = vm.crudObjects.userSchoolRoles[i].roles[roles];

            if (role.value !== _backObjects.userSchoolRoles[i].roles[roles].value && role.value) {
              toCreateObject.objects.push(
                  {
                    userId: vm.crudObjects.userSchoolRoles[i].userId,
                    schoolId: _backObjects.school.id,
                    role: roles
                  }
              );

            } else if (role.value !== _backObjects.userSchoolRoles[i].roles[roles].value && !role.value) {
              toDeleteObject.objects.push(
                  {
                    userId: vm.crudObjects.userSchoolRoles[i].userId,
                    schoolId: _backObjects.school.id,
                    role: roles
                  }
              );
            }
          }

          // SINON => pas de changement
        }
        if (toCreateObject.objects.length === 0 && toDeleteObject.objects.length === 0) {
          abxFlashMessage.showInfo("Aucun changement à effectuer.");
          return;
        }

        abxFlashMessage.showWait();

        if (toCreateObject.objects.length > 0) {
          createPromise = abxUserSchoolRolesModel.create(toCreateObject);
        } else {
          createPromise = $q.when();
        }

        if (toDeleteObject.objects.length > 0) {
          deletePromise = abxUserSchoolRolesModel.delete(toDeleteObject);
        } else {
          deletePromise = $q.when();
        }

        $q.all([createPromise, deletePromise])
            .then(function (responses) {

              var createResult = responses[0],
                  deleteResult = responses[1];

              if (createResult !== undefined) {
                for (var i = 0, length = createResult.length; i < length; i++) {
                  if (createResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la création en back. userSchoolRoles={{{userSchoolRoles}}}",
                      params: {userSchoolRoles: createResult[i]}, tag: "params", object: createResult[i], method: "saveUserSchoolRoles"});
                    hasError = true;
                  }
                }
              }

              if (deleteResult !== undefined) {
                for (var i = 0, length = deleteResult.length; i < length; i++) {
                  if (deleteResult[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la suppression en back. userSchoolRoles={{{userSchoolRoles}}}",
                      params: {userSchoolRoles: deleteResult[i]}, tag: "params", object: deleteResult[i], method: "saveUserSchoolRoles"});
                    hasError = true;
                  }
                }
              }

              _readUserSchoolRolesAfterSave(hasError);
            });

      } catch (e) {
        abxLog.error({message: "Erreur lors de l'enregistrement des userSchoolRoles : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "saveUserSchoolRoles"});
        // FIXME ajouter erreur + charger les données
        abxFlashMessage.showError({errorMessage: "Une erreur est survenue lors de l'enregistrement des roles d'Isa.",
          errorObject: {objectName: "UserSchoolRoles"}
        });
        vm.hasBackCrudObjectsError.roles = true;
        hasError = true;
        _readUserSchoolRolesAfterSave(hasError);
      }
    };

    /*
     * 
     * @param {array} selectedStaffLimitedIds
     * @returns {void}
     */
    vm.deleteStaffsLimited = function (selectedStaffLimitedIds) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deleteStaffsLimited", tag: "methodEntry"});
      vm.isSaving = true;
      var hasError = false;

      try {
        var toDeleteObject = {
          action: 'DELETE',
          objects: []
        };

        for (var i = 0; i < selectedStaffLimitedIds.length; i++) {
          toDeleteObject.objects.push(
              {
                userId: vm.crudObjects.staffsLimited[selectedStaffLimitedIds[i]].userId,
                schoolId: _backObjects.school.id,
                role: "ROLE_STAFF_LTD"
              }
          );
        }

        if (toDeleteObject.objects.length === 0) {
          abxFlashMessage.showInfo("Aucun changement à effectuer.");
          return;
        }

        abxFlashMessage.showWait();

        abxUserSchoolRolesModel.delete(toDeleteObject)
            .then(function (response) {

              if (response !== undefined) {
                for (var i = 0, length = response.length; i < length; i++) {
                  if (response[i].result !== undefined) {
                    abxLog.error({message: "Erreur lors de la suppression en back. userSchoolRoles={{{userSchoolRoles}}}",
                      params: {userSchoolRoles: response[i]}, tag: "params", object: response[i], method: "deleteStaffsLimited"});
                    hasError = true;
                  }
                }
              }

              _readUserSchoolRolesAfterSave(hasError);
            });
      } catch (e) {
        abxLog.error({message: "Erreur lors de la suppression des userSchoolRoles : message={{message}}",
          params: {message: e.message}, tag: "params", object: componentName, method: "saveUserSchoolRoles"});
        // FIXME ajouter erreur + charger les données
        abxFlashMessage.showError({errorMessage: "Une erreur est survenue lors de la suppression des roles d'Isa.",
          errorObject: {objectName: "UserSchoolRoles"}
        });
        vm.hasBackCrudObjectsError.roles = true;
        hasError = true;
        _readUserSchoolRolesAfterSave(hasError);
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
      _this.abxAppController.vm.setModule('admin:roles');

      try {
        // récupération des données
        var concatRequests = [
          {modelMethod: abxYearContainerModel.readCurrent, options: {}},
          {modelMethod: abxSchoolYearModel.readCurrent, options: {}}
        ];

        abxModelManager.addConcatRequest(concatRequests)
            .then(function (response) {

              var yearContainerResult = response[0],
                  schoolYearResult = response[1];
              // erreur ou abscence de YearContainer et/ou de schoolYear
              if (abxModelManager.checkYearContainerAndSchoolYear(yearContainerResult, schoolYearResult) === false) {
                return;
              }

              _backObjects.schoolYear = schoolYearResult.SchoolYear;

              // récupération du school
              _backObjects.school.id = abxUserService.getSelectedSchoolId();

              // récupération des autres paramétrages
              var concatRequests = [],
                  requestMapping = [];

              if (abxAcl.isAllowedManageCrudObject('USERSCHOOLROLE', 'read')) {
                concatRequests.push({modelMethod: abxUserSchoolRolesModel.readBySchoolId, options: {forceBackRead: true, schoolId: _backObjects.school.id}});
                requestMapping.push('USERSCHOOLROLE');
              }

              if (concatRequests.length > 0) {
                abxModelManager.addConcatRequest(concatRequests)
                    .then(function (response) {
                      // userSchoolRoles
                      if (requestMapping.indexOf('USERSCHOOLROLE') > -1) {
                        var rolesResult = response[requestMapping.indexOf('USERSCHOOLROLE')];
                        // affectation des permissions et des acl
                        vm.isAllowedManageCrudObjects.schoolYearRolePermission = {
                          read: true,
                          create: abxAcl.isAllowedManageCrudObject('USERSCHOOLROLE', 'create')
                        };

                        _populateViewModel('USERSCHOOLROLE', rolesResult);
                      }
                      vm.isAllowedManageCrudObjects.userSchoolRoles = {
                        read: true
                      };
                      vm.canDisplayView = true;
                    });

              } else {
                abxLog.error({message: "Accès à " + componentName + " sans avoir les droits. Vérifier componentSecurity value.",
                  tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                  errorMessage: "Vous n'avez pas l'autorisation de gérer les rôles."
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
          adviceMessage: "Vous ne pouvez pas modifier les rôles.",
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
