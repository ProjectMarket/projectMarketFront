/** 
 * Component pm.core.homeComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: home-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

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
          function(pmRouter) {
            return pmRouter.canActivate(componentName);
          }],
        require: {
          pmAppController: '^pm.appComponent'
        },
        templateUrl: 'app/components/core/home/home-component.html',
        controller: [
          'pm.common.logService',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      pmLog
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

      _this.pmAppController.vm.setModule('core.home');
    };

  }

// fin IIFE
})();