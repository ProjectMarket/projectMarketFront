/** 
 * Component pm.core.loginResultComponent
 * Résultat du login
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: login-component.js 515 2016-02-03 12:45:28Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var componentName = 'pm.core.loginResultComponent';

  //***********
  // Component
  //***********
  angular
      .module('pm.components.coreModule')
      .component(componentName, {
        $canActivate: [
          'pm.common.routerService',
          function(
              pmRouter
              ) {
            return pmRouter.canActivate(componentName);
          }],
        controller: [
          'pm.common.logService',
          'pm.common.routerService',
          Controller]
      });



  //************
  // Controller
  //************
  function Controller(
      pmLog,
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


    //*********************
    // Propriétés du scope
    //*********************


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

      // validation des paramètres
      var routeParams = angular.copy(nextInstruction.params);

      // validation :action
      if (["success", "error"].indexOf(routeParams.result) < 0) {
        pmRouter.navigateToErrorPage('404', 'params');
        return;
      }

      if (routeParams.result === "success") {
        pmLog.trace({message: "Identification réussie, redirection vers l'application", object: componentName, method: "$routerOnActivate", tag: "successLogin"});
        try {
          var relayPath = atob(routeParams.relayPath);
          pmLog.debug({message: "Chemin de redirection : {{relayPath}}",
            params: {relayPath: relayPath}, tag: "params", object: componentName, method: "$routerOnActivate"});

          pmRouter.navigateByUrl(relayPath);
        } catch (e) {
          pmLog.debug({message: "Chemin de redirection invalide, redirection vers la page d'erreur", object: componentName, method: "$routerOnActivate", tag: "params"});
          pmRouter.navigateToErrorPage('404', 'params');
        }
      } else {
        pmLog.debug({message: "Identification en échec, redirection vers la page d'erreur", object: componentName, method: "$routerOnActivate", tag: "errorLogin"});
        pmRouter.navigateToErrorPage('auth', 'login');
      }
    };

  }

// fin IIFE
})();