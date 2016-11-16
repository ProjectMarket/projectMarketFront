/** 
 * Component abx.core.errorComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: error-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'abx.core.errorComponent';

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
        templateUrl: 'app/components/core/error/error-component.html',
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
    vm.errorDate = abxTime.moment((abxTime.moment().unix() + abxLog.getFrontBackTimestampInterval())).toDate();

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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.abxAppController.vm.setModule('core.error');

      var routeParams = angular.copy(nextInstruction.params);

      // vérification des paramètres et de l'internalAccess
      if (!abxRouter.checkInternalAccess(routeParams.type, routeParams.code)) {
        abxRouter.navigate(['Core.home']);
      } else {
        vm.routeParams = routeParams;
        vm.canDisplayView = true;
      }
    };
  }

// fin IIFE
})();