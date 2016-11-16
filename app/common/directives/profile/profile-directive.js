/** 
 * Component abx.components.core.profile.profileDirective
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: home-component.js 190 2015-10-16 15:22:34Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxProfile';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .config(function($mdIconProvider) {
        $mdIconProvider.iconSet('avatars', 'assets/svg/avatars.svg');
      })
      .directive(directiveName,
          ['abx.common.userService',
            'abx.common.logService',
            Directive]);

  function Directive(
      abxUser,
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      replace: false,
      scope: {},
      templateUrl: 'app/common/directives/profile/profile-directive.html',
      compile: function(tElement, tAttrs) {

        return {
          pre: function(scope, iElement, iAttrs, ctrls, transcludeFn) {

          },
          post: function(scope, iElement, iAttrs, ctrls, transcludeFn) {
            // identité de l'utilisateur
            scope.userIdentity = abxUser.getIdentity();

            // rôle actuel de l'utilisateur
            scope.userRole = abxUser.getSelectedRole();

            // établissement actuel de l'utilisateur
            scope.userSchool = abxUser.getSelectedSchool();

            // élève actuel de l'utilisateur
            scope.userStudent = abxUser.getSelectedStudent();

            // avatar de l'utilisateur en fonction de son rôle
            scope.avatar = getAvatarFromRole(scope.userRole, scope.userIdentity.sex);

            // Mis en place d'un « listener » pour mettre à jour les données utilisateur lors d'un changement de profil
            scope.$on('abx.common.userService:selectedProfileUpdated', function(event, args) {
              scope.userRole = args.role;
              scope.userSchool = args.school;
              scope.userStudent = args.student;
              scope.avatar = getAvatarFromRole(scope.userRole, scope.userIdentity.sex);
            });
          }
        };
      }
    };

    function getAvatarFromRole(role, sex) {
      var avatars = {
        'default': 10,
        'ROLE_STUDENT': {f: 13, m: 14},
        'ROLE_RESP': {f: 6, m: 1},
        'ROLE_TEACHER': {f: 15, m: 16},
        'ROLE_INS': {f: 7, m: 8},
        'ROLE_ADMIN': {f: 9, m: 5},
        'ROLE_SADMIN': {f: 9, m: 5}
      };

      return avatars.hasOwnProperty(role) ? avatars[role][sex] : avatars.default;
    }
  }

// fin IIFE
})();