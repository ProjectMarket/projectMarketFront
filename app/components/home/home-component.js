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
    var componentName = 'pm.home.homeComponent';

    //***********
    // Component
    //***********
    angular
            .module('pm.components.homeModule')
            .component(componentName, {
                $canActivate: ['pm.common.routerService',
                    function (pmRouter) {
                        return pmRouter.canActivate(componentName);
                    }],
                require: {
                    pmAppController: '^pm.appComponent'
                },
                templateUrl: 'app/components/home/home-component.html',
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

        /*
         * Array des images du carousel de la page d'accueil (non connecté)
         */
        vm.arraySlider = [
            {src: '../../../assets/img/carousel/carousel-accueil-slide-1.jpg'},
            {src: '../../../assets/img/carousel/carousel-accueil-slide-2.jpg'},
            {src: '../../../assets/img/carousel/carousel-accueil-slide-3.jpg'}
        ];

        /*
         * Array des images des témoignages de la page d'accueil (non connecté)
         */
        vm.arrayTestimonial = [
            {src: '../../../assets/img/testimonials/testimonial.jpg'}
        ];

        /*
         * @property {boolean} l'utilisateur est-il connecté ?
         */
        vm.isConnected = pmAuth.isConnected();


        //*******************
        // Méthodes du scope
        //*******************




        //***********
        // Listeners
        //***********

        // Mise en place d'un « listener » pour mettre à jour l'état de connexion de l'utilisateur
        $scope.$on('abx.common.authService:userConnected', function () {
            vm.isConnected = true;
        });
        $scope.$on('abx.common.authService:userDisconnected', function () {
            vm.isConnected = false;
        });

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

            _this.pmAppController.vm.setModule('Home.home');
        };

    }

// fin IIFE
})();