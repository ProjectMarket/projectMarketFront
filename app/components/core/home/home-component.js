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
                    'pm.common.logService',
                    'pm.common.authService',
                    '$scope',
                    Controller]
            });


    //************
    // Controller
    //************
    function Controller(
            pmLog,
            pmAuth,
            $scope
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


        //*********************
        // Propriétés du scope
        //*********************

        /*
         * @property {object} vue-modèle
         */
        var vm = _this.vm = {};


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
        };

    }

// fin IIFE
})();