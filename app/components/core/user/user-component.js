/** 
 * Component pm.core.userComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, vm */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var componentName = 'pm.core.userComponent';

    //***********
    // Component
    //***********
    angular
            .module('pm.components.coreModule')
            .component(componentName, {
                $canActivate: ['pm.common.routerService',
                    function (pmRouter) {
                        return pmRouter.canActivate(componentName);
                    }],
                require: {
                    pmAppController: '^pm.appComponent'
                },
                templateUrl: 'app/components/core/user/user-component.html',
                controller: [
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.authService',
                    'pm.common.userService',
                    'pm.common.flashMessageService',
                    'pm.common.userModel',
                    'pm.common.locationService',
                    'pm.common.imagesService',
                    'pm.common.messageModel',
                    '$mdSidenav',
                    Controller]
            });



    //************
    // Controller
    //************
    function Controller(
            pmLog,
            pmRouter,
            pmAuth,
            pmUser,
            pmFlashMessage,
            pmUserModel,
            pmLocation,
            pmImages,
            pmMessageModel,
            $mdSidenav
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
         * @property {object} paramètres de la route
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
        var _backObjects = {};

        var _userId;


        var allMuppets = [];
        //******************
        // Méthodes privées
        //******************

        /*
         * Affectation des données pour la vue
         * 
         * @param {object} result
         * @returns {void}
         */

        var _populateViewModel = function (result) {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
            pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});

            vm.userAccount = {
                firstname: result.associatedElement.firstname,
                lastname: result.associatedElement.lastname,
                description: result.description,
                address: result.associatedElement.address,
                postalcode: result.associatedElement.postalcode,
                city: result.associatedElement.city,
                country: result.associatedElement.country,
                email: result.email,
                avatar: result.associatedElement.avatar,
                createdAt: result.createdAt,
                skills: result.skills,
                projectCreated: 0,
                projectInProgressForMe: 0,
                projectEndForMe: 0
            };
            // Calcul du nombre de projets créés, en cours et réalisés
            for (var i = 0; i < result.projectsPosted.length; i++) {
                vm.userAccount.projectCreated++;
                if (result.projectsPosted[i].started !== null && result.projectsPosted[i].over === null) {
                    vm.userAccount.projectInProgressForMe++;
                } else if (result.projectsPosted[i].over !== null) {
                    vm.userAccount.projectEndForMe++;
                }
            }
            vm.display = angular.copy(vm.userAccount);
        };
        var _loadMuppets = function () {
            var muppets = [{
                    name: 'Profil'
                }, {
                    name: 'Compte'
                }, {
                    name: 'Suppression'
                }];
            allMuppets = muppets;
            vm.muppets = [].concat(muppets);
            vm.selected = vm.muppets[0];
        };

        //*********************
        // Propriétés du scope
        //*********************

        /*
         * @property {object} vue-modèle
         */
        var vm = _this.vm = {};

        /*
         * @property {string} Action du formulaire (create|update)
         */
        vm.formAction = '';

        /*
         * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
         */
        vm.canDisplayView = false;

        /*
         * @property {boolean} Ce compte est-il le mien ?
         */
        vm.isMyAccount = false;

        /*
         * @property {object} Compte à afficher
         */
        vm.userAccount = {};

        vm.uploadFiles = function (files) {
            pmImages.uploadFiles(files, 'user')
                    .then(function (response) {
                        vm.userAccount.avatar = response;
                    });
        };

        vm.contact = function () {

            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.contact", tag: "methodEntry"});

            var options = {
                templateUrl: 'app/components/core/user/contact.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};

                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    vm.confirm = function () {
                        
                        // Vérification du formulaire
                        pmMessageModel.send(vm.candidat.message,_routeParams.userId )
                         .then(function () {
                         $mdDialog.hide();
                         pmFlashMessage.showSuccess("Votre message a été envoyé.");
                         pmRouter.renavigate();
                         })
                         .catch(function () {
                         pmFlashMessage.showError({errorMessage: "Une erreur est survenue lors de l'envoi du message."});
                         }); 
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options);
        };

        /*
         * Suppression du compte
         * 
         * @returns {void}
         */
        vm.delete = function () {

            if (vm.userAccount.suppression === "SUPPRIMER") {
                var options = {
                    entityId: _userId
                };
                pmUserModel.delete(options)
                        .then(function (response) {
                            pmFlashMessage.showSuccess("Votre compte a bien été supprimé.");
                            pmAuth.logout();
                        })
                        .catch(function (response) {

                        });
            }
        };


        /*
         * Modification du profil de l'utilisateur
         * 
         * @returns {void}
         */
        vm.changeProfil = function () {

            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.changeProfil", tag: "methodEntry"});


            var options = {
                entityId: _userId,
                description: vm.userAccount.description,
                firstname: vm.userAccount.firstname,
                lastname: vm.userAccount.lastname,
                address: vm.userAccount.address,
                postalcode: vm.userAccount.postalcode,
                city: vm.userAccount.city,
                avatar: vm.userAccount.avatar,
                country: vm.userAccount.country
            };
            pmUserModel.update(options)
                    .then(function (response) {
                        var textContent = "Votre profil a bien été modifiée.";
                        pmFlashMessage.showSuccess(textContent);

                    })
                    .catch(function (response) {
                        var errorMessage = "Erreur lors de la modification du profil de l'utilisateur.";
                        pmLog.error({message: errorMessage,
                            tag: "error", object: componentName, method: "vm.changeProfil"});
                        var options = {
                            errorMessage: errorMessage,
                            adviceMessage: "Vous ne pouvez pas modifier les informations de l'utilisateur."
                        };
                        pmFlashMessage.showError(options);
                        pmRouter.navigate(['Core.home']);
                    });

        };
        /*
         * Modification du mail de l'utilisateur
         * 
         * @returns {void}
         */
        vm.changeMail = function () {

            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.changeMail", tag: "methodEntry"});

            if (vm.userAccount.email === undefined || vm.userAccount.email === "") {
                var textContent = "Le champ E-mail est vide.";

                pmFlashMessage.showValidationError(textContent);
                return;
            }

            var options = {
                entityId: _userId,
                email: vm.userAccount.email
            };
            pmUserModel.update(options)
                    .then(function (response) {

                        var textContent = "Votre adresse mail a bien été modifiée.";
                        pmFlashMessage.showSuccess(textContent);

                    })
                    .catch(function (response) {
                        var errorMessage = "Erreur lors de la modification de l'adresse mail de l'utilisateur.";
                        pmLog.error({message: errorMessage,
                            tag: "error", object: componentName, method: "vm.changeMail"});
                        var options = {
                            errorMessage: errorMessage,
                            adviceMessage: "Vous ne pouvez pas modifier les informations de l'utilisateur."
                        };
                        pmFlashMessage.showError(options);
                        pmRouter.navigate(['Core.home']);
                    });

        };

        /*
         * Modification du mot de passe de l'utilisateur
         * 
         * @returns {void}
         */

        vm.changePassword = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.changePassword", tag: "methodEntry"});

            if (vm.userAccount.oldpassword === undefined || vm.userAccount.oldpassword === "" || vm.userAccount.newpassword === undefined
                    || vm.userAccount.newpassword === "" || vm.userAccount.passwordConfirm === undefined || vm.userAccount.passwordConfirm === "") {
                var textContent = "Un des champs mot de passe est vide.";

                pmFlashMessage.showValidationError(textContent);
                return;
            }

            if (vm.userAccount.newpassword !== vm.userAccount.passwordConfirm) {
                var textContent = "Les mots de passe ne correspondent pas.";

                pmFlashMessage.showValidationError(textContent);
            }

            var options = {
                entityId: _userId,
                oldpassword: vm.userAccount.oldpassword,
                newpassword: vm.userAccount.newpassword
            };

            pmUserModel.updatePassword(options)
                    .then(function (response) {

                        var textContent = "Votre mot de passe a bien été modifiée.";
                        pmFlashMessage.showSuccess(textContent);

                    })
                    .catch(function (response) {
                        var errorMessage = "Erreur lors de la modification du mot de passe de l'utilisateur.";
                        pmLog.error({message: errorMessage,
                            tag: "error", object: componentName, method: "vm.changePassword"});
                        var options = {
                            errorMessage: errorMessage,
                            adviceMessage: "Vous ne pouvez pas modifier les informations de l'utilisateur."
                        };
                        pmFlashMessage.showError(options);
                        pmRouter.navigate(['Core.home']);
                    });
        };

        vm.toggleSidenav = function (name) {

            $mdSidenav(name).toggle();
        };

        vm.selectMuppet = function (muppet) {
            vm.selected = angular.isNumber(muppet) ? vm.muppets[muppet] : muppet;
            vm.toggleSidenav('left');
        };


        //*******************
        // Méthodes du scope
        //*******************


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
            var routeParams = angular.copy(nextInstruction.params);
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "$onActivate", tag: "methodEntry"});
            pmLog.debug({message: "$routeParams : {{routeParams}}", params: {routeParams: routeParams}, tag: "$routeParams", object: componentName});

            _this.pmAppController.vm.setModule('core.user');
            _this.pmAppController.vm.setColorMail();

            vm.selected = null;
            vm.muppets = allMuppets;

            _loadMuppets();


            try {
                var userId = parseInt(routeParams.userId);
                userId = isNaN(userId) ? undefined : userId;

                vm.isMyAccount = userId === pmUser.getAccountId();
                _routeParams.userId = userId;
                if (userId !== undefined) {
                    _userId = userId;
                    pmUserModel.readById({entityId: userId})
                            .then(function (response) {
                                _routeParams = routeParams;
                                _populateViewModel(response);
                                vm.canDisplayView = true;
                                vm.pays = pmLocation.getPays();
                            })
                            .catch(function (response) {
                                var errorMessage = "Erreur lors de la récupération de l'utilisateur.";
                                pmLog.error({message: errorMessage,
                                    tag: "error", object: componentName, method: "$routerOnActivate"});
                                var options = {
                                    errorMessage: errorMessage,
                                    adviceMessage: "Vous ne pouvez pas visualiser les informations de l'utilisateur."
                                };
                                pmFlashMessage.showError(options);
                                pmRouter.navigate(['Core.home']);
                            });
                } else {
                    pmLog.error({message: "Impossible de récupérer un User depuis le back : userId={{userId}}.", object: componentName,
                        params: {userId: routeParams.userId}, tag: "settings", method: "$routerOnActivate"});
                    pmRouter.navigate(['Core.home']);
                }
            } catch (e) {
                var errorMessage = "Erreur lors de la récupération de l'utilisateur.";
                pmLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
                    params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas visualiser les informations de l'utilisateur.",
                    errorObject: {errorMessage: e.message}
                };
                pmFlashMessage.showError(options);
                pmRouter.navigate(['Core.home']);
            }
        };

    }

// fin IIFE
})();