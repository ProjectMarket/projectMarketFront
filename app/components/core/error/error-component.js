/** 
 * Component pm.core.errorComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.core.errorComponent';

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
        templateUrl: 'app/components/core/error/error-component.html',
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
     * @property {object} paramètres de la route
     */
    vm.routeParams = {};

    /*
     * @property {object} Date date de l'erreur (avec ajout de la différence avec le back pour aide au débuggage)
     */
    vm.errorDate = pmTime.moment((pmTime.moment().unix())).toDate();

    /*
     * @property {boolean} affichage autorisé de la page d'erreur
     */
    vm.canDisplayView = false;


    //*******************
    // Méthodes du scope
    //*******************



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
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      pmLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.pmAppController.vm.setModule('core.error');

      var routeParams = angular.copy(nextInstruction.params);

      // vérification des paramètres et de l'internalAccess
      if (!pmRouter.checkInternalAccess(routeParams.type, routeParams.code)) {
        pmRouter.navigate(['Core.home']);
      } else {
        vm.routeParams = routeParams;
        vm.canDisplayView = true;
      }
    };
  }

// fin IIFE
})();