/** 
 * Service de cache des données
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: cache-service.js 515 2016-02-03 12:45:28Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';

  var objectName = 'pm.common.cacheService';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$interval',
        'pm.common.logService',
        'pm.common.configService',
        'pm.common.cronService',
        'pm.common.timeService',
        function(
            $interval,
            pmLog,
            pmConfig,
            pmCron,
            pmTime) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Données du cache
           */
          var _cacheData = {};

          /*
           * @property {object} Config locale d'pm
           */
          var _config = pmConfig.get();


          //********************
          // Méthodes privées
          //********************

          /*
           * @return integer timestamp UNIX
           */
          var _getTimestamp = function() {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_getTimestamp", tag: "methodEntry"});

            return pmTime.moment().unix();
          };

          // lancement de la tâche de nettoyage
          // + stockage en service
          try {
            var _intervalPromise = $interval(function() {
              _factory.clean();
            }, _config.cache.cleanInterval, 0, false);
            pmCron.put('pmCache-clean', _intervalPromise);

            pmLog.info({message: "Lancement réussi du CRON de nettoyage du cache.", tag: "cache", object: objectName, method: "_intervalPromise"});
          } catch (e) {
            pmLog.error({message: "Erreur d'enregistrement du CRON de nettoyage du cache : {{exceptionMessage}}", params: {exceptionMessage: e.message}, tag: "cache", object: objectName, method: "_intervalPromise"});
          }


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Renvoie une donnée du cache
             * 
             * @param {string} namespace
             * @param {string} key
             * @return {undefined|mixed} undefined Donnée inconnue ou lifetime dépassé | mixed Donnée cachée
             */
            get: function(namespace, key) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "get", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "get"});

              // key inconnue
              if (_cacheData[namespace] === undefined || _cacheData[namespace][key] === undefined) {
                pmLog.trace({message: "Clef de cache inconnue : {{key}}.", params: {key: namespace + '.' + key}, object: objectName, method: "get", tag: "cache"});
                return undefined;
              }
              // timeout dépassé
              if (_cacheData[namespace][key]['timeout'] < _getTimestamp()) {
                pmLog.trace({message: "Timestamp de cache dépassé : {{key}}.", params: {key: namespace + '.' + key}, object: objectName, method: "get", tag: "cache"});

                delete _cacheData[namespace][key];
                return undefined;
              }

              return _cacheData[namespace][key]['data'];
            },
            /*
             * Affecte une donnée au cache ou la supprime si undefined
             * 
             * @param {string} namespace
             * @param {string} key
             * @param {mixed} data
             * @param {integer|undefined} lifetime Durée de conservation de la donnée en cache (en secondes) ; si undefined : durée fixée selon la config
             * @return {boolean} Résultat de l'action
             */
            put: function(namespace, key, data, lifetime) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "put", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "put"});

              if (typeof namespace !== 'string' || namespace.length === 0
                  || typeof key !== 'string' || key.length === 0
                  || (lifetime !== undefined && typeof lifetime !== 'number')) {
                throw new Error('Erreur de paramètres dans la méthode ' + objectName + '.put().');
              }

              if (data === undefined) {
                _factory.remove(namespace, key);
                return false;
              }
              if (_cacheData[namespace] === undefined) {
                _cacheData[namespace] = {};
              }

              if (lifetime === undefined) {
                lifetime = _config.cache.undefinedLifetime;
              }

              _cacheData[namespace][key] = {
                data: data,
                timeout: _getTimestamp() + lifetime
              };
              return true;
            },
            /*
             * Supprime une donnée du cache
             * 
             * @param {string} namespace
             * @param {string} key
             * @return {boolean} Résultat de l'action
             */
            remove: function(namespace, key) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "remove", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "remove"});

              if (typeof namespace !== 'string' || namespace.length === 0) {
                throw new Error('Erreur de paramètres dans la méthode ' + objectName + '.remove().');
              }

              var data = _factory.get(namespace, key);
              if (data !== undefined) {
                try {
                  delete _cacheData[namespace][key];
                } catch (e) {
                  pmLog.warning({message: "Impossible de supprimer une donnée du cache : namespace={{{namespaceType}}}{{namespace}}|key={{{keyType}}}{{key}}",
                    params: {namespace: namespace, namespaceType: typeof namespace, key: key, keyType: typeof key},
                    tag: "params", object: objectName, method: "remove"});
                }
                
              }
              return true;
            },
            /*
             * Supprime tout le cache
             * @return {boolean} Résultat de l'action
             */
            removeAll: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "removeAll", tag: "methodEntry"});

              _cacheData = {};
              return true;
            },
            /*
             * Nettoie le cache des données obsolètes
             * 
             * @return {integer} Nombre de données supprimées
             */
            clean: function() {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "clean", tag: "methodEntry"});

              var timestamp = _getTimestamp(),
                  clearCount = 0;
              for (var namespace in _cacheData) {
                for (var key in _cacheData[namespace]) {
                  if (_cacheData[namespace][key]['timeout'] !== undefined && _cacheData[namespace][key]['timeout'] < timestamp) {
                    delete _cacheData[namespace][key];
                    clearCount++;
                  }
                }
              }

              pmLog.info({message: "Nettoyage du cache : {{count}} objet(s) nettoyé(s).", params: {count: clearCount}, object: objectName, method: "clean", tag: "cache"});
              return clearCount;
            }
          };

          return _factory;
        }]
          );
// fin IIFE
})();