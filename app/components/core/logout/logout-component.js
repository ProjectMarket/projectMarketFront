/** 
 * Component pm.components.core.logoutComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: logout-component.js 684 2016-03-15 14:14:02Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.core.logoutComponent';

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
        templateUrl: 'app/components/core/logout/logout-component.html',
        controller: [
          'pm.common.logService',
          'pm.common.authService',
          'pm.common.routerService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      pmLog,
      pmAuth,
      pmRouter
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
     * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
     */
    vm.canDisplayView = false;


    //*******************
    // Méthodes du scope
    //*******************

    /*
     * Reconnexion
     * 
     * @return {void} 
     */
    vm.login = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.login", tag: "methodEntry"});
      pmRouter.setLastRequestedUrl(['Core.home']);
      pmRouter.navigate(['Core.home']);
    };

    /*
     * Déconnexion de la fédération d'identité
     * 
     * @return {void} 
     */
    vm.fullLogout = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "vm.fullLogout", tag: "methodEntry"});

      pmAuth.fullLogout();
    };

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
      
      _this.pmAppController.vm.setModule('core.logout');

      // logout (si personne connectée => redirection ; sinon : aucune action)
      if (pmAuth.logout() === true) {
        vm.canDisplayView = true;
      }
    };
  }

// fin IIFE
})();