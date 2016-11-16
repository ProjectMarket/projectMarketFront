/** 
 * Service de gestion du cookie de session
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: cookie-service.js 515 2016-02-03 12:45:28Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.cookieService';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$cookies',
        'pm.common.logService',
        'pm.common.configService',
        function(
            $cookies,
            pmLog,
            pmConfig) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Config locale d'pm
           */
          var _config = pmConfig.get();

          /*
           * @property {string} Nom du cookie de session
           */
          var _cookieName = _config.applicationInstanceId + '_sessionCookie';


          //********************
          // Méthodes privées
          //********************

          /*
           * Renvoie le cookie
           * 
           * @return {object} 
           */
          var _getCookie = function() {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_getCookie", tag: "methodEntry"});
            
            var cookie;
            try {
              cookie = JSON.parse($cookies.get(_cookieName));
              if (typeof cookie !== 'object') {
                throw new Error();
              }
            } catch (e) {
              cookie = {};
            }
            return cookie;
          };

          /*
           * Enregistre le cookie
           * 
           * @param {object} cookie
           * @return {void} 
           */
          var _putCookie = function(cookie) {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_putCookie", tag: "methodEntry"});
            
            $cookies.put(_cookieName, JSON.stringify(cookie));
          };


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Renvoie une donnée du cookie
             * 
             * @param {string} namespace
             * @return {undefined|object} 
             */
            get: function(namespace) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "get", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "get"});

              var cookie = _getCookie();

              pmLog.debug({message: "Renvoi du cookie de session : {{namespace}}={{data}}", params: {namespace: namespace, data: cookie[namespace]},
                object: objectName, method: "get", tag: "cookie"});

              return cookie[namespace];
            },
            /*
             * Affecte une donnée au cookie
             * 
             * @param {string} namespace
             * @param {mixed} data
             * @return {void}
             */
            put: function(namespace, data) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "put", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "put"});

              if (typeof namespace !== 'string' || namespace.length === 0) {
                throw new Error('Erreur de paramètres dans la méthode ' + objectName + '.put().');
              }

              var cookie = _getCookie();
              cookie[namespace] = data;
              _putCookie(cookie);
            },
            /*
             * Supprime une donnée du cookie
             * 
             * @param {string} namespace
             * @return {void}
             */
            remove: function(namespace) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "remove", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "remove"});

              if (typeof namespace !== 'string' || namespace.length === 0) {
                throw new Error('Erreur de paramètres dans la méthode ' + objectName + '.remove().');
              }

              var cookie = _getCookie();

              try {
                delete cookie[namespace];
              } catch (e) {
                pmLog.warning({message: "Impossible de supprimer une propriété du cookie : namespace={{{namespaceType}}}{{namespace}}",
                  params: {namespace: namespace, namespaceType: typeof namespace},
                  tag: "params", object: objectName, method: "remove"});
              }

              _putCookie(cookie);
            },
            /*
             * Supprime le contenu du cookie de session
             * @return {void}
             */
            clean: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "clean", tag: "methodEntry"});

              _putCookie({});
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();