/** 
 * Component abx.core.profileComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: profile-component.js 723 2016-04-01 09:52:51Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'abx.core.profileComponent';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.coreModule')
      .component(componentName, {
        $canActivate: [
          'abx.common.routerService',
          'abx.common.userService',
          'abx.common.logService',
          function(
              abxRouter,
              abxUser,
              abxLog
              ) {
            // autorisation d'accès à la page que si les profils sont affectés
            // et qu'il y a plusieurs profils possibles
            if (!abxUser.hasProfiles() || abxUser.getHasUniqueProfile()) {
              if (!abxUser.hasProfiles()) {
                var message = "Tentative d'accès à core.profile.select sans instanciation des profils.";
              } else {
                var message = "Tentative d'accès à core.profile.select alors qu'un seul profil est possible.";
              }
              abxLog.info({message: message, object: componentName, tag: "profile"});
              abxRouter.navigate(['Core.home']);
              return false;
            }

            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/core/profile/profile-component.html',
        controller: [
          '$scope',
          '$filter',
          'abx.common.logService',
          'abx.common.userService',
          'abx.common.routerService',
          'abx.common.configService',
          'abx.common.flashMessageService',
          'abx.common.schoolModel',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      $scope,
      $filter,
      abxLog,
      abxUser,
      abxRouter,
      abxConfig,
      abxFlashMessage,
      abxSchoolModel
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
     * @property {object} Config locale d'Abx
     */
    var _config = abxConfig.get();

    /*
     * @property {object} Profil actuel
     */
    var _selectedProfile = {};

    /*
     * @property {object} Rôles fermés
     */
    var _forbiddenRoles = {};

    /*
     * @property {object} Le modèle a été initialisé
     */
    var _initialized = {
      roleType: false,
      role: false,
      school: false,
      globalSchool: false,
      student: false
    };


    //******************
    // Méthodes privées
    //******************

    /*
     * Affecte les students pour un responsable
     * 
     * @return {void} 
     */
    var _setStudentsData = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "setStudentsData", tag: "methodEntry"});
      vm.students = abxUser.getResponsibleStudents();
    };

    /*
     * Affecte les établissements pour un élève pour un responsable
     * 
     * @param {integer} studentUserId
     * @return {void} 
     */
    var _setResponsibleStudentSchoolsData = function(studentUserId) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_setResponsibleStudentSchoolsData", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_setResponsibleStudentSchoolsData"});

      vm.schools = abxUser.getResponsibleStudentSchools(studentUserId);
    };

    /*
     * Affecte les établissements pour un élève 
     * 
     * @return {void} 
     */
    var _setStudentSchoolsData = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "setStudentSchoolsData", tag: "methodEntry"});
      vm.schools = abxUser.getStudentSchools();
    };

    /*
     * Affecte les types de rôles pour un personnel 
     * 
     * @return {void} 
     */
    var _setStaffRoleTypesData = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "setStaffRoleTypesData", tag: "methodEntry"});
      vm.roleTypes = abxUser.getStaffRoleTypes();
    };

    /*
     * Affecte les établissements pour un personnel établissement
     * 
     * @return {void} 
     */
    var _setStaffSchoolRoleSchoolsData = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "setStaffSchoolRoleSchoolsData", tag: "methodEntry"});
      vm.schools = abxUser.getStaffSchools();
    };

    /*
     * Affecte les établissements pour un personnel académique
     * 
     * @param {string} role
     * @param {undefined|integer} schoolId
     * @return {void} 
     */
    var _setStaffGlobalRoleSchoolsData = function(role, schoolId) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_setStaffGlobalRoleSchoolsData", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_setStaffGlobalRoleSchoolsData"});
      var globalSchools = abxUser.getGlobalSchools();

      if (role === "ROLE_INS") {
        for (var i = 0, length = globalSchools.length; i < length; i++) {
          if (globalSchools[i].schoolId === schoolId) {
            vm.globalSchools = [globalSchools[i]];
            return;
          }
        }
      } else {
        vm.globalSchools = globalSchools;
      }
    };

    /*
     * Affecte les rôles en établissement pour un personnel 
     * 
     * @param schoolId
     * @return {void} 
     */
    var _setStaffSchoolRoleSchoolRolesData = function(schoolId) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "_setStaffSchoolRoleSchoolRolesData", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "_setStaffSchoolRoleSchoolRolesData"});
      vm.roles = abxUser.getStaffSchoolRoles(schoolId);
    };

    /*
     * Affecte les rôles globaux pour un personnel 
     * 
     * @return {void} 
     */
    var _setStaffGlobalRolesData = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "setStaffGlobalRolesData", tag: "methodEntry"});
      vm.roles = abxUser.getStaffGlobalRoles();
    };


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
     * @property {boolean} l'user a-t-il déjà un profil sélectionné ?
     */
    vm.hasAlreadySelectedProfile = false;

    /*
     * @property {object|undefined} identité de l'utilisateur
     */
    vm.userIdentity = abxUser.getIdentity();

    /*
     * @property {object} Nouveau profil sélectionné
     */
    vm.newProfile = {};

    /*
     * @property {array} Profils globaux
     */
    vm.globalProfiles = [];

    /*
     * @property {array} Types de rôles pour les staff
     */
    vm.roleTypes = [];

    /*
     * @property {array} Elèves (d'un responsable)
     */
    vm.students = [];

    /*
     * @property {array} Etablissements
     */
    vm.schools = [];

    /*
     * @property {array} Etablissements pour rôles globaux
     */
    vm.globalSchools = [];

    /*
     * @property {array} Rôles
     */
    vm.roles = [];

    /*
     * @property {object} Rôles fermés
     */
    vm.forbiddenRoles = {};


    //*******************
    // Méthodes du scope
    //*******************

    /*
     * Renvoie les Schools selon la recherche
     * 
     * @param {string} displayName
     * @return {object} Promise 
     */
    vm.getSchoolsByDisplayName = function(displayName) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.getSchoolsByQuery", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "vm.getSchoolsByQuery"});

      if (displayName.length === 0) {
        return;
      }

      return abxSchoolModel.readByOpenedRoleAndDisplayName({displayName: displayName, role: vm.newProfile.role})
          .then(function(response) {
            vm.globalSchools = [];
            if (response[0] !== undefined) {
              for (var i = 0, length = response.length; i < length; i++) {
                vm.globalSchools.push(response[i].School);
              }
            }
          });
    };

    /*
     * Affichage des rôles non autorisés à accéder à Isa
     * 
     * @return {void} 
     */
    vm.showForbiddenRoles = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.showForbiddenRoles", tag: "methodEntry"});

      var textContent = '<p><strong>';
      abxUser.getSchools().schoolsCount === 1 ? textContent += "L'administrateur Isa de votre établissement n'a pas autorisé "
          : textContent += "Les administrateurs Isa de vos établissements n'ont pas autorisé ";
      _forbiddenRoles.rolesCount === 1 ? textContent += 'le rôle suivant '
          : textContent += 'les rôles suivants ';
      textContent += "à accéder à l'application&nbsp;:</strong></p><ul>";
      _forbiddenRoles.roles = $filter('abxCommonOrderByRoleFilter')(_forbiddenRoles.roles);
      for (var role in _forbiddenRoles.roles) {
        textContent += "<li>" + $filter('abxCommonProfileFilter')(role, {sex: abxUser.getUserSex(), withUCFirst: true}) + "<ul>";
        for (var i = 0, length = _forbiddenRoles.roles[role].length; i < length; i++) {
          textContent += "<li>" + $filter('abxCommonSchoolFilter')(_forbiddenRoles.roles[role][i]) + "</li>";
        }
        textContent += "</ul>";
      }
      textContent += "</ul>";

      abxFlashMessage.showInfo(textContent);

    };

    /*
     * Connexion
     * 
     * @return {void} 
     */
    vm.connect = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.connect", tag: "methodEntry"});
      try {

        if (vm.newProfile.roleType === "globalRoleType") {
          vm.newProfile.schoolId = vm.newProfile.globalSchoolId;
          var school = {};
          for (var i = 0, length = vm.globalSchools.length; i < length; i++) {
            if (vm.globalSchools[i].id === vm.newProfile.schoolId) {
              school = vm.globalSchools[i];
              break;
            }
          }
          abxUser.addGlobalSchoolInStructuredProfile(school);
        }

        abxUser.setSelectedProfileAndLoadAcl(vm.newProfile)
            .then(function() {

              abxFlashMessage.showSuccess('Le profil a été sélectionné.');

              // redirection
              var redirectUrl = abxUser.getAndCleanAfterSelectProfileRedirectUrl();

              (typeof redirectUrl === 'string' && redirectUrl.length > 0) ? abxRouter.navigateByUrl(redirectUrl)
                  : abxRouter.navigate(['Core.home']);
            })
            .catch(function(error) {
              if (error.hasPerformRedirect !== true) {
                abxRouter.navigateToErrorPage('profile', 'select');
              }
            });
      } catch (e) {
        abxLog.error({message: "Erreur lors de l'enregistrement du nouveau profil. Message : {{message}}", object: componentName, method: "connect",
          params: {message: e.message}, tag: "profile"});
        abxRouter.navigateToErrorPage('profile', 'select');
      }
    };

    /*
     * Annulation
     * 
     * @return {void} 
     */
    vm.cancel = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.cancel", tag: "methodEntry"});
      // redirection
      var redirectUrl = abxUser.getAndCleanAfterSelectProfileRedirectUrl();
      (typeof redirectUrl === 'string' && redirectUrl.length > 0) ? abxRouter.navigateByUrl(redirectUrl)
          : abxRouter.navigate(['Core.home']);
      abxFlashMessage.showCancel();
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

      _this.abxAppController.vm.setModule('core.profile');

      // watch de globalProfile
      $scope.$watch(function() {
        return vm.newProfile.globalProfile;
      }, function(newVal) {
        // réinitialisation de newProfile
        vm.newProfile = {globalProfile: newVal};

        if (newVal === 'responsible') {
          _setStudentsData();
          if (vm.students.length === 1) {
            vm.newProfile.studentUserId = vm.students[0].userId;
          }
          vm.newProfile.role = 'ROLE_RESP';
          // initialisation avec selectedProfile
          if (_selectedProfile.globalProfile === 'responsible' && !_initialized.student) {
            vm.newProfile.studentUserId = _selectedProfile.studentUserId;
            _initialized.student = true;
          }
        }

        if (newVal === 'student') {
          _setStudentSchoolsData();
          if (vm.schools.length === 1) {
            vm.newProfile.schoolId = vm.schools[0].userId;
          }
          vm.newProfile.role = 'ROLE_STUDENT';
          // initialisation avec selectedProfile
          if (_selectedProfile.globalProfile === 'student' && !_initialized.school) {
            vm.newProfile.schoolId = _selectedProfile.schoolId;
            _initialized.school = true;
          }
        }

        if (newVal === 'staff') {
          _setStaffRoleTypesData();
          if (vm.roleTypes.length === 1) {
            vm.newProfile.roleType = vm.roleTypes[0];
          }
          // initialisation avec selectedProfile
          if (_selectedProfile.globalProfile === 'staff' && !_initialized.roleType) {
            if (_selectedProfile.role === 'ROLE_SADMIN' || _selectedProfile.role === 'ROLE_INS') {
              vm.newProfile.roleType = 'globalRoleType';
            } else {
              vm.newProfile.roleType = 'schoolRoleType';
            }
            _initialized.roleType = true;
          }
        }
      });

      // watch de studentUserId
      $scope.$watch(function() {
        return vm.newProfile.studentUserId;
      }, function(newVal) {
        if (newVal === undefined) {
          return;
        }
        _setResponsibleStudentSchoolsData(newVal);
        vm.newProfile.schoolId = undefined;
        if (vm.schools.length === 1) {
          vm.newProfile.schoolId = vm.schools[0].schoolId;
        }
        // initialisation avec selectedProfile
        if (_selectedProfile.globalProfile === 'responsible' && _selectedProfile.studentUserId === newVal && !_initialized.school) {
          vm.newProfile.schoolId = _selectedProfile.schoolId;
          _initialized.school = true;
        }
      });

      // watch de roleType
      $scope.$watch(function() {
        return vm.newProfile.roleType;
      }, function(newVal) {
        if (newVal === undefined) {
          return;
        }
        if (newVal === 'schoolRoleType') {
          _setStaffSchoolRoleSchoolsData();
          vm.newProfile.schoolId = undefined;
          if (vm.schools.length === 1) {
            vm.newProfile.schoolId = vm.schools[0].schoolId;
          }
          // initialisation avec selectedProfile
          if (_selectedProfile.role !== undefined && _selectedProfile.role !== 'ROLE_SADMIN' && _selectedProfile.role !== 'ROLE_INS' && !_initialized.school) {
            vm.newProfile.schoolId = _selectedProfile.schoolId;
            _initialized.school = true;
          }
        }
        if (newVal === 'globalRoleType') {
          _setStaffGlobalRolesData();
          vm.newProfile.schoolId = undefined;
          vm.newProfile.role = undefined;
          if (vm.roles.length === 1) {
            vm.newProfile.role = vm.roles[0];
          }
          // initialisation avec selectedProfile
          if ((_selectedProfile.role === 'ROLE_SADMIN' || _selectedProfile.role === 'ROLE_INS') && !_initialized.role) {
            vm.newProfile.role = _selectedProfile.role;
            _initialized.role = true;
          }
        }

      });

      // watch de schoolId
      $scope.$watch(function() {
        return vm.newProfile.schoolId;
      }, function(newVal) {
        if (newVal === undefined) {
          return;
        }
        if (vm.newProfile.roleType === 'schoolRoleType') {
          _setStaffSchoolRoleSchoolRolesData(newVal);
          vm.newProfile.role = undefined;
          if (vm.roles.length === 1) {
            vm.newProfile.role = vm.roles[0];
          }
          // initialisation avec selectedProfile
          if (_selectedProfile.schoolId === newVal && !_initialized.role) {
            vm.newProfile.role = _selectedProfile.role;
            _initialized.role = true;
          }
        }
      });

      // watch de role
      $scope.$watch(function() {
        return vm.newProfile.role;
      }, function(newVal) {
        if (newVal === undefined) {
          return;
        }
        if (vm.newProfile.roleType === 'globalRoleType') {
          vm.newProfile.globalSchoolId = undefined;
          vm.globalSchools = [];
          if (vm.newProfile.role === "ROLE_SADMIN") {
            _setStaffGlobalRoleSchoolsData("ROLE_SADMIN");
          }

          // initialisation avec selectedProfile
          if (_selectedProfile.role === newVal && !_initialized.globalSchool) {
            var schools = abxUser.getAllSchools(),
                school = {};
            for (var i = 0, length = schools.length; i < length; i++) {
              if (schools[i].id === _selectedProfile.schoolId) {
                school = schools[i];
                break;
              }
            }

            if (school.id !== undefined) {
              abxUser.addGlobalSchoolInStructuredProfile(school);
              if (vm.newProfile.role === "ROLE_INS") {
                _setStaffGlobalRoleSchoolsData("ROLE_INS", _selectedProfile.schoolId);
              }
              vm.newProfile.globalSchoolId = _selectedProfile.schoolId;
            }

            _initialized.globalSchool = true;
          }
        }
      });

      // selectedProfile
      var selectedProfile = abxUser.getSelectedProfile();
      // récupération du profile renvoyé par le backend
      if (selectedProfile === undefined) {
        var lastBackendSelectProfile = abxUser.getLastBackendSelectedProfile();
        if (lastBackendSelectProfile !== undefined && lastBackendSelectProfile.globalProfile !== undefined) {
          abxLog.debug({message: "Affectation du lastBackendSelectProfile.", object: componentName, method: "$routerOnActivate", tag: "user"});
          selectedProfile = lastBackendSelectProfile;
        } else {
          abxLog.debug({message: "Pas d'affectation du lastBackendSelectProfile.", object: componentName, method: "$routerOnActivate", tag: "user"});
          selectedProfile = {};
        }
      } else {
        vm.hasAlreadySelectedProfile = true;
      }
      _selectedProfile = selectedProfile;

      // affectation du globalProfile par défaut
      // les autres valeurs sont affectées dans les watch (pour éviter les problèmes de watch imbriqués)
      vm.globalProfiles = abxUser.getGlobalProfiles();

      if (vm.globalProfiles.length === 0) {
        abxRouter.navigateToErrorPage('auth', 'allRolesClosed');
        return;
      }

      if (vm.globalProfiles.length === 1) {
        vm.newProfile.globalProfile = vm.globalProfiles[0];
      } else {
        vm.newProfile.globalProfile = selectedProfile.globalProfile;
      }

      _forbiddenRoles = vm.forbiddenRoles = abxUser.getForbiddenRoles();

      vm.canDisplayView = true;
    };
  }

// fin IIFE
})();