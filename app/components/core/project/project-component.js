/** 
 * Component pm.core.projectComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';
    var componentName = 'pm.core.projectComponent';
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
                templateUrl: 'app/components/core/project/project-component.html',
                controller: [
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.userService',
                    'pm.common.flashMessageService',
                    'pm.common.projectModel',
                    Controller]
            });
    //************
    // Controller
    //************
    function Controller(
            pmLog,
            pmRouter,
            pmUser,
            pmFlashMessage,
            pmProjectModel
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
        var _backObjects = {
            project: {}
        };
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

        };

        //*********************
        // Propriétés du scope
        //*********************

        /*
         * @property {object} vue-modèle
         */
        var vm = _this.vm = {};

        /*
         * @property {string} Action du formulaire (read|create|update)
         */
        vm.formAction = '';

        /*
         * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
         */
        vm.canDisplayView = false;

        /*
         * 
         * @property {object} Projet
         */
        vm.project = {
            title: undefined,
            description: undefined,
            budget: undefined,
            category: {
                value: undefined,
                data: []
            },
            image: undefined
        };


        //*******************
        // Méthodes du scope
        //*******************

        /*
         * Création d'un projet
         * 
         * @returns {void}
         */
        vm.create = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.create", tag: "methodEntry"});
            
            if (pmUser.isAdmin()) {
                // TODO: Ajouter un dialog de sélection de MOA perso ou entreprise
            } else {
                var options = {
                    title: vm.project.title,
                    description: vm.project.description,
                    budget: vm.project.budget,
                    category: {},
                    // TODO: Gérer l'envoie d'une image pour un projet
                    image: undefined,
                    moa: pmUser.getUserConnected()
                };

                //FIXME: Problème de réception en back du headers Authorization --> 401

                pmProjectModel.create(options)
                        .then(function (response) {
                            pmFlashMessage.showSuccess('Le projet a créé avec succès.');
                            pmRouter.navigate(['Core.project', {action: "read", projectId: response.id}]);
                        }).catch(function (response) {
                            pmFlashMessage.showValidationError("Le projet n'a pu être créé.");
                });
            }
        };

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
            _this.pmAppController.vm.setModule('Core.project');
            if (['read', 'create', 'update'].indexOf(routeParams.action) < 0
                    || (['read', 'update'].indexOf(routeParams.action) >= 0
                            && isNaN(parseInt(routeParams.projectId)))) {
                pmRouter.navigate(['404', 'params']);
            }

            // Vérification du paramètre :projectId
            var projectId = parseInt(routeParams.projectId);
            if (isNaN(projectId)) {
                // READ || UPDATE
                if (routeParams.action !== 'create') {
                    pmLog.info({message: "ProjectId incorrect. action={{action}}|projectId={{projectId}}",
                        params: {action: routeParams.action, projectId: routeParams.projectId}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
                    pmRouter.navigateToErrorPage('404', 'params');
                    return;
                } else {
                    // CREATE
                    projectId = undefined;
                }
            }
            routeParams.projectId = projectId;
            if (routeParams.projectId !== undefined) {
                // Récupération des informations du projet
                pmProjectModel.readById({projectId: routeParams.projectId})
                        .then(function (response) {

                            // TODO: Récupérer la liste des catégories

                            _populateViewModel(response);
                            _routeParams = routeParams;
                            vm.canDisplayView = true;
                        })
                        .catch(function (response) {
                            pmFlashMessage.showError({errorMessage: "Le projet n'existe pas ou plus."});
                            pmRouter.navigate(['Core.home']);
                        });
            } else {
                _populateViewModel();
                _routeParams = routeParams;
                vm.canDisplayView = true;
            }
        };
    }

// fin IIFE
})();