/** 
 * Service de gestion des temps et des durées
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: time-service.js 578 2016-02-16 15:45:21Z vguede $
 */

/* global moment */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'abx.common.timeService';

  angular
      .module('abx.commonModule')
      .factory(objectName, [
        '$injector',
        function(
            $injector
            ) {

          //********************
          // Propriétés privées
          //********************
          /*
           * @property {object} abx.common.logService
           */
          var _abxLog;


          //********************
          // Méthodes privées
          //********************

          /*
           * Renvoie abx.common.logService
           * 
           * @return {object} abx.common.logService
           */
          var _getAbxLog = function() {
            if (_abxLog === undefined) {
              // injection pour éviter des références circulaires
              _abxLog = $injector.get('abx.common.logService');
            }
            return _abxLog;
          };
          

          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Mapping vers moment.js
             * 
             */
            moment: moment,
            /*
             * Convertit une date du back vers un objet Date
             * 
             * @param {string} backDate
             * @return {object|undefined} Date
             * 
             */
            convertDateFromBackToDate: function(backDate) {
              try {
                if (backDate === null || backDate === undefined || (typeof backDate === 'string' && backDate.length === 0)) {
                  return undefined;
                }
                var m = _factory.moment(backDate);
                if (m.isValid()) {
                  return m.toDate();
                }
                throw new Error('Format de date invalide');
              } catch (e) {
                _getAbxLog().error({message: "Format de date invalide : backDate={{backDate}}",
                  params: {backDate: backDate}, tag: "params", object: objectName, method: "convertDateFromBackToDate"});
                throw new Error(e.message);
              }
            },
            /*
             * Convertit une date d'un objet Date vers le format attendu par le back
             * 
             * @param {object|null|undefined} Date
             * @return {string|null} "YYYY-MM-DD"
             * 
             */
            convertDateFromDateToBack: function(date) {
              if (date === null || date === undefined) {
                return null;
              }
              try {
                var m = _factory.moment(date);
                if (m.isValid()) {
                  return m.format('YYYY-MM-DD');
                }
                throw new Error('Format de date invalide');
              } catch (e) {
                _getAbxLog().error({message: "Format de date invalide : date={{date}}",
                  params: {date: date}, tag: "params", object: objectName, method: "convertDateFromDateToBack"});
                throw new Error(e.message);
              }
            },
            /*
             * Convertit un jour de semaine du back vers le front
             * 
             * @param {integer} dayOfWeek
             * @return {integer} 
             * 
             */
            convertDayOfWeekFromBackToFront: function(dayOfWeek) {
              try {
                if ([1, 2, 3, 4, 5, 6, 7].indexOf(dayOfWeek) === -1) {
                  throw new Error('DayOfWeek invalide');
                }
                return (dayOfWeek === 7 ? 0 : dayOfWeek);
              } catch (e) {
                _getAbxLog().error({message: "DayOfWeek invalide : dayOfWeek={{dayOfWeek}}",
                  params: {dayOfWeek: dayOfWeek}, tag: "params", object: objectName, method: "convertDayOfWeekFromBackToFront"});
                throw new Error(e.message);
              }
            },
            /*
             * Convertit un jour de semaine du front vers le back
             * 
             * @param {integer} dayOfWeek
             * @return {integer} 
             * 
             */
            convertDayOfWeekFromFrontToBack: function(dayOfWeek) {
              try {
                if ([0, 1, 2, 3, 4, 5, 6].indexOf(dayOfWeek) === -1) {
                  throw new Error('DayOfWeek invalide');
                }
                return (dayOfWeek === 0 ? 7 : dayOfWeek);
              } catch (e) {
                _getAbxLog().error({message: "DayOfWeek invalide : dayOfWeek={{dayOfWeek}}",
                  params: {dayOfWeek: dayOfWeek}, tag: "params", object: objectName, method: "convertDayOfWeekFromFrontToBack"});
                throw new Error(e.message);
              }
            }
          };
          return _factory;
        }
      ]);

// fin IIFE
})();