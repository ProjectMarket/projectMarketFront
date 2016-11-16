/** 
 * Service de gestion de la config applicative
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  
  var objectName = 'pm.common.configService';

  angular
      .module('pm.commonModule')
      .factory(objectName,
          function() {

            //********************
            // Propriétés privées
            //********************

            /*
             * @property {object} Config locale
             */
            var _config = window.pmLocalConfig;


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