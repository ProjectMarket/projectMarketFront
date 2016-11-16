/** 
 * Component pm.core.loginComponent
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
  var componentName = 'pm.core.loginComponent';

  //***********
  // Component
  //***********
  angular
      .module('pm.components.coreModule')
      .component(componentName, {
        $canActivate: [
          'pm.common.configService',
          'pm.common.routerService',
          function(
              pmConfig,
              pmRouter
              ) {
            // accès interdit si on n'est pas en développement
            var config = pmConfig.get();
            if (config.isDevelopment !== true) {
              return false;
            }
            return pmRouter.canActivate(componentName);
          }],
        require: {
          pmAppController: '^pm.appComponent'
        },
        templateUrl: 'app/components/core/login/login-component.html',
        controller: [
          'pm.common.logService',
          'pm.common.configService',
          'pm.common.routerService',
          'pm.common.authService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      pmLog,
      pmConfig,
      pmRouter,
      pmAuth
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
     * @property {object} Config locale d'pm
     */
    var _config = pmConfig.get();

    /*
     * @property {string} Config locale d'pm
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
    vm.isConnected = pmAuth.isConnected();

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
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "connect", tag: "methodEntry"});
      if (vm.selectedLogin === undefined) {
        return;
      }
      pmAuth.login(vm.selectedLogin, _relayPath);
    };

    /*
     * Annulation
     * 
     * @return {void} 
     */
    vm.cancel = function() {
      pmLog.trace({message: "Entrée méthode", object: componentName, method: "cancel", tag: "methodEntry"});

      pmRouter.navigate(['Core.home']);
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
      
      _this.pmAppController.vm.setModule('core.login');

      vm.usersLogins = _config.auth.developementUsersLogins;

      try {
        _relayPath = atob(nextInstruction.params.relayPath);
      } catch (e) {
        pmLog.debug({message: "Paramètre méthode incorrect: relayPath:{{relayPath}}",
          params: {relayPath: nextInstruction.params.relayPath}, tag: "params", object: componentName, method: "$routerOnActivate"});
      }
    };

  }

// fin IIFE
})();