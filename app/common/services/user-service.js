/** 
 * Service de gestion des données de l'utilisateur connecté
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: user-service.js 723 2016-04-01 09:52:51Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.userService';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$q',
        '$rootScope',
        'abx.common.logService',
        'abx.common.cookieService',
        'abx.common.routerService',
        'abx.common.cacheService',
        'abx.common.aclService',
        function(
            $q,
            $rootScope,
            abxLog,
            abxCookie,
            abxRouter,
            abxCache,
            abxAcl
            ) {

          abxLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} profils de l'user
           */
          var _structuredProfiles = {};

          /*
           * @property {array} profils globaux de l'user
           */
          var _globalProfiles = {};

          /*
           * @property {object} Rôles de l'user interdits par établissement
           */
          var _forbiddenRoles = {};

          /*
           * @property {boolean} l'user a-t-il un seul profil possible ?
           */
          var _hasUniqueProfile;

          /*
           * @property {object} Dernier profil sélectionné par l'user sur le serveur back
           */
          var _lastBackendSelectedProfile = {};

          /*
           * @property {object} Profil actuel de l'user
           */
          var _selectedProfile;

          /*
           * @property {object} Profil actuel pour le serveur back
           */
          var _backendSelectedProfile;

          /*
           * @property {string} Url de redirection après le choix d'un profil
           */
          var _afterSelectProfileRedirectUrl = '';


          //********************
          // Méthodes privées
          //********************


          /*
           * Formate les profiles
           * 
           * @param {object} userDetails
           * @param {object} deferred
           * @return {void} 
           */
          var _formatProfiles = function(userDetails, deferred) {
            abxLog.trace({message: "Entrée méthode", object: objectName, method: "_formatProfiles", tag: "methodEntry"});
            abxLog.debug({message: "Paramètres méthode : {{params}}",
              params: {params: arguments}, tag: "params", object: objectName, method: "_formatProfiles"});

            try {
              // génération de l'objet profiles
              var structuredProfiles = {},
                  globalProfiles = [],
                  rolesState = {};

              for (var role in userDetails.rolesState) {
                rolesState[role] = {};
                for (var i = 0, length = userDetails.rolesState[role].length; i < length; i++) {
                  rolesState[role]['schoolId_' + userDetails.rolesState[role][i].schoolId] = userDetails.rolesState[role][i].granted;
                }
              }

              // affectation de l'identité
              structuredProfiles.identity = {
                userId: userDetails.userId,
                lastName: userDetails.lastName,
                firstName: userDetails.firstName,
                sex: userDetails.sex
              };


              // profils
              structuredProfiles.profiles = {
                globalProfilesCount: 0
              };

              // student
              if (userDetails.profiles.student[0] !== undefined) {
                var schoolIds = [];

                for (var i = 0, length = userDetails.profiles.student.length; i < length; i++) {
                  if (rolesState.ROLE_STUDENT['schoolId_' + userDetails.profiles.student[i]]) {
                    schoolIds.push(userDetails.profiles.student[i]);
                  }
                }

                if (schoolIds.length > 0) {
                  globalProfiles.push('student');
                  structuredProfiles.profiles.globalProfilesCount++;
                  structuredProfiles.profiles.student = {
                    schoolIds: schoolIds,
                    schoolsCount: schoolIds.length
                  };
                }
              }

              // responsible
              if (userDetails.profiles.responsible[0] !== undefined) {
                var students = [],
                    schoolIds = [];
                for (var i = 0, length = userDetails.profiles.responsible.length; i < length; i++) {
                  schoolIds = [];
                  for (var j = 0, length2 = userDetails.profiles.responsible[i].schoolIds.length; j < length2; j++) {
                    if (rolesState.ROLE_RESP['schoolId_' + userDetails.profiles.responsible[i].schoolIds[j]]) {
                      schoolIds.push(userDetails.profiles.responsible[i].schoolIds[j]);
                    }
                  }
                  if (schoolIds.length > 0) {
                    students.push(
                        {
                          userId: userDetails.profiles.responsible[i].userId,
                          lastName: userDetails.profiles.responsible[i].lastName,
                          firstName: userDetails.profiles.responsible[i].firstName,
                          sex: userDetails.profiles.responsible[i].sex,
                          schoolIds: schoolIds,
                          schoolsCount: schoolIds.length
                        }
                    );
                  }
                }

                if (students.length > 0) {
                  globalProfiles.push('responsible');
                  structuredProfiles.profiles.globalProfilesCount++;
                  structuredProfiles.profiles.responsible = {
                    students: {},
                    studentsCount: students.length
                  };

                  for (var i = 0, length = students.length; i < length; i++) {
                    structuredProfiles.profiles.responsible.students['studentUserId_' + students[i].userId] = students[i];
                  }
                }
              }

              // staff
              if (userDetails.profiles.staff.schools[0] !== undefined || userDetails.profiles.staff.globalRoles[0] !== undefined) {
                var isStaff = false;
                if (userDetails.profiles.staff.globalRoles[0] !== undefined) {
                  isStaff = true;
                  globalProfiles.push('staff');
                  structuredProfiles.profiles.globalProfilesCount++;
                  structuredProfiles.profiles.staff = {
                    schoolRoles: {},
                    schoolRolesCount: 0,
                    globalRoles: userDetails.profiles.staff.globalRoles,
                    globalRolesCount: userDetails.profiles.staff.globalRoles.length
                  };
                }

                if (userDetails.profiles.staff.schools[0] !== undefined) {
                  var schoolRoles = {},
                      schoolRolesCount = 0,
                      allowedRoles = [];
                  for (var i = 0, length = userDetails.profiles.staff.schools.length; i < length; i++) {
                    allowedRoles = [];
                    for (var j = 0, length2 = userDetails.profiles.staff.schools[i].roles.length; j < length2; j++) {
                      if (rolesState[userDetails.profiles.staff.schools[i].roles[j]]['schoolId_' + userDetails.profiles.staff.schools[i].schoolId]) {
                        allowedRoles.push(userDetails.profiles.staff.schools[i].roles[j]);
                      }
                    }

                    if (allowedRoles.length > 0) {
                      schoolRolesCount++;
                      schoolRoles['schoolId_' + userDetails.profiles.staff.schools[i].schoolId] = {
                        schoolId: userDetails.profiles.staff.schools[i].schoolId,
                        roles: allowedRoles,
                        rolesCount: allowedRoles.length
                      };
                    }
                  }

                  if (schoolRolesCount > 0) {
                    if (!isStaff) {
                      globalProfiles.push('staff');
                      structuredProfiles.profiles.globalProfilesCount++;
                      structuredProfiles.profiles.staff = {
                        schoolRoles: {},
                        schoolRolesCount: 0,
                        globalRoles: userDetails.profiles.staff.globalRoles,
                        globalRolesCount: userDetails.profiles.staff.globalRoles.length
                      };
                    }
                    structuredProfiles.profiles.staff.schoolRoles = schoolRoles;
                    structuredProfiles.profiles.staff.schoolRolesCount = schoolRolesCount;
                  }
                }
              }

              // schools
              structuredProfiles.schools = {
                schools: {},
                schoolsCount: userDetails.schools.length
              };
              for (var i = 0; i < structuredProfiles.schools.schoolsCount; i++) {
                structuredProfiles.schools.schools['schoolId_' + userDetails.schools[i].School.id] = userDetails.schools[i].School;
                structuredProfiles.schools.schools['schoolId_' + userDetails.schools[i].School.id].schoolId = userDetails.schools[i].School.id;
              }

              // forbiddenRoles
              var forbiddenRoles = {
                roles: {},
                rolesCount: 0
              };
              for (var role in rolesState) {
                for (var school in rolesState[role]) {
                  if (!rolesState[role][school]) {
                    if (forbiddenRoles.roles[role] === undefined) {
                      forbiddenRoles.roles[role] = [];
                      forbiddenRoles.rolesCount++;
                    }
                    forbiddenRoles.roles[role].push(structuredProfiles.schools.schools[school]);
                  }
                }
              }

              // récupération du dernier profil sélectionné depuis le back
              if (typeof userDetails.frontEndLastSelectedProfile === 'object' && userDetails.frontEndLastSelectedProfile !== null
                  && typeof userDetails.frontEndLastSelectedProfile.FrontEndLastSelectedProfile === 'object') {
                try {
                  var lastBackendSelectedProfile = {
                    role: userDetails.frontEndLastSelectedProfile.FrontEndLastSelectedProfile.lastSelectedRole,
                    schoolId: userDetails.frontEndLastSelectedProfile.FrontEndLastSelectedProfile.lastSelectedSchoolId
                  };

                  if (lastBackendSelectedProfile.role === 'ROLE_RESP') {
                    lastBackendSelectedProfile.studentUserId = userDetails.frontEndLastSelectedProfile.FrontEndLastSelectedProfile.lastSelectedStudentId;
                    lastBackendSelectedProfile.globalProfile = 'responsible';
                  } else if (lastBackendSelectedProfile.role === 'ROLE_STUDENT') {
                    lastBackendSelectedProfile.globalProfile = 'student';
                  } else {
                    lastBackendSelectedProfile.globalProfile = 'staff';
                  }
                  _lastBackendSelectedProfile = lastBackendSelectedProfile;

                } catch (e) {
                  _lastBackendSelectedProfile = {};
                }
              }

              structuredProfiles.globalSchools = {
                schools: {},
                schoolsCount: 0
              };
              if (_lastBackendSelectedProfile.schoolId !== undefined
                  && (_lastBackendSelectedProfile.role === "ROLE_SADMIN" || _lastBackendSelectedProfile.role === "ROLE_INS")) {
                structuredProfiles.globalSchools.schools['schoolId_' + _lastBackendSelectedProfile.schoolId]
                    = structuredProfiles.schools.schools['schoolId_' + _lastBackendSelectedProfile.schoolId];
              }

              abxLog.debug({message: "Rôles fermés : {{forbiddenRoles}}",
                params: {forbiddenRoles: forbiddenRoles}, tag: "userDetails", object: objectName, method: "_formatProfiles"});
              _forbiddenRoles = forbiddenRoles;

              abxLog.info({message: "StructuredProfiles généré : {{structuredProfiles}}", params: {structuredProfiles: structuredProfiles},
                object: objectName, method: "_formatProfiles", tag: "userDetails"});

              // affectation des valeurs
              _structuredProfiles = structuredProfiles;
              _globalProfiles = globalProfiles;

              abxLog.info({message: "LastSelectedProfile généré : {{_lastSelectedProfile}}", params: {_lastSelectedProfile: _lastBackendSelectedProfile},
                object: objectName, method: "_formatProfiles", tag: "userDetails"});

              // résolution de la promesse
              deferred.resolve(true);

            } catch (e) {
              abxLog.error({message: "Erreur de données dans l'userDetails : {{exceptionMessage}}", params: {exceptionMessage: e.message},
                tag: "userDetails", object: objectName, method: "_formatProfiles"});
              deferred.reject(e.message);

              // relance l'exception pour être catchée plus haut
              throw new Error(e.message);
            }
          };


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Renvoie si les profils ont été valorisés
             * 
             * @return {boolean} 
             */
            hasProfiles: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "hasProfiles", tag: "methodEntry"});

              var hasProfiles = (_structuredProfiles.identity !== undefined);

              abxLog.debug({message: "HasProfile = {{hasProfiles}}",
                params: {hasProfiles: hasProfiles}, object: objectName, method: "hasProfiles", tag: "user"});

              return hasProfiles;
            },
            /*
             * Affecte le userDetails
             * 
             * @param {object} userDetails
             * @return {object} promise
             */
            setUserDetails: function(userDetails) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "setUserDetails", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "setUserDetails"});

              var deferred = $q.defer();
              _formatProfiles(userDetails, deferred);

              return deferred.promise;
            },
            /*
             * Renvoie et efface l'url de redirection
             * 
             * @return {string} 
             */
            getAndCleanAfterSelectProfileRedirectUrl: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getAndCleanAfterSelectProfileRedirectUrl", tag: "methodEntry"});
              var redirectUrl = _afterSelectProfileRedirectUrl;
              _afterSelectProfileRedirectUrl = undefined;
              return redirectUrl;
            },
            /*
             * Renvoie l'identité de l'user
             * 
             * @return {object|undefined} 
             */
            getIdentity: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getIdentity", tag: "methodEntry"});
              return angular.copy(_structuredProfiles.identity);
            },
            /*
             * Renvoie le sexe de l'user
             * 
             * @return {string|undefined} 
             */
            getUserSex: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getUserSex", tag: "methodEntry"});
              return (_structuredProfiles.identity === undefined || _structuredProfiles.identity.sex === undefined)
                  ? undefined : _structuredProfiles.identity.sex;
            },
            /*
             * Renvoie les schools
             * 
             * @return {object} 
             */
            getSchools: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSchools", tag: "methodEntry"});
              return angular.copy(_structuredProfiles.schools);
            },
            /*
             * Renvoie les rôles fermés
             * 
             * @return {object} 
             */
            getForbiddenRoles: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getForbiddenRoles", tag: "methodEntry"});
              return angular.copy(_forbiddenRoles);
            },
            /*
             * Renvoie le rôle sélectionné par l'user
             * 
             * @return {string|undefined} 
             */
            getSelectedRole: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSelectedRole", tag: "methodEntry"});
              if (_selectedProfile === undefined) {
                return undefined;
              }
              return _selectedProfile.role;
            },
            /*
             * Renvoie l'établissement sélectionné par l'user
             * 
             * @return {object|undefined} 
             */
            getSelectedSchool: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSelectedSchool", tag: "methodEntry"});
              if (_selectedProfile === undefined) {
                return undefined;
              }
              return angular.copy(_selectedProfile.school);
            },
            /*
             * Renvoie l'élève sélectionné par l'user (s'il est responsible)
             * 
             * @return {object|undefined} 
             */
            getSelectedStudent: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSelectedStudent", tag: "methodEntry"});
              if (_selectedProfile === undefined || _selectedProfile.student === undefined) {
                return undefined;
              }
              return angular.copy(_selectedProfile.student);
            },
            /*
             * Renvoie les profils globaux de l'user
             * 
             * @return {array} 
             */
            getGlobalProfiles: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getGlobalProfiles", tag: "methodEntry"});
              return angular.copy(_globalProfiles);
            },
            /*
             * Renvoie les students dont l'user est responsable
             * 
             * @return {array} 
             */
            getResponsibleStudents: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getResponsibleStudents", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getResponsibleStudents", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.responsible === undefined) {
                abxLog.error({message: "L'user n'est pas responsible.", object: objectName, method: "getResponsibleStudents", tag: "user"});
                throw new Error("L'user n'est pas responsible.");
              }
              var students = [],
                  i = 0;
              for (var key in _structuredProfiles.profiles.responsible.students) {
                students[i] = _structuredProfiles.profiles.responsible.students[key];
                i++;
              }
              return students;
            },
            /*
             * Renvoie les établissements d'un student dont l'user est responsable
             * 
             * @param {integer} studentUserId
             * @return {array} 
             */
            getResponsibleStudentSchools: function(studentUserId) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getResponsibleStudentSchools", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getResponsibleStudentSchools"});

              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getResponsibleStudentSchools", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.responsible === undefined) {
                abxLog.error({message: "L'user n'est pas responsible.", object: objectName, method: "getResponsibleStudentSchools", tag: "user"});
                throw new Error("L'user n'est pas responsible.");
              }
              if (_structuredProfiles.profiles.responsible.students['studentUserId_' + studentUserId] === undefined) {
                abxLog.error({message: "L'user n'est pas responsible du studentUserId={{studentUserId}}.",
                  params: {studentUserId: studentUserId},
                  object: objectName, method: "getResponsibleStudentSchools", tag: "user"});
                throw new Error("L'user n'est pas responsible du studentUserId.");
              }

              var response = [];
              var schoolIds = _structuredProfiles.profiles.responsible.students['studentUserId_' + studentUserId].schoolIds;
              for (var i = 0; i < _structuredProfiles.profiles.responsible.students['studentUserId_' + studentUserId].schoolsCount; i++) {
                response.push(_structuredProfiles.schools.schools['schoolId_' + schoolIds[i]]);
              }
              return response;
            },
            /*
             * Renvoie les établissements d'un student
             * 
             * @return {array} 
             */
            getStudentSchools: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getStudentSchools", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getStudentSchools", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.student === undefined) {
                abxLog.error({message: "L'user n'est pas student.", object: objectName, method: "getStudentSchools", tag: "user"});
                throw new Error("L'user n'est pas student.");
              }

              var response = [];
              var schoolIds = _structuredProfiles.profiles.student.schoolIds;
              for (var i = 0; i < _structuredProfiles.profiles.student.schoolsCount; i++) {
                response.push(_structuredProfiles.schools.schools['schoolId_' + schoolIds[i]]);
              }

              return response;
            },
            /*
             * Renvoie les types de rôles du personnel
             * 
             * @return {array} 
             */
            getStaffRoleTypes: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getStaffRoleTypes", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getStaffRoleTypes", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.staff === undefined) {
                abxLog.error({message: "L'user n'est pas staff.", object: objectName, method: "getStaffRoleTypes", tag: "user"});
                throw new Error("L'user n'est pas staff.");
              }

              var roleTypes = [];
              if (_structuredProfiles.profiles.staff.schoolRolesCount > 0) {
                roleTypes.push('schoolRoleType');
              }
              if (_structuredProfiles.profiles.staff.globalRolesCount > 0) {
                roleTypes.push('globalRoleType');
              }
              return roleTypes;
            },
            /*
             * Renvoie les globalRoles du personnel
             * 
             * @return {array} 
             */
            getStaffGlobalRoles: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getStaffGlobalRoles", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getStaffGlobalRoles", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.staff === undefined) {
                abxLog.error({message: "L'user n'est pas staff.", object: objectName, method: "getStaffGlobalRoles", tag: "user"});
                throw new Error("L'user n'est pas staff.");
              }

              return angular.copy(_structuredProfiles.profiles.staff.globalRoles);
            },
            /*
             * Renvoie les établissements du personnel
             * 
             * @return {array} 
             */
            getStaffSchools: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getStaffSchools", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getStaffSchools", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.staff === undefined) {
                abxLog.error({message: "L'user n'est pas staff.", object: objectName, method: "getStaffSchools", tag: "user"});
                throw new Error("L'user n'est pas staff.");
              }
              var response = [];
              for (var key in _structuredProfiles.profiles.staff.schoolRoles) {
                response.push(_structuredProfiles.schools.schools[key]);
              }

              return response;
            },
            /*
             * Renvoie tous les établissements des rôles globaux
             * 
             * @return {array} 
             */
            getGlobalSchools: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getGlobalSchools", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getGlobalSchools", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              var response = [];
              for (var key in _structuredProfiles.globalSchools.schools) {
                response.push(_structuredProfiles.globalSchools.schools[key]);
              }
              return response;
            },
            /*
             * Renvoie tous les établissements
             * 
             * @return {array} 
             */
            getAllSchools: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getAllSchools", tag: "methodEntry"});
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getAllSchools", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              var response = [],
                  keys = [];
              for (var key in _structuredProfiles.schools.schools) {
                response.push(_structuredProfiles.schools.schools[key]);
                keys.push(key);
              }
              for (var key in _structuredProfiles.globalSchools.schools) {
                if (keys.indexOf(key) !== -1) {
                  response.push(_structuredProfiles.globalSchools.schools[key]);
                }
              }
              return response;
            },
            /*
             * Ajoute un établissement global dans le structuredProfile
             * 
             * @param {object} school
             * @return {void} 
             */
            addGlobalSchoolInStructuredProfile: function(school) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "addGlobalSchoolInStructuredProfile", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "addGlobalSchoolInStructuredProfile"});

              school.schoolId = school.id;
              if (_structuredProfiles.globalSchools.schools['schoolId_' + school.id] === undefined) {
                _structuredProfiles.globalSchools.schools['schoolId_' + school.id] = school;
                _structuredProfiles.globalSchools.schoolsCount++;
              }
              if (_structuredProfiles.schools.schools['schoolId_' + school.id] === undefined) {
                _structuredProfiles.schools.schools['schoolId_' + school.id] = school;
                _structuredProfiles.schools.schoolsCount++;
              }
            },
            /*
             * Renvoie les rôles pour établissement du personnel
             * 
             * @param {integer} schoolId
             * @return {array} 
             */
            getStaffSchoolRoles: function(schoolId) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getStaffSchoolRoles", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "getStaffSchoolRoles"});

              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getStaffSchoolRoles", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              if (_structuredProfiles.profiles.staff === undefined) {
                abxLog.error({message: "L'user n'est pas staff.", object: objectName, method: "getStaffSchoolRoles", tag: "user"});
                throw new Error("L'user n'est pas staff.");
              }
              if (_structuredProfiles.profiles.staff.schoolRoles['schoolId_' + schoolId] === undefined) {
                abxLog.error({message: "L'user n'est pas staff dans l'établissement {{schoolId}}.",
                  params: {schoolId: schoolId},
                  object: objectName, method: "getStaffSchoolRoles", tag: "user"});
                throw new Error("L'user n'est pas staff dans l'établissement.");
              }
              return angular.copy(_structuredProfiles.profiles.staff.schoolRoles['schoolId_' + schoolId].roles);
            },
            /*
             * Affecte le selectedProfile depuis le cookie
             * 
             * @return {object} Promise
             */
            setSelectedProfileFromCookie: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "setSelectedProfileFromCookie", tag: "methodEntry"});

              var deferred = $q.defer();

              $q.when()
                  .then(function() {
                    var selectedProfile = abxCookie.get('selectedProfile');
                    // pas de selectedProfile dans le cookie
                    if (selectedProfile === undefined) {
                      abxLog.debug({message: "Pas de selectedProfile disponible.", object: objectName, method: "setSelectedProfileFromCookie", tag: "user"});
                      return $q.resolve(undefined);
                    }

                    abxLog.debug({message: "Renvoi du selectedProfile depuis le cookie : {{selectedProfile}}",
                      params: {selectedProfile: selectedProfile}, object: objectName, method: "setSelectedProfileFromCookie", tag: "user"});
                    return _factory.setSelectedProfileAndLoadAcl(selectedProfile);
                  })
                  .then(function(selectedProfile) {
                    deferred.resolve(angular.copy(selectedProfile));
                  })
                  .catch(function(error) {
                    deferred.reject(error);
                  });

              return deferred.promise;
            },
            /*
             * Renvoie le profil de connexion
             * 
             * @return {undefined|object} 
             */
            getSelectedProfile: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSelectedProfile", tag: "methodEntry"});
              abxLog.debug({message: "Renvoi du selectedProfile depuis la propriété : {{selectedProfile}}",
                params: {selectedProfile: _selectedProfile}, object: objectName, method: "getSelectedProfile", tag: "user"});
              return angular.copy(_selectedProfile);
            },
            /*
             * Renvoie le schoolId de connexion
             * 
             * @return {undefined|object} 
             */
            getSelectedSchoolId: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getSelectedSchoolId", tag: "methodEntry"});
              return _selectedProfile.schoolId;
            },
            /*
             * Renvoie le profil de connexion pour le back
             * 
             * @return {object|undefined} backendSelectedProfile
             */
            getBackendSelectedProfile: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getBackendSelectedProfile", tag: "methodEntry"});
              // récupération depuis la propriété
              if (_backendSelectedProfile !== undefined) {
                abxLog.trace({message: "Renvoi du backendSelectedProfile depuis la propriété.", object: objectName, method: "getBackendSelectedProfile", tag: "user"});
                return angular.copy(_backendSelectedProfile);
              }

              // renvoi depuis le cookie
              var backendSelectedProfile = abxCookie.get('backendSelectedProfile');
              abxLog.debug({message: "Renvoi du backendSelectedProfile depuis le cookie : {{backendSelectedProfile}}",
                params: {backendSelectedProfile: backendSelectedProfile}, object: objectName, method: "getBackendSelectedProfile", tag: "user"});
              return backendSelectedProfile;
            },
            /*
             * Renvoie le dernier profil enregistré par le back
             * 
             * @return {object} 
             */
            getLastBackendSelectedProfile: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getLastBackendSelectedProfile", tag: "methodEntry"});
              abxLog.trace({message: "Renvoi du lastBackendSelectedProfile : {{_lastBackendSelectedProfile}}",
                params: {_lastBackendSelectedProfile: _lastBackendSelectedProfile}, object: objectName, method: "getBackendSelectedProfile", tag: "user"});
              return angular.copy(_lastBackendSelectedProfile);
            },
            /*
             * Affecte le profil de connexion
             * 
             * @param {object} profile
             * @return {object} Promise
             */
            setSelectedProfileAndLoadAcl: function(profile) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "setSelectedProfileAndLoadAcl", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "setSelectedProfileAndLoadAcl"});

              var deferred = $q.defer(),
                  oldSelectedProfile = _selectedProfile,
                  oldBackendSelectedProfile = _backendSelectedProfile;

              $q.when()
                  .then(function() {
                    // affectation du profile
                    try {
                      var newProfile = {
                        schoolId: profile.schoolId,
                        school: _structuredProfiles.schools.schools['schoolId_' + profile.schoolId],
                        role: profile.role
                      },
                      newBackendProfile = {
                        schoolId: profile.schoolId,
                        role: profile.role
                      };
                      if (profile.globalProfile === 'responsible') {
                        newProfile.student = _structuredProfiles.profiles.responsible.students['studentUserId_' + profile.studentUserId];
                        newProfile.studentUserId = profile.studentUserId;
                        newBackendProfile.studentUserId = profile.studentUserId;
                      }
                      newProfile.globalProfile = profile.globalProfile;
                      abxLog.info({message: "Affectation du selectedProfile : {{newProfile}}", params: {newProfile: newProfile},
                        tag: "profile", object: objectName, method: "setSelectedProfileAndLoadAcl"});
                      _selectedProfile = newProfile;
                      abxCookie.put('selectedProfile', newProfile);
                      _backendSelectedProfile = newBackendProfile;
                      abxCookie.put('backendSelectedProfile', newBackendProfile);
                      // réinitialisation du cache
                      abxCache.removeAll();
                      return $q.when(_selectedProfile);
                    } catch (e) {
                      abxLog.error({message: "Erreur dans le format du profile : {{exceptionMessage}}", params: {exceptionMessage: e.message},
                        tag: "profile", object: objectName, method: "setSelectedProfileAndLoadAcl"});
                      // rejette la promesse
                      return $q.reject(e.message);
                    }
                  })
                  .then(function() {
                    // chargement des ACL
                    return abxAcl.loadAcl();
                  })
                  .then(function() {

                    // émission de l'événement
                    $rootScope.$broadcast(objectName + ':selectedProfileUpdated', angular.copy(_selectedProfile));

                    deferred.resolve(angular.copy(_selectedProfile));
                  })
                  .catch(function(error) {
                    // réinitialisation
                    _selectedProfile = oldSelectedProfile;
                    abxCookie.put('selectedProfile', oldSelectedProfile);
                    _backendSelectedProfile = oldBackendSelectedProfile;
                    abxCookie.put('backendSelectedProfile', oldBackendSelectedProfile);

                    deferred.reject(error);
                  });
              return deferred.promise;
            },
            /*
             * Permet la sélection du profil de connexion
             * 
             * @param {string} redirectUrl url de redirection après le choix du profil
             * @return {object} Promise resolve si un unique profile existe, reject sinon
             */
            selectProfile: function(redirectUrl) {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "selectProfile", tag: "methodEntry"});
              abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "selectProfile"});

              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "selectProfile", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }

              // détermination si un seul profile est possible
              var deferred = $q.defer();

              _factory.getUniqueProfile()
                  .then(function(uniqueProfile) {
                    // un uniqueProfile a été trouvé
                    if (uniqueProfile !== false) {
                      abxLog.debug({message: "UniqueProfile trouvé : {{uniqueProfile}}", params: {uniqueProfile: uniqueProfile},
                        object: objectName, method: "selectProfile", tag: "user"});

                      // affectation du profile + ACL
                      _factory.setSelectedProfileAndLoadAcl(uniqueProfile)
                          .then(function() {
                            deferred.resolve(uniqueProfile);
                          })
                          .catch(function(error) {
                            deferred.reject(error);
                          });

                    } else {

                      // pas d'unique profile : redirection
                      abxLog.debug({message: "Redirection vers le choix du profile.", object: objectName, method: "selectProfile", tag: "profile"});

                      _afterSelectProfileRedirectUrl = redirectUrl;
                      abxRouter.navigate(['Core.profile']);
                      deferred.reject("Redirection vers le choix du profile.");
                    }
                  });

              return deferred.promise;
            },
            /*
             * Renvoie le profil unique de connexion s'il existe (s'il n'y a aucun choix à faire par l'user)
             * 
             * @return {object} promise 
             */
            getUniqueProfile: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "getUniqueProfile", tag: "methodEntry"});

              _hasUniqueProfile = false;
              if (!_factory.hasProfiles()) {
                abxLog.error({message: "Les profiles ne sont pas valorisés.", object: objectName, method: "getUniqueProfile", tag: "user"});
                throw new Error("Les profiles ne sont pas valorisés.");
              }
              var deferred = $q.defer(),
                  promise = deferred.promise;

              // globalProfiles
              if (_structuredProfiles.profiles.globalProfilesCount !== 1) {
                deferred.resolve(false);
                return promise;
              }

              var uniqueProfile = {
                globalProfile: _globalProfiles[0]
              };

              // student
              if (uniqueProfile.globalProfile === 'student') {
                uniqueProfile.role = 'ROLE_STUDENT';
                if (_structuredProfiles.profiles.student.schoolsCount === 1) {
                  uniqueProfile.schoolId = _structuredProfiles.profiles.student.schoolIds[0];
                  _hasUniqueProfile = true;
                  deferred.resolve(uniqueProfile);
                  return promise;
                }
                deferred.resolve(false);
                return promise;
              }

              // responsible
              if (uniqueProfile.globalProfile === 'responsible') {
                uniqueProfile.role = 'ROLE_RESP';
                if (_structuredProfiles.profiles.responsible.studentsCount === 1) {
                  for (var key in _structuredProfiles.profiles.responsible.students) {
                    if (_structuredProfiles.profiles.responsible.students[key].schoolsCount === 1) {
                      uniqueProfile.studentUserId = _structuredProfiles.profiles.responsible.students[key].userId;
                      uniqueProfile.schoolId = _structuredProfiles.profiles.responsible.students[key].schoolIds[0];

                      _hasUniqueProfile = true;
                      deferred.resolve(uniqueProfile);
                      return promise;
                    }
                  }
                }
                deferred.resolve(false);
                return promise;
              }

              // staff
              // si a un globalRole, doit choisir l'établissement parmi l'ensemble des établissements
              if (_structuredProfiles.profiles.staff.schoolRolesCount > 1 || _structuredProfiles.profiles.staff.globalRolesCount > 0) {
                deferred.resolve(false);
                return promise;
              }
              for (var key in _structuredProfiles.profiles.staff.schoolRoles) {
                if (_structuredProfiles.profiles.staff.schoolRoles[key].rolesCount === 1) {
                  uniqueProfile.role = _structuredProfiles.profiles.staff.schoolRoles[key].roles[0];
                  uniqueProfile.schoolId = _structuredProfiles.profiles.staff.schoolRoles[key].schoolId;

                  _hasUniqueProfile = true;
                  deferred.resolve(uniqueProfile);
                  return promise;
                }
              }

              deferred.resolve(false);
              return promise;
            },
            /*
             * Renvoie si l'user un un seul profil possible
             * 
             * @return {boolean} 
             */
            getHasUniqueProfile: function() {
              abxLog.trace({message: "Entrée méthode", object: objectName, method: "hasUniqueProfile", tag: "methodEntry"});
              return _hasUniqueProfile;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();