/** 
 * Component pm.core.projectComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, vm */

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
                    '$filter',
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.userService',
                    'pm.common.timeService',
                    'pm.common.flashMessageService',
                    'pm.common.projectModel',
                    'pm.common.categoryModel',
                    'Upload',
                    'cloudinary',
                    Controller]
            });
    //************
    // Controller
    //************
    function Controller(
            $filter,
            pmLog,
            pmRouter,
            pmUser,
            pmTime,
            pmFlashMessage,
            pmProjectModel,
            pmCategoryModel,
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

            for (var i = 0; i < _backObjects.categories.length; i++) {
                vm.project.category.data.push({
                    id: _backObjects.categories[i].id,
                    name: _backObjects.categories[i].name
                });
            }

            if (_routeParams.action !== "create") {
                console.info(_backObjects.project);
                vm.project.id = _backObjects.project.id;
                vm.project.title = _backObjects.project.title;
                vm.project.budget = _backObjects.project.budget;
                vm.project.image = _backObjects.project.image;
                vm.project.description = _backObjects.project.description;
                vm.project.date_created = $filter('date')(pmTime.convertDateFromBackToDate(_backObjects.project.createdAt), "dd/MM/yyyy");
                vm.project.date_lastUpdated = $filter('date')(pmTime.convertDateFromBackToDate(_backObjects.project.updatedAt), "dd/MM/yyyy");
                vm.project.moa.type = _backObjects.project.moa.type;
                vm.project.moa.id = _backObjects.project.moa.id;
                vm.project.category.value = _backObjects.project.category.name;

                if (_backObjects.project.moa.type === "user") {
                    vm.project.moa.firstName = _backObjects.project.moa.associatedElement.firstname;
                    vm.project.moa.lastName = _backObjects.project.moa.associatedElement.lastname;
                } else {
                    vm.project.moa.legalname = _backObjects.project.moa.associatedElement.legalname;
                }

                vm.project.moa.avatar = _backObjects.project.moa.associatedElement.avatar;
                vm.project.isMine = vm.project.moa.id === pmUser.getAccountId();

                if (_backObjects.project.started !== null) {
                    vm.project.moe = {
                        id: _backObjects.project.moe.id,
                        legalname: _backObjects.project.moe.associatedElement.legalname
                    };
                }

                vm.project.isStarted = _backObjects.project.started !== null;
                vm.project.isOver = _backObjects.project.over !== null;

                vm.project.canPostulate = _backObjects.project.moe === null;
                for (var i = 0; i < _backObjects.project.appliants.length; i++) {
                    vm.project.appliants.push({
                        id: _backObjects.project.appliants[i].id,
                        legalname: _backObjects.project.appliants[i].associatedElement.legalname,
                        avatar: _backObjects.project.appliants[i].associatedElement.avatar
                    });
                    if (pmUser.getAccountId() === _backObjects.project.appliants[i].id) {
                        vm.project.canPostulate = false;
                        break;
                    }
                }
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
        vm.isSociety = pmUser.isSociety();
        /*
         * 
         * @property {object} Projet
         */
        vm.project = {
            appliants: [],
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

            var options = {
                title: vm.project.title,
                description: vm.project.description,
                budget: vm.project.budget,
                categoryId: vm.project.categoryId,
                image: vm.project.image,
                id: pmUser.getAccountId()
            };

            pmProjectModel.create(options)
                    .then(function (response) {
                        pmFlashMessage.showSuccess('Le projet a créé avec succès.');
                        pmRouter.navigate(['Core.project', {action: "read", projectId: response.id}]);
                    }).catch(function (response) {
                pmFlashMessage.showValidationError("Le projet n'a pu être créé.");
            });
        };

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
                            tags: 'myphotoalbum',
                            context: 'photo=' + title,
                            file: file,
                            upload_preset: cloudinary.config().upload_preset
                        },
                        withCredentials: false
                    }).progress(function (e) {
                        file.progress = Math.round((e.loaded * 100.0) / e.total);
                        file.status = "Uploading... " + file.progress + "%";
                    }).success(function (data, status, headers, config) {
                        vm.project.image = data.url;
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
                image: vm.project.image
            };

            pmProjectModel.update(options, vm.project.id)
                    .then(function (response) {
                        pmFlashMessage.showSuccess('Le projet a modifié avec succès.');
                        pmRouter.navigate(['Core.project', {action: "read", projectId: response.id}]);
                    }).catch(function (response) {
                pmFlashMessage.showValidationError("Le projet n'a pu être modifié.");
            });
        };

        /*
         * Suppression du projet
         * 
         * @returns {void}
         */

        vm.delete = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.delete", tag: "methodEntry"});
            pmFlashMessage.showDeleteConfirm({
                textContent: {
                    singular: "le projet",
                    plural: "les projets"
                },
                objectsDisplayNames: [
                    vm.project.title
                ]
            }).then(function () {
                pmProjectModel.delete(vm.project.id)
                        .then(function (response) {
                            pmFlashMessage.showSuccess('Le projet a supprimé avec succès.');
                            pmRouter.navigate(['Core.home']);
                        })
                        .catch(function (response) {
                            pmFlashMessage.showValidationError("Le projet n'a pu être supprimé.");
                        });
            });
        };

        /*
         * Postuler à un projet
         * @returns {void}
         */
        vm.postulate = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.postulate", tag: "methodEntry"});
            if (!pmUser.isSociety()) {
                pmLog.error({message: "Erreur de droit d'accès à la méthode. Message d'exception={{exceptionMessage}}",
                    params: {exceptionMessage: "Ce compte n'est pas cleui d'une société"}, tag: "error", object: componentName, method: "vm.postulate"});
                pmRouter.navigateToErrorPage('global', 'fatal');
            }

            var options = {
                templateUrl: 'app/components/core/project/postulateDialog.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};
                    vm.candidat = {
                        projectId: _routeParams.projectId,
                        entityId: pmUser.getAccountId(),
                        message: undefined
                    };
                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    vm.confirm = function () {
                        // Vérification du formulaire
                        pmProjectModel.postulate(vm.candidat)
                                .then(function () {
                                    $mdDialog.hide(vm.candidat);
                                    pmFlashMessage.showSuccess("Vous venez bien de postuler à ce projet.");
                                    pmRouter.renavigate();
                                })
                                .catch(function () {
                                    pmFlashMessage.showError({errorMessage: "Une erreur est survenue lors de votre candidature."});
                                });
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options);
        };

        /*
         * Supprimer la candidature au projet
         * 
         * @returns {void}
         */
        vm.unpostulate = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.unpostulate", tag: "methodEntry"});
            pmFlashMessage.showDeleteConfirm({
                textContent: {
                    singular: "la candidature au projet",
                    plural: "les candidatures au projet"
                },
                objectsDisplayNames: [
                    vm.project.title
                ]
            }).then(function () {
                var _candidat = {
                    projectId: _routeParams.projectId,
                    entityId: pmUser.getAccountId()
                };
                pmProjectModel.unpostulate(_candidat)
                        .then(function (response) {
                            pmFlashMessage.showSuccess('Votre candidature a bien été supprimée.');
                            pmRouter.renavigate();
                        })
                        .catch(function (response) {
                            pmFlashMessage.showValidationError("Votre candidature n'a pu être supprimée.");
                        });
            });
        };

        /*
         * Choix de la MOE du projet
         * 
         * @returns {void}
         */
        vm.choiceMoe = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.choiceMoe", tag: "methodEntry"});

            var options = {
                templateUrl: 'app/components/core/project/choiceMoeDialog.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};
                    vm.appliants = [];
                    for (var i = 0; i < _backObjects.project.appliants.length; i++) {
                        vm.appliants.push({
                            id: _backObjects.project.appliants[i].id,
                            legalname: _backObjects.project.appliants[i].associatedElement.legalname
                        });
                    }
                    vm.moeId = undefined;
                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    vm.confirm = function () {
                        // Vérification du formulaire
                        pmProjectModel.selectMoe(_backObjects.project.id, vm.moeId)
                                .then(function () {
                                    $mdDialog.hide();
                                    pmFlashMessage.showSuccess("Vous venez bien de choisir l'entreprise pour votre projet.");
                                    pmRouter.renavigate();
                                })
                                .catch(function () {
                                    pmFlashMessage.showError({errorMessage: "Une erreur est survenue lors de la sélection de l'entreprise."});
                                });
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options);
        };

        /*
         * Termine la réalisation du projet
         * 
         * @returns {void}
         */
        vm.endProject = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.endProject", tag: "methodEntry"});
            var options = {
                templateUrl: 'app/components/core/project/confirmEndProject.html',
                controller: function ($scope, $mdDialog) {
                    var vm = this.vm = {};
                    vm.cancel = function () {
                        $mdDialog.cancel();
                    };
                    vm.confirm = function () {
                        pmProjectModel.endProject(_backObjects.project.id)
                                .then(function () {
                                    $mdDialog.hide();
                                    pmFlashMessage.showSuccess("Vous venez de terminer votre projet.");
                                    pmRouter.navigate(['Core.home']);
                                })
                                .catch(function () {
                                    pmFlashMessage.showError({errorMessage: "Une erreur est survenue lors de la fermeture du projet."});
                                });
                    };
                }
            };
            pmFlashMessage.showCustomDialog(options);
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

            // Récupération des catégories
            pmCategoryModel.readAll()
                    .then(function (response) {
                        _backObjects.categories = response;
                    }).then(function () {
                routeParams.projectId = projectId;
                if (routeParams.projectId !== undefined) {
                    // Récupération des informations du projet
                    pmProjectModel.readById({projectId: routeParams.projectId})
                            .then(function (response) {
                                _routeParams = routeParams;
                                vm.formAction = _routeParams.action;
                                if (vm.formAction === "update" && pmUser.getAccountId() !== response.moa.id) {
                                    pmLog.info({message: "EntityId non correct. action={{action}}|projectId={{projectId}}|entityId={{entityId}}",
                                        params: {action: routeParams.action, projectId: routeParams.projectId, entityId: pmUser.getAccountId()}, tag: "$routeParams", object: componentName, method: "$routerOnActivate"});
                                    pmRouter.navigateToErrorPage('404', 'params');
                                    return;
                                }
                                _backObjects.project = response;
                            })
                            .then(function () {
                                _populateViewModel();
                                vm.canDisplayView = true;
                            })
                            .catch(function (response) {
                                pmFlashMessage.showError({errorMessage: "Le projet n'existe pas ou plus."});
                                pmRouter.navigate(['Core.home']);
                            });
                } else {
                    _routeParams = routeParams;
                    _populateViewModel();
                    vm.formAction = _routeParams.action;
                    vm.canDisplayView = true;
                }
            });
        };
    }

// fin IIFE
})();