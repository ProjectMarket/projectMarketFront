/** 
 * Component abx.core.loginComponent
 * Choix du login en mode développement
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: login-component.js 682 2016-03-15 11:31:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom des objets
  var componentName = 'abx.core.loginComponent';

  //***********
  // Component
  //***********
  angular
      .module('abx.components.coreModule')
      .component(componentName, {
        $canActivate: [
          'abx.common.configService',
          'abx.common.routerService',
          function(
              abxConfig,
              abxRouter
              ) {
            // accès interdit si on n'est pas en développement
            var config = abxConfig.get();
            if (config.isDevelopment !== true) {
              return false;
            }
            return abxRouter.canActivate(componentName);
          }],
        require: {
          abxAppController: '^abx.appComponent'
        },
        templateUrl: 'app/components/core/login/login-component.html',
        controller: [
          'abx.common.logService',
          'abx.common.configService',
          'abx.common.routerService',
          'abx.common.authService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      abxLog,
      abxConfig,
      abxRouter,
      abxAuth
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
     * @property {object} Config locale d'Abx
     */
    var _config = abxConfig.get();

    /*
     * @property {string} Config locale d'Abx
     */
    var _relayPath = '';


    //*********************
    // Propriétés du scope
    //*********************

    /*
     * @property {object} vue-modèle
     */
    var vm = _this.vm = {};

    /*
     * @property {boolean} l'user est-il déjà connecté ?
     */
    vm.isConnected = abxAuth.isConnected();

    /*
     * @property {array} liste des logins des users
     */
    vm.usersLogins = [];

    /*
     * @property {string} login sélectionné
     */
    vm.selectedLogin;


    //*******************
    // Méthodes du scope
    //*******************

    /*
     * Connexion
     * 
     * @return {void} 
     */
    vm.connect = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "connect", tag: "methodEntry"});
      if (vm.selectedLogin === undefined) {
        return;
      }
      abxAuth.login(vm.selectedLogin, _relayPath);
    };

    /*
     * Annulation
     * 
     * @return {void} 
     */
    vm.cancel = function() {
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "cancel", tag: "methodEntry"});

      abxRouter.navigate(['Core.home']);
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
      abxLog.trace({message: "Entrée méthode", object: componentName, method: "$routerOnActivate", tag: "methodEntry"});
      abxLog.debug({message: "Paramètres méthode : {{params}}",
        params: {params: arguments}, tag: "params", object: componentName, method: "$routerOnActivate"});
      
      _this.abxAppController.vm.setModule('core.login');

      vm.usersLogins = _config.auth.developementUsersLogins;

      try {
        _relayPath = atob(nextInstruction.params.relayPath);
      } catch (e) {
        abxLog.debug({message: "Paramètre méthode incorrect: relayPath:{{relayPath}}",
          params: {relayPath: nextInstruction.params.relayPath}, tag: "params", object: componentName, method: "$routerOnActivate"});
      }
    };

  }

// fin IIFE
})();