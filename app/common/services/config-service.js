/** 
 * Service de gestion de la config applicative
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: config-service.js 284 2015-11-23 15:17:43Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  
  var objectName = 'abx.common.configService';

  angular
      .module('abx.commonModule')
      .factory(objectName,
          function() {

            //********************
            // Propriétés privées
            //********************

            /*
             * @property {object} Config locale
             */
            var _config = window.abxLocalConfig;


            //********************
            // Factory
            //********************
            
            var _factory = {
              /*
               * Renvoie la config locale
               * 
               * @return {object}
               */
              get: function() {
                return angular.copy(_config);
              }
            };

            return _factory;
          }
      );

// fin IIFE
})();