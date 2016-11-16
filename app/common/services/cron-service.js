/** 
 * Service de gestion des tâches CRON (interval)
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: cron-service.js 284 2015-11-23 15:17:43Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  
  angular
      .module('pm.commonModule')
      .factory('pm.common.cronService', [
        '$interval',
        function($interval) {

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Tableau des tâches CRON
           */
          var _cronList = {};


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Affecte une tâche CRON
             * 
             * @param {string} key
             * @param {object} promise
             * @return {void}
             */
            put: function(key, promise) {
              if (typeof key !== 'string') {
                throw new Error('Le paramètre key doit être de type string, valeur donnée = ' + key);
              }
              if (key.length === 0) {
                throw new Error('Le paramètre key doit avoir au moins 1 caractère.');
              }
              if (_cronList[key] !== undefined) {
                throw new Error('Une tâche existe déjà pour cette key.');
              }
              if (promise.then() === undefined) {
                throw new Error('Le paramètre promise doit être de type promise, valeur donnée = ' + promise);
              }

              _cronList[key] = promise;
            },
            /*
             * Indique si une tâche CRON existe
             * 
             * @param {string} key
             * @return {boolean} 
             */
            isCronExists: function(key) {
              if (_cronList[key] !== undefined) {
                return true;
              }
              return false;
            },
            /*
             * Annule une tâche CRON
             * 
             * @param {string} key
             * @return {boolean} Résultat de l'action
             */
            cancel: function(key) {
              if (typeof key !== 'string') {
                throw new Error('Le paramètre key doit être de type string, valeur donnée = ' + key);
              }
              if (key.length === 0) {
                throw new Error('Le paramètre key doit avoir au moins 1 caractère.');
              }
              if (_cronList[key] === undefined) {
                throw new Error('Aucune tâche existante pour cette key.');
              }

              // annulation de la tâche
              var result = $interval.cancel(_cronList[key]);
              if (result) {
                delete _cronList[key];
                return true;
              }
              return false;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();