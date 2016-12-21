/** 
 * Service d'affichage des flashMessages
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular, e */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.flashMessageService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$mdToast',
                '$mdDialog',
                '$mdMedia',
                '$q',
                'pm.common.logService',
                'pm.common.userService',
                function (
                        $mdToast,
                        $mdDialog,
                        $mdMedia,
                        $q,
                        pmLog,
                        pmUser
                        ) {

                    pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

                    //********************
                    // Propriétés privées
                    //********************




                    //********************
                    // Méthodes privées
                    //********************




                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Affiche un toast de success
                         * 
                         * @param {string} textContent
                         * @return {object} $mdToast
                         */
                        showSuccess: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showSuccess", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showSuccess"});

                            $mdDialog.hide()
                                    .then(function () {
                                        $mdToast.show({
                                            templateUrl: 'app/common/services/flashMessage/successToast.html',
                                            hideDelay: 3000,
                                            position: 'bottom right',
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.closeToast = function () {
                                                        $mdToast.hide();
                                                    };
                                                }]
                                        });

                                    });

                            return $mdToast;
                        },
                        /*
                         * Affiche un dialog d'erreur
                         * 
                         * @param {object} options
                         * options = {
                         *   errorMessage: {string}, // message d'erreur, en texte brut
                         *   adviceMessage: {undefined|string}, // conseil, en texte brut
                         *   errorObject: {undefined|object}  // errorObject = {objectName: {undefined|string},
                         *                                                      errorType: {undefined|string},
                         *                                                      errorCode: {undefined|string},
                         *                                                      errorMessage: {undefined|string},
                         *                                                      objects: [{ErrorResponse: code: {undefined|string}}] ,
                         *                                                      }
                         * }
                         * @return {object} $mdDialog
                         */
                        showError: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showError", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showError"});

                            $mdToast.hide()
                                    .then(function () {
                                        // ajout des infos techniques
                                        var errorObject = options.errorObject,
                                                technicalInfo = [];
                                        if (typeof errorObject === 'object') {
                                            try {
                                                if (typeof errorObject.objectName === 'string') {
                                                    technicalInfo.push({key: "Objet", label: errorObject.objectName});
                                                }
                                                if (typeof errorObject.errorType === 'string') {
                                                    technicalInfo.push({key: "Type d'erreur", label: errorObject.errorType});
                                                }
                                                if (typeof errorObject.errorCode === 'string') {
                                                    technicalInfo.push({key: "Code d'erreur", label: errorObject.errorCode});
                                                }
                                                if (typeof errorObject.errorMessage === 'string') {
                                                    technicalInfo.push({key: "Message d'erreur", label: errorObject.errorMessage});
                                                }
                                                if (typeof errorObject.objects === 'object'
                                                        && errorObject.objects[0] !== undefined
                                                        && typeof errorObject.objects[0].ErrorResponse === 'object'
                                                        && typeof errorObject.objects[0].ErrorResponse.code === 'string'
                                                        ) {
                                                    technicalInfo.push({key: "Code d'erreur serveur", label: errorObject.objects[0].ErrorResponse.code});
                                                }
                                            } catch (e) {
                                            }
                                        }

                                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                                        $mdDialog.show({
                                            templateUrl: 'app/common/services/flashMessage/errorDialog.html',
                                            clickOutsideToClose: true,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.errorMessage = options.errorMessage;
                                                    vm.adviceMessage = options.adviceMessage;
                                                    vm.technicalInfo = technicalInfo;

                                                    vm.closeDialog = function () {
                                                        $mdDialog.hide();
                                                    };
                                                }]
                                        });

                                    });


                            return $mdDialog;
                        },
                        /*
                         * Affiche un toast d'erreur de validation
                         * 
                         * @param {undefined|string} textContent
                         * @return {object} $mdToast
                         */
                        showValidationError: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showValidationError", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showValidationError"});

                            if (textContent === undefined) {
                                textContent = "Erreur de validation du formulaire.";
                            }

                            $mdToast.show({
                                templateUrl: 'app/common/services/flashMessage/validationErrorToast.html',
                                hideDelay: 5000,
                                position: 'bottom right',
                                controllerAs: '$ctrl',
                                controller: [function () {
                                        var vm = this.vm = {};
                                        vm.textContent = textContent;

                                        vm.closeToast = function () {
                                            $mdToast.hide();
                                        };
                                    }]
                            });

                            return $mdToast;
                        },
                        /*
                         * Affiche un dialog de confirmation pour la suppression
                         * 
                         * @param {Array} options: {
                         *   textContent: {
                         *     singular: {string},
                         *     plural: {string}
                         *   },
                         *   objectsDisplayNames : [
                         *     {string},
                         *     {...}
                         *   ]
                         * }
                         * @return {object} Promise
                         */
                        showDeleteConfirm: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showDeleteConfirm", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showDeleteConfirm"});


                            // validation des paramètres
                            if (options === undefined || typeof options.textContent !== 'object'
                                    || !angular.isArray(options.objectsDisplayNames) || options.objectsDisplayNames.length === 0) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Paramètres méthode : options={{options}}",
                                    params: {options: options}, tag: "params", object: objectName, method: "showDeleteConfirm"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer(),
                                    textContent = '';

                            $mdToast.hide()
                                    .then(function () {

                                        if (options.textContent.singular !== undefined && options.textContent.plural !== undefined) {
                                            textContent = options.objectsDisplayNames.length < 2 ? options.textContent.singular : options.textContent.plural;
                                        } else {
                                            textContent = options.objectsDisplayNames.length < 2 ? "cet élément" : "ces éléments";
                                        }

                                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

                                        $mdDialog.show({
                                            templateUrl: 'app/common/services/flashMessage/deleteConfirmDialog.html',
                                            clickOutsideToClose: false,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;
                                                    vm.objectsDisplayNames = options.objectsDisplayNames;

                                                    vm.cancel = function () {
                                                        $mdDialog.hide();
                                                        deferred.reject();
                                                    };

                                                    vm.confirm = function () {
                                                        $mdDialog.hide();
                                                        deferred.resolve();
                                                    };
                                                }]
                                        });
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Affiche un warning de dialog de confirmation
                         * 
                         * @param {string} textContent
                         * @return {object} Promise
                         */
                        showWarningConfirm: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showWarningConfirm", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showWarningConfirm"});


                            // validation des paramètres
                            if (textContent === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Paramètres méthode : {{params}}",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "showWarningConfirm"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();

                            $mdToast.hide()
                                    .then(function () {

                                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

                                        $mdDialog.show({
                                            templateUrl: 'app/common/services/flashMessage/warningConfirmDialog.html',
                                            clickOutsideToClose: false,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.cancel = function () {
                                                        $mdDialog.hide();
                                                        deferred.reject();
                                                    };

                                                    vm.confirm = function () {
                                                        $mdDialog.hide();
                                                        deferred.resolve();
                                                    };
                                                }]
                                        });
                                    });

                            return deferred.promise;
                        },
                        /*
                         * Affiche un toast d'annulation
                         * 
                         * @param {undefined|string} textContent
                         * @return {object} $mdToast
                         */
                        showCancel: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showCancel", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showCancel"});

                            $mdDialog.hide()
                                    .then(function () {
                                        if (textContent === undefined) {
                                            textContent = "Action annulée.";
                                        }

                                        $mdToast.show({
                                            templateUrl: 'app/common/services/flashMessage/cancelToast.html',
                                            hideDelay: 3000,
                                            position: 'bottom right',
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.closeToast = function () {
                                                        $mdToast.hide();
                                                    };
                                                }]
                                        });
                                    });

                            return $mdToast;
                        },
                        /*
                         * Affiche un toast d'attente
                         * 
                         * @param {undefined|string} textContent
                         * @return {object} $mdToast
                         */
                        showWait: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showWait", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showWait"});

                            $mdDialog.hide()
                                    .then(function () {
                                        if (textContent === undefined) {
                                            textContent = "Veuillez patienter.";
                                        }

                                        $mdToast.show({
                                            templateUrl: 'app/common/services/flashMessage/waitToast.html',
                                            hideDelay: false,
                                            position: 'bottom right',
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.closeToast = function () {
                                                        $mdToast.hide();
                                                    };
                                                }]
                                        });
                                    });

                            return $mdToast;
                        },
                        /*
                         * Affiche un dialog d'aide
                         * 
                         * @param {string} textContent
                         * @return {object} $mdDialog
                         */
                        showHelp: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showHelp", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showHelp"});

                            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                            $mdToast.hide()
                                    .then(function () {
                                        $mdDialog.show({
                                            templateUrl: 'app/common/services/flashMessage/helpDialog.html',
                                            clickOutsideToClose: true,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.closeDialog = function () {
                                                        $mdDialog.hide();
                                                    };
                                                }]
                                        });
                                    });

                            return $mdDialog;
                        },
                        /*
                         * Affiche un dialog d'aide
                         * 
                         * @param {string} textContent
                         * @return {object} $mdDialog
                         */
                        showInfo: function (textContent) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showInfo", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showInfo"});

                            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));
                            $mdToast.hide()
                                    .then(function () {
                                        $mdDialog.show({
                                            templateUrl: 'app/common/services/flashMessage/infoDialog.html',
                                            clickOutsideToClose: true,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: [function () {
                                                    var vm = this.vm = {};
                                                    vm.textContent = textContent;

                                                    vm.closeDialog = function () {
                                                        $mdDialog.hide();
                                                    };
                                                }]
                                        });
                                    });

                            return $mdDialog;
                        },
                        /*
                         * Affiche un dialog personnalisé
                         * 
                         * @param {object} options {
                         *   templateUrl: {string},
                         *   scope: {undefined|object},
                         *   controller: {object}
                         * }
                         * @return {object} Promise
                         */
                        showCustomDialog: function (options) {
                            pmLog.trace({message: "Entrée méthode", object: objectName, method: "showCustomDialog", tag: "methodEntry"});
                            pmLog.debug({message: "Paramètres méthode : {{params}}",
                                params: {params: arguments}, tag: "params", object: objectName, method: "showCustomDialog"});


                            // validation des paramètres
                            if (options === undefined) {
                                pmLog.error({message: "Erreur de paramètres en entrée de méthode. Paramètres méthode : {{params}}",
                                    params: {params: arguments}, tag: "params", object: objectName, method: "showCustomDialog"});
                                throw new Error('Erreur de paramètres en entrée de méthode.');
                            }

                            var deferred = $q.defer();
                            $mdToast.hide()
                                    .then(function () {

                                        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'));

                                        $mdDialog.show({
                                            templateUrl: options.templateUrl,
                                            clickOutsideToClose: false,
                                            fullscreen: useFullScreen,
                                            controllerAs: '$ctrl',
                                            controller: options.controller
                                        })
                                                .then(function (data) {
                                                    deferred.resolve(data);
                                                })
                                                .catch(function (data) {
                                                    deferred.reject(data);
                                                });
                                    });

                            return deferred.promise;
                        }
                    };

                    return _factory;
                }]
                    );
// fin IIFE
})();