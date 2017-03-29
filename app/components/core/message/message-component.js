/** 
 * Component pm.core.messageComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, vm */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var componentName = 'pm.core.messageComponent';

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
                templateUrl: 'app/components/core/message/message-component.html',
                controller: [
                    '$scope',
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.flashMessageService',
                    'pm.common.userService',
                    'pm.common.messageModel',
                    '$mdSidenav',
                    '$filter',
                    Controller]
            });



    //************
    // Controller
    //************
    function Controller(
            $scope,
            pmLog,
            pmRouter,
            pmFlashMessage,
            pmUserService,
            pmMessageModel,
            $mdSidenav,
            $filter
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
            vm.messages = [];
            for (var i = 0; i < result.length; i++) {
                vm.messages.push({
                    id: result[i].id,
                    description: result[i].description,
                    sender: result[i].sender,
                    read: result[i].read,
                    checked: false
                });
            }
        };

        /*
         * Charge les messages de l'utilisateur connecté
         * 
         * @return {void}
         */
        var _loadMessages = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
            pmMessageModel.read()
                    .then(function (response) {
                        _populateViewModel(response);
                        vm.canDisplayView = true;
                    }).catch(function (response) {
                var errorMessage = "Erreur lors de la récupération de vos messages.";
                pmLog.error({message: errorMessage,
                    tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas visualiser vos messages."
                };
                pmFlashMessage.showError(options);
                pmRouter.navigate(['Core.home']);
            });
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
         * @property {boolean} Il y a-t-il un message de coché ?
         */
        vm.canMarked = false;

        /*
         * @property {Array} Tableau des messages à afficher
         */
        vm.messages = [];

        /*
         * Met à jour les message sélectionné comme lus
         * 
         * @returns {void}
         */
        vm.markedAsRead = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.markedAsRead", tag: "methodEntry"});
            var messageIds = $filter('pmCommonMessageFilter')(vm.messages);
            pmMessageModel.markedAsRead(messageIds)
                    .then(function (response) {

                    }).catch(function (response) {
                var errorMessage = "Erreur lors de la mise à jour de vos messages.";
                pmLog.error({message: errorMessage,
                    tag: "error", object: componentName, method: "vm.markedAsRead"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas marquer comme lus vos messages."
                };
                pmFlashMessage.showError(options);
            }).finally(function () {
                _loadMessages();
            });
        };

        /*
         * Marque tous les messages comme lus
         * 
         * @returns {void}
         */
        vm.markedAllAsRead = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.markedAllAsRead", tag: "methodEntry"});
            var messageIds = [];
            for (var i = 0; i < vm.messages.length; i++) {
                messageIds.push(vm.messages[i].id);
            }
            pmMessageModel.markedAsRead(messageIds)
                    .then(function (response) {

                    }).catch(function (response) {
                var errorMessage = "Erreur lors de la mise à jour de vos messages.";
                pmLog.error({message: errorMessage,
                    tag: "error", object: componentName, method: "vm.markedAllAsRead"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas marquer comme lus vos messages."
                };
                pmFlashMessage.showError(options);
            }).finally(function () {
                _loadMessages();
            });
        };
        /*
         * Marque tous les messages comme non lus
         * 
         * @returns {void}
         */
        vm.markedAllAsNotRead = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.markedAllAsNotRead", tag: "methodEntry"});
            
            var messageIds = [];
            for (var i = 0; i < vm.messages.length; i++) {
                messageIds.push(vm.messages[i].id);
            }
            pmMessageModel.markedAsNotRead(messageIds)
                    .then(function (response) {

                    }).catch(function (response) {
                var errorMessage = "Erreur lors de la mise à jour de vos messages.";
                pmLog.error({message: errorMessage,
                    tag: "error", object: componentName, method: "vm.markedAllAsNotRead"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas marquer comme lus vos messages."
                };
                pmFlashMessage.showError(options);
            }).finally(function () {
                _loadMessages();
            });
        };

        /*
         * Met à jour les message sélectionné comme non lus
         * 
         * @returns {void}
         */
        vm.markedAsNotRead = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.markedAsNotRead", tag: "methodEntry"});
            var messageIds = $filter('pmCommonMessageFilter')(vm.messages);
            pmMessageModel.markedAsNotRead(messageIds)
                    .then(function (response) {

                    }).catch(function (response) {
                var errorMessage = "Erreur lors de la mise à jour de vos messages.";
                pmLog.error({message: errorMessage,
                    tag: "error", object: componentName, method: "vm.markedAsNotRead"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas marquer comme non lus vos messages."
                };
                pmFlashMessage.showError(options);
            }).finally(function () {
                _loadMessages();
            });
        };

        /*
         * Suppression des messages cochés
         * 
         * @param {array} messageId
         * @returns {void}
         */
        vm.delete = function (messageId) {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.delete", tag: "methodEntry"});

            var description;
            for (var i = 0; i < vm.messages.length; i++) {
                if (vm.messages[i].id === messageId) {
                    description = vm.messages[i].description;
                    break;
                }
            }

            pmFlashMessage.showDeleteConfirm({
                textContent: {
                    singular: "le message",
                    plural: "les messages"
                },
                objectsDisplayNames: [
                    description
                ]
            }).then(function () {
                pmMessageModel.delete([messageId])
                        .then(function (response) {

                        }).catch(function (response) {
                    var errorMessage = "Erreur lors de la suppression de vos messages.";
                    pmLog.error({message: errorMessage,
                        tag: "error", object: componentName, method: "vm.delete"});
                    var options = {
                        errorMessage: errorMessage,
                        adviceMessage: "Vous ne pouvez pas supprimer vos messages."
                    };
                    pmFlashMessage.showError(options);
                }).finally(function () {
                    _loadMessages();
                });
            });
        };

        /*
         * Suppression de tous les messages
         * 
         * @returns {void}
         */
        vm.deleteAll = function () {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.deleteAll", tag: "methodEntry"});

            var description = [];
            for (var i = 0; i < vm.messages.length; i++) {
                description.push(vm.messages[i].description);
            }
            
            pmFlashMessage.showDeleteConfirm({
                textContent: {
                    singular: "le message",
                    plural: "les messages"
                },
                objectsDisplayNames: description
            }).then(function () {
                var messageIds = [];
                for (var i = 0; i < vm.messages.length; i++) {
                    messageIds.push(vm.messages[i].id);
                }

                pmMessageModel.delete(messageIds)
                        .then(function (response) {

                        }).catch(function (response) {
                    var errorMessage = "Erreur lors de la suppression de vos messages.";
                    pmLog.error({message: errorMessage,
                        tag: "error", object: componentName, method: "vm.deleteAll"});
                    var options = {
                        errorMessage: errorMessage,
                        adviceMessage: "Vous ne pouvez pas supprimer vos messages."
                    };
                    pmFlashMessage.showError(options);
                }).finally(function () {
                    _loadMessages();
                });
            });
        };

        vm.toggleSidenav = function (name) {
            $mdSidenav(name).toggle();
        };

        //*******************
        // Méthodes du scope
        //*******************


        //************
        // Listeners
        //************

        /*
         * Watch sur le changement d'état coché ou non des messages
         */
        $scope.$watch(function () {
            return vm.messages;
        }, function (newValue, oldValue) {
            for (var i = 0; i < vm.messages.length; i++) {
                if (vm.messages[i].checked) {
                    vm.canMarked = true;
                    return;
                }
            }
            vm.canMarked = false;
        }, true);

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


            try {
                _loadMessages();
            } catch (e) {
                var errorMessage = "Erreur lors de la récupération de vos messages.";
                pmLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
                    params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas visualiser vos messages.",
                    errorObject: {errorMessage: e.message}
                };
                pmFlashMessage.showError(options);
                pmRouter.navigate(['Core.home']);
            }
        };

    }

// fin IIFE
})();