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
                    '$q',
                    '$filter',
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.userService',
                    'pm.common.timeService',
                    'pm.common.flashMessageService',
                    'pm.common.projectModel',
                    'pm.common.userModel',
                    Controller]
            });
    //************
    // Controller
    //************
    function Controller(
            $q,
            $filter,
            pmLog,
            pmRouter,
            pmUser,
            pmTime,
            pmFlashMessage,
            pmProjectModel,
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
        var _backObjects = {
            project: {},
            author: {}
        };
        //******************
        // Méthodes privées
        //******************

        /*
         * Affectation des données pour la vue
         * 
         * @returns {void}
         */

        var _populateViewModel = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});

            if (_routeParams.action !== "create") {
                vm.project.id = _backObjects.project.id;
                vm.project.title = _backObjects.project.title;
                vm.project.budget = _backObjects.project.budget;
                vm.project.description = _backObjects.project.description;
                vm.project.date_created = $filter('date')(pmTime.convertDateFromBackToDate(_backObjects.project.createdAt), "dd/MM/yyyy");
                vm.project.date_lastUpdated = $filter('date')(pmTime.convertDateFromBackToDate(_backObjects.project.updatedAt), "dd/MM/yyyy");

                vm.project.moa.id = _backObjects.author.id;
                vm.project.moa.firstName = _backObjects.author.firstname;
                vm.project.moa.lastName = _backObjects.author.lastname;
                vm.project.isMine = vm.project.moa.id === pmUser.getAccountId() ? true : false;
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
         * @property {string} Action du formulaire (read|create|update)
         */
        vm.formAction = '';

        /*
         * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
         */
        vm.canDisplayView = false;

        /*
         * L'utilisateur est-il admin d'une société ?
         * 
         */
//        vm.isAdmin = pmUser.isAdmin();
        vm.isAdmin = true;
        /*
         * 
         * @property {object} Projet
         */
        vm.project = {
            moa: {},
            title: undefined,
            description: undefined,
            budget: undefined,
            category: {
                value: undefined,
                data: []
            },
            image: undefined,
            date_created: undefined,
            date_lastUpdated: undefined
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
                    id: pmUser.getAccountId()
                };

                pmProjectModel.create(options)
                        .then(function (response) {
                            pmFlashMessage.showSuccess('Le projet a créé avec succès.');
                            pmRouter.navigate(['Core.project', {action: "read", projectId: response.id}]);
                        }).catch(function (response) {
                    pmFlashMessage.showValidationError("Le projet n'a pu être créé.");
                });
            }
        };

        /*
         * Mise à jour d'un projet
         * 
         * @returns {void}
         */
        vm.update = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.update", tag: "methodEntry"});

            var options = {
                title: vm.project.title,
                description: vm.project.description,
                budget: vm.project.budget,
                category: {},
                // TODO: Gérer l'envoie d'une image pour un projet
                image: undefined
            };

            pmProjectModel.update(options, vm.project.id)
                    .then(function (response) {
                        pmFlashMessage.showSuccess('Le projet a modifié avec succès.');
                        pmRouter.navigate(['Core.project', {action: "read", projectId: response.id}]);
                    }).catch(function (response) {
                pmFlashMessage.showValidationError("Le projet n'a pu être modifié.");
            });
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
                            _routeParams = routeParams;
                            vm.formAction = _routeParams.action;
                            if (vm.formAction === "update" && pmUser.getAccountId() !== response.moa.id) {
                                pmLog.info({message: "UserId non correct. action={{action}}|projectId={{projectId}}|userId={{userId}}",
                                    params: {action: routeParams.action, projectId: routeParams.projectId, userId: pmUser.getAccountId()}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
                                pmRouter.navigateToErrorPage('404', 'params');
                                return;
                            }
                            _backObjects.project = response;
                        })
                        .then(function () {

                            // FIXME : Supprimer quand l'Entity sera renvoyé en même temps que la requête
                            var deferred = $q.defer(),
                                    promise = deferred.promise;
                            pmUserModel.readById({userId: _backObjects.project.moa.id})
                                    .then(function (response) {
                                        _backObjects.author = response;
                                        deferred.resolve();
                                    })
                                    .catch(function (response) {
                                        pmFlashMessage.showError({errorMessage: "L'auteur du projet n'existe pas ou plus."});
                                        pmRouter.navigate(['Core.home']);
                                        deferred.reject();
                                    });
                            return promise;
                        })
                        .then(function () {
                            // TODO : Déplacer les deux lignes suivantes dans le dernier then
                            _populateViewModel();
                            vm.canDisplayView = true;
                        })
                        .catch(function (response) {
                            pmFlashMessage.showError({errorMessage: "Le projet n'existe pas ou plus."});
                            pmRouter.navigate(['Core.home']);
                        });
            } else {
                _populateViewModel();
                _routeParams = routeParams;
                vm.formAction = _routeParams.action;
                vm.canDisplayView = true;
            }
        };
    }

// fin IIFE
})();