/** 
 * Component abx.core.404Component
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

  var componentName = 'abx.core.404Component';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.coreModule')
      .component(componentName, {
        $canActivate: ['abx.common.routerService',
          function(abxRouter) {
            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/core/404/404-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.routerService',
          'abx.common.timeService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      abxLog,
      abxRouter,
      abxTime
      ) {

    abxLog.trace({message: "Instanciation objet", object: componentName, tag: "objectInstantiation"});

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
    vm.errorDate = abxTime.moment((abxTime.moment().unix() + abxLog.getFrontBackTimestampInterval())).toDate();

    /*
     * @property {string} dernière URL appelée
     */
    vm.lastRequestedUrl = abxRouter.getLastRequestedUrl();


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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$onActivate", tag: "methodEntry"});
      abxLog.debug({message: "$routeParams : {{routeParams}}", params: {routeParams: routeParams}, tag: "$routeParams", object: componentName});

      _this.abxAppController.vm.setModule('core.404');

      _routeParams = routeParams;
      vm.canDisplayView = true;
    };

  }

// fin IIFE
})();