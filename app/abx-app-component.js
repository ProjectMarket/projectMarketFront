/** 
 * Composant principal
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-app-component.js 724 2016-04-01 14:57:55Z zvergne $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var componentName = 'abx.appComponent';

    angular
            .module('abxApp')
            .component(componentName, {
                $routeConfig: [
                    {path: '/', component: 'abx.core.homeComponent', name: 'Core.home'},
                    {path: '/home', component: 'abx.core.homeComponent', name: 'Core.home'},
                    {path: '/index', component: 'abx.core.indexComponent', name: 'Core.index'},
                    {path: '/login-result/:result/:relayPath', component: 'abx.core.loginResultComponent', name: 'Core.loginResult'},
                    {path: '/profile', component: 'abx.core.profileComponent', name: 'Core.profile'},
                    {path: '/login/:relayPath', component: 'abx.core.loginComponent', name: 'Core.login'},
                    {path: '/logout', component: 'abx.core.logoutComponent', name: 'Core.logout'},
                    {path: '/error/:type/:code', component: 'abx.core.errorComponent', name: 'Core.error'},
                    {path: '/admin/settings/home', component: 'abx.admin.settings.homeComponent', name: 'Admin.settings.home'},
                    {path: '/admin/settings/school-year/:action/:schoolYearId', component: 'abx.admin.settings.schoolYearComponent', name: 'Admin.settings.schoolYear'},
                    {path: '/admin/settings/period-type/:action/:periodTypeId', component: 'abx.admin.settings.periodTypeComponent', name: 'Admin.settings.periodType'},
                    {path: '/admin/settings/timetable-container/:action/:timetableContainerId', component: 'abx.admin.settings.timetableContainerComponent', name: 'Admin.settings.timetableContainer'},
                    {path: '/admin/permissions', component: 'abx.admin.permissionsComponent', name: 'Admin.permissions'},
                    {path: '/help', component: 'abx.core.helpComponent', name: 'Core.help'},
                    {path: '/admin/roles', component: 'abx.admin.userSchoolRolesComponent', name: 'Admin.userSchoolRoles'},
                    {path: '/admin/settings/alternating-weeks/:action/:alternatingWeeksId', component: 'abx.admin.settings.alternatingWeeksComponent', name: 'Admin.settings.alternatingWeeks'},
                    {path: '/core/404', component: 'abx.core.404Component', name: 'Core.404'},
                    {path: '/admin/settings/year-week/:alternatingWeeksId', component: 'abx.admin.settings.yearWeekComponent', name: 'Admin.settings.yearWeek'},
                    {path: '/**', component: 'abx.core.homeComponent', name: 'Core.home'}
                ],
                $canActivate: ['abx.common.routerService',
                    function (abxRouter) {
                        return abxRouter.canActivate(componentName);
                    }],
                templateUrl: "app/abx-app.html",
                controller: [
                    'abx.common.logService',
                    'abx.common.authService',
                    'abx.common.aclService',
                    'abx.common.configService',
                    '$scope',
                    '$rootScope',
                    '$mdConstant',
                    '$mdSidenav',
                    '$mdMedia',
                    Controller]
            });


    //************
    // Controller
    //************
    function Controller(
            abxLog,
            abxAuth,
            abxAcl,
            abxConfig,
            $scope,
            $rootScope,
            $mdConstant,
            $mdSidenav,
            $mdMedia
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

        //******************
        // Méthodes privées
        //******************

        /*
         * Chargement des droits d'accès aux composants pour le menu latéral
         * 
         * @return {void} 
         */
        var _setIsAllowedAccessToComponents = function () {
            var componentsList = [
                'abx.core.homeComponent',
                'abx.admin.settings.homeComponent',
                'abx.admin.permissionsComponent',
                'abx.admin.userSchoolRolesComponent'
            ];

            for (var i = 0, length = componentsList.length; i < length; i++) {
                vm.isAllowedAccessToComponents[componentsList[i]] = abxAcl.isAllowedAccessToComponent(componentsList[i]);
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
         * @property {boolean} l'utilisateur est-il connecté ?
         */
        vm.isConnected = abxAuth.isConnected();

        /*
         * @property {object} liste des ACL d'accès aux composants pour le menu latéral
         */
        vm.isAllowedAccessToComponents = {};

        /*
         * @property {string} nom du module sélectionné
         */
        vm.selectedModule = '';

        /*
         * @property {object} ajout de abxMedia dans le scope
         */
        vm.abxMedia = $rootScope.abxMedia;

        /*
         * @property {boolean} afficher la barre média ?
         */
        vm.displayMediaBar = _config.isDevelopment && _config.layout.displayMediaBar;

        //*******************
        // Méthodes du scope
        //*******************


        /*
         * Affecation du module en cours pour affichage
         * 
         * @param {string} module
         * @return {void} 
         */
        vm.setModule = function (module) {
            abxLog.trace({message: "Entrée méthode", object: componentName, method: "vm.setModule", tag: "methodEntry"});
            abxLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: componentName, method: "vm.setModule"});
            vm.selectedModule = module;
        };

        vm.toggleSidenav = function () {
            $mdSidenav('left').toggle();
        };

        vm.$mdMedia = $mdMedia;

        // méthodes permettant d'afficher dans la vue les caractéristiques actuelles du média
        vm.mediaSize = function () {
            return vm.abxMedia.size;
        };
        vm.mediaQuery = function () {
            return $mdConstant.MEDIA[vm.abxMedia.size];
        };
        vm.mediaClass = function () {
            return vm.abxMedia.getClass().join(' ');
        };


        //************
        // Listeners
        //************

        // Mise en place d'un « listener » pour mettre à jour l'état de connexion de l'utilisateur
        $scope.$on('abx.common.authService:userConnected', function () {
            vm.isConnected = true;
        });
        $scope.$on('abx.common.authService:userDisconnected', function () {
            vm.isConnected = false;
        });
        // réinitialisation des ACL
        $scope.$on('abx.common.aclService:aclLoaded', function () {
            _setIsAllowedAccessToComponents();
        });

        // création dans le rootScope de l'objet abxMedia donnant les caractéristiques actuelles de l'affichage
        $scope.abxMedia = $rootScope.abxMedia = {
            size: '',
            breakpoints: [],
            orientation: '',
            getClass: function () {
                return [this.size, this.orientation].concat(this.breakpoints);
            }
        };

        // surveillance de la taille d'affichage du navigateur et de son orientation
        $scope.$watch(
                function () {
                    var size,
                            breakpoints = [],
                            orientation;
                    // largeur de la fenêtre
                    for (var i = $mdConstant.MEDIA_PRIORITY.length - 1; i >= 0; i -= 1) {
                        var mediaName = $mdConstant.MEDIA_PRIORITY[i];
                        if (mediaName.lastIndexOf('gt-', 0) === 0) {
                            continue;
                        }
                        if ($mdMedia(mediaName)) {
                            size = mediaName;
                        }
                        if (typeof size === 'undefined' && mediaName !== 'print') {
                            breakpoints.push('gt-' + mediaName);
                        }
                    }

                    // orientation de la fenêtre
                    if ($mdMedia('(orientation: portrait)')) {
                        orientation = 'portrait';
                    } else {
                        orientation = 'landscape';
                    }

                    return {size: size, breakpoints: breakpoints, orientation: orientation};
                },
                function (newValue, oldValue, scope) {
                    // un changement d'affichage a eu lieu, on met à jour les propriétés de abxMedia
                    angular.extend($rootScope.abxMedia, newValue);
                },
                true
                );

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

            _setIsAllowedAccessToComponents();
        };

    }
    ;

// fin IIFE
})();
