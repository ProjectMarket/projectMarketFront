/** 
 * Component pm.core.404Component
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.core.404Component';

  //***********
  // Component
  //***********
  angular
      .module('pm.components.coreModule')
      .component(componentName, {
        $canActivate: ['pm.common.routerService',
          function(pmRouter) {
            return pmRouter.canActivate(componentName);
          }],
        require: {
          pmAppController: '^pm.appComponent'
        },
        templateUrl: 'app/components/core/404/404-component.html',
        controller: [
          'pm.common.logService',
          'pm.common.routerService',
          'pm.common.timeService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      pmLog,
      pmRouter,
      pmTime
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
     * @property {object} Date date de l'erreur (avec ajout de la différence avec le back pour aide au débuggage)
     */
    vm.errorDate = pmTime.moment((pmTime.moment().unix())).toDate();

    /*
     * @property {string} dernière URL appelée
     */
    vm.lastRequestedUrl = pmRouter.getLastRequestedUrl();


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
    _this.$routerOnActivate = function(nextInstruction, prevInstruction) {
      var routeParams = angular.copy(nextInstruction.params);
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "$onActivate", tag: "methodEntry"});
      pmLog.debug({message: "$routeParams : {{routeParams}}", params: {routeParams: routeParams}, tag: "$routeParams", object: componentName});

      _this.pmAppController.vm.setModule('core.404');

      _routeParams = routeParams;
      vm.canDisplayView = true;
    };

  }

// fin IIFE
})();