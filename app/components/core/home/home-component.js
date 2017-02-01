/** 
 * Component pm.core.homeComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    // nom des objets
    var componentName = 'pm.core.homeComponent';

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
                templateUrl: 'app/components/core/home/home-component.html',
                controller: [
                    '$filter',
                    'pm.common.logService',
                    'pm.common.flashMessageService',
                    'pm.common.timeService',
                    'pm.common.routerService',
                    'pm.common.projectModel',
                    Controller]
            });


    //************
    // Controller
    //************
    function Controller(
            $filter,
            pmLog,
            pmFlashMessage,
            pmTime,
            pmRouter,
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
            var projectModel = {
                id: undefined,
                moa: {},
                title: undefined,
                description: undefined,
                budget: undefined,
                category: "",
                image: '../../../assets/img/medaille.png',
                date_created: undefined
            };

            for (var i = 0; i < result.length; i++) {
                var project = angular.copy(projectModel);
                project.id = result[i].id;
                project.title = result[i].title;
                project.budget = result[i].budget;
                project.description = result[i].description;
                project.date_created = $filter('date')(pmTime.convertDateFromBackToDate(result[i].createdAt), "dd/MM/yyyy");
                project.category = result[i].category.name;

                vm.projects.push(project);
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
         * Liste des projects
         * 
         * @property {array}
         */
        vm.projects = [];

        /*
         * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
         */
        vm.canDisplayView = false;

        //*******************
        // Méthodes du scope
        //*******************




        //***********
        // Listeners
        //***********

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
            pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

            _this.pmAppController.vm.setModule('Core.home');

            pmProjectModel.readAll()
                    .then(function (response) {
                        _populateViewModel(response);
                        vm.canDisplayView = true;
                    })
                    .catch(function (response) {
                        pmFlashMessage.showError({errorMessage: "Impossible de récupérer l'ensemble des projets."});
                        pmRouter.navigate(['Home.home']);
                    });
        };

    }

// fin IIFE
})();