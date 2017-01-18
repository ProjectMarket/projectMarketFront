/** 
 * Component pm.core.userComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

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
            pmUserModel
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
                firstname: result.firstname,
                lastname: result.lastname,
                email: result.email,
                avatar: result.avatar,
                createdAt: result.createdAt
            };
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

        /*
         * Suppression du compte
         * 
         * @returns {void}
         */
        vm.delete = function () {
            pmUserModel.delete()
                    .then(function (response) {
                        pmFlashMessage.showSuccess("Votre compte a bien été supprimé.");
                        pmAuth.logout();
                    })
                    .catch(function (response) {

                    });
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

            try {
                var userId = parseInt(routeParams.userId);
                userId = isNaN(userId) ? undefined : userId;

                vm.isMyAccount = userId === pmUser.getUserId();

                if (userId !== undefined) {
                    pmUserModel.readById({userId: userId})
                            .then(function (response) {
                                _routeParams = routeParams;
                                _populateViewModel(response);
                                vm.canDisplayView = true;
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