/** 
 * Component abx.core.helpComponent
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: model-component.js 442 2016-01-19 15:18:46Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

  'use strict';

  var componentName = 'abx.core.helpComponent';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.coreModule')
      .component(componentName, {
        $canActivate: ['abx.common.routerService',
          function (abxRouter) {
            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/core/help/help-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.backComHandlerService',
          'abx.common.timeService',
          'abx.common.versionValue',
          Controller]
      });


  //************
  // Controller
  //************
  function Controller(
      abxLog,
      abxBackComHandler,
      abxTime,
      abxVersionValue
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
     * @property {object} Objet d'erreur pour l'affichage du front
     */
    vm.hasBackError = {
      versionning: false
    };

    /*
     * 
     * @property {object} Objet d'informations sur la version des DB du back
     */
    vm.backVersion = {
      aneto: undefined,
      isa: undefined
    };

    /*
     * 
     * @property {object} Objet d'informations sur la version des DB du back
     */
    vm.frontVersion = {
      revision: abxVersionValue.revision.split(' ')[1],
      date: abxTime.convertDateFromBackToDate(abxVersionValue.date.split(' ')[1])
    };

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
    _this.$routerOnActivate = function (nextInstruction, prevInstruction) {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});

      _this.abxAppController.vm.setModule('core.help');

      var routeParams = angular.copy(nextInstruction.params);

      abxBackComHandler.get('/version')
          .then(function (response) {
            try {
              if (response[0].UnitResponse.objects[0].result !== undefined) {
                abxLog.error({errorMessage: "Erreur lors de la récupération des informations de versions du back", objects: response[0].UnitResponse.objects[0]});

                vm.hasBackError.versionning = true;
                return;
              }
              var backVersion = response[0].UnitResponse.objects[0].Version;
              vm.backVersion.version = backVersion.version;
              vm.backVersion.buildNumber = backVersion.buildNumber;
              vm.backVersion.aneto = backVersion.anetoDbVersion;
              vm.backVersion.isa = backVersion.isaDbVersion;
            } catch (e) {
              abxLog.error({errorMessage: "Erreur lors de la récupération des informations de versions du back", object: e.message});
              vm.hasBackError.versionning = true;
              vm.canDisplayView = true;
            }
          });

      _routeParams = routeParams;
      vm.canDisplayView = true;

    };

  }

// fin IIFE
})();