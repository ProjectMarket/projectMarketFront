/** 
 * Component pm.xxx.xxxComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: model-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.xxx.xxxComponent';

  //***********
  // Component
  //***********
  angular
      .module('pm.components.xxxModule')
      .component(componentName, {
        $canActivate: ['pm.common.routerService',
          function(pmRouter) {
            return pmRouter.canActivate(componentName);
          }],
        require: {
          pmAppController: '^pm.appComponent'
        },
        templateUrl: 'app/components/xxx/xxx/xxx-component.html',
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

      _this.pmAppController.vm.setModule('xxx');



      _routeParams = routeParams;
      vm.canDisplayView = true;
    };

  }

// fin IIFE
})();