/** 
 * Component principal
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var componentName = 'pm.appComponent';
    angular
            .module('pmApp')
            .component(componentName, {
                $routeConfig: [
                    {path: '/', component: 'pm.home.homeComponent', name: 'Home.home'},
                    {path: '/home', component: 'pm.core.homeComponent', name: 'Core.home'},
                    {path: '/message', component: 'pm.core.messageComponent', name: 'Core.message'},
                    {path: '/user/:userId', component: 'pm.core.userComponent', name: 'Core.user'},
                    {path: '/society/:userId', component: 'pm.core.societyComponent', name: 'Core.society'},
                    {path: '/project/:action/:projectId', component: 'pm.core.projectComponent', name: 'Core.project'},
//                    {path: '/index', component: 'pm.core.indexComponent', name: 'Core.index'},
//                    {path: '/login/:relayPath', component: 'pm.core.loginComponent', name: 'Core.login'},
//                    {path: '/logout', component: 'pm.core.logoutComponent', name: 'Core.logout'},
                    {path: '/error/:type/:code', component: 'pm.core.errorComponent', name: 'Core.error'},
//                    {path: '/admin/settings/home', component: 'pm.admin.settings.homeComponent', name: 'Admin.settings.home'},
//                    {path: '/admin/settings/school-year/:action/:schoolYearId', component: 'pm.admin.settings.schoolYearComponent', name: 'Admin.settings.schoolYear'},
//                    {path: '/admin/settings/period-type/:action/:periodTypeId', component: 'pm.admin.settings.periodTypeComponent', name: 'Admin.settings.periodType'},
//                    {path: '/admin/settings/timetable-container/:action/:timetableContainerId', component: 'pm.admin.settings.timetableContainerComponent', name: 'Admin.settings.timetableContainer'},
//                    {path: '/admin/permissions', component: 'pm.admin.permissionsComponent', name: 'Admin.permissions'},
//                    {path: '/help', component: 'pm.core.helpComponent', name: 'Core.help'},
//                    {path: '/admin/roles', component: 'pm.admin.userSchoolRolesComponent', name: 'Admin.userSchoolRoles'},
//                    {path: '/admin/settings/alternating-weeks/:action/:alternatingWeeksId', component: 'pm.admin.settings.alternatingWeeksComponent', name: 'Admin.settings.alternatingWeeks'},
                    {path: '/core/404', component: 'pm.core.404Component', name: 'Core.404'}
//                    {path: '/**', component: 'pm.core.homeComponent', name: 'Core.home'}
                ],
                $canActivate: ['pm.common.routerService',
                    function (pmRouter) {
                        return pmRouter.canActivate(componentName);
                    }],
                templateUrl: "app/pm-app.html",
                controller: [
                    'pm.common.logService',
                    'pm.common.authService',
                    'pm.common.configService',
                    'pm.common.userService',
                    'pm.common.flashMessageService',
                    '$scope',
                    '$rootScope',
                    '$mdConstant',
                    '$mdSidenav',
                    '$mdMedia',
                    'pm.common.userModel',
                    'Upload',
                    'cloudinary',
                    Controller]
            });
    //************
    // Controller
    //************
    function Controller(
            pmLog,
            pmAuth,
            pmConfig,
            pmUser,
            pmFlashMessage,
            $scope,
            $rootScope,
            $mdConstant,
            $mdSidenav,
            $mdMedia,
            pmUserModel,
            $upload,
            cloudinary
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
         * @property {object} Config locale d'pm
         */
        var _config = pmConfig.get();
        //******************
        // Méthodes privées
        //******************


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
        vm.isConnected = pmAuth.isConnected();
        /*
         * @property {object} liste des ACL d'accès aux composants pour le menu latéral
         */
        vm.isAllowedAccessToComponents = {};
        /*
         * @property {string} nom du module sélectionné
         */
        vm.selectedModule = '';
        /*
         * @property {object} ajout de pmMedia dans le scope
         */
        vm.pmMedia = $rootScope.pmMedia;
        /*
         * @property {boolean} afficher la barre média ?
         */
        vm.displayMediaBar = _config.isDevelopment && _config.layout.displayMediaBar;
        /*
         * 
         * @property {Object} userId de l'utilisateur connecté
         */
        vm.user = {
            userId: undefined
        };
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
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.setModule", tag: "methodEntry"});
            pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: componentName, method: "vm.setModule"});
            vm.selectedModule = module;
        };
        vm.toggleSidenav = function () {
            $mdSidenav('left').toggle();
        };
        vm.$mdMedia = $mdMedia;
        // méthodes permettant d'afficher dans la vue les caractéristiques actuelles du média
        vm.mediaSize = function () {
            return vm.pmMedia.size;
        };
        vm.mediaQuery = function () {
            return $mdConstant.MEDIA[vm.pmMedia.size];
        };
        vm.mediaClass = function () {
            return vm.pmMedia.getClass().join(' ');
        };
        /*
         * Ouvre le dialog d'inscription
         */
        vm.signup = function () {
            var options = {
                templateUrl: 'app/components/home/signUpDialog.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};
                    vm.userDetails = {
                        type: 'user',
                        avatar: "http://res.cloudinary.com/htfvk4l8n/image/upload/v1485957950/defaultUser_hgae8v.png"
                    };
                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    
                    $scope.$watch(function(){
                        return vm.userDetails.type;
                    }, function(newValue, oldValue) {
                       if(newValue !== oldValue) {
                           if(newValue === "user") {
                               vm.userDetails.avatar = "http://res.cloudinary.com/htfvk4l8n/image/upload/v1485957950/defaultUser_hgae8v.png";
                           } else {
                               vm.userDetails.avatar = "http://res.cloudinary.com/htfvk4l8n/image/upload/v1485957953/defaultSociety_bqg3ue.png";
                           }
                       } 
                    });
                    vm.uploadFiles = function (files) {
                        var d = new Date();
                        var title = "Image (" + d.getDate() + " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")";

                        if (!files)
                            return;
                        angular.forEach(files, function (file) {
                            if (file && !file.$error) {
                                file.upload = $upload.upload({
                                    url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload",
                                    data: {
                                        api_key: cloudinary.config().api_key,
                                        api_secret: cloudinary.config().api_secret,
                                        tags: 'accountfiles',
                                        context: 'photo=' + title,
                                        file: file,
                                        upload_preset: cloudinary.config().upload_preset
                                    },
                                    withCredentials: false
                                }).progress(function (e) {
                                    file.progress = Math.round((e.loaded * 100.0) / e.total);
                                    file.status = "Uploading... " + file.progress + "%";
                                }).success(function (data, status, headers, config) {
                                    vm.userDetails.avatar = data.url;
                                }).error(function (data, status, headers, config) {
                                    file.result = data;
                                });
                            }
                        });
                       
                    };

                    vm.dragOverClass = function ($event) {
                        var items = $event.dataTransfer.items;
                        var hasFile = false;
                        if (items != null) {
                            for (var i = 0; i < items.length; i++) {
                                if (items[i].kind == 'file') {
                                    hasFile = true;
                                    break;
                                }
                            }
                        } else {
                            hasFile = true;
                        }
                        return hasFile ? "dragover" : "dragover-err";
                    };
                    vm.confirm = function (userDetails) {
                        // Formatage des infos pour l'envoi au back
                        if (userDetails.type === "user") {
                            var option = {
                                type: "user",
                                firstname: userDetails.firstName,
                                lastname: userDetails.lastName,
                                email: userDetails.mail,
                                password: userDetails.password,
                                avatar: userDetails.avatar
                            };
                        } else if (userDetails.type === "society") {
                            var option = {
                                type: "society",
                                legalname: userDetails.legalname,
                                email: userDetails.mail,
                                password: userDetails.password,
                                siretnumber: userDetails.siretnumber,
                                avatar: userDetails.avatar
                            };
                        }

                        pmUserModel.create(option)
                                .then(function (response) {
                                    pmAuth.login({email: option.email, password: option.password})
                                            .then(function () {
                                                $mdDialog.hide(userDetails);
                                            })
                                            .catch(function () {
                                                pmFlashMessage.showValidationError("Votre inscription a réussie mais nous n'avons pas pu vous connecter");
                                            });
                                })
                                .catch(function (response) {
                                    pmFlashMessage.showValidationError("Votre inscription a échouée.");
                                });
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options)
                    .then(function (data) {
                    })
                    .catch(function (data) {
                        pmFlashMessage.showCancel();
                    });
        };

        /*
         * Ouvre le dialog de connexion
         */
        vm.signin = function () {
            var options = {
                templateUrl: 'app/components/home/signInDialog.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};
                    vm.userDetails = {
                        email: undefined,
                        password: undefined
                    };
                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    vm.confirm = function () {
                        // Vérification du formulaire
                        pmAuth.login(vm.userDetails)
                                .then(function () {
                                    $mdDialog.hide(vm.userDetails);
                                })
                                .catch(function () {
                                    pmFlashMessage.showValidationError("Mot de passe ou email incorrect");
                                });
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options)
                    .then(function (data) {
                    })
                    .catch(function (data) {
                        pmFlashMessage.showCancel();
                    });
        };

        /*
         * Déconnexion de l'utilisateur
         */
        vm.signout = function () {
            //TODO: ajouter dialog de confirmation de déconnection
            pmAuth.logout();
        };

        //************
        // Listeners
        //************

        // Mise en place d'un « listener » pour mettre à jour l'état de connexion de l'utilisateur
        $scope.$on('pm.common.authService:userConnected', function () {
            vm.isConnected = true;
            vm.user.userId = pmUser.getAccountId();
            vm.user.type = pmUser.getType();
        });
        $scope.$on('pm.common.authService:userDisconnected', function () {
            vm.isConnected = false;
        });
        // création dans le rootScope de l'objet pmMedia donnant les caractéristiques actuelles de l'affichage
        $scope.pmMedia = $rootScope.pmMedia = {
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
                    // un changement d'affichage a eu lieu, on met à jour les propriétés de pmMedia
                    angular.extend($rootScope.pmMedia, newValue);
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
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
            _setIsAllowedAccessToComponents();
        };
    }
    ;
// fin IIFE
})();
