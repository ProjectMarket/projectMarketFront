/** 
 * Service de gestion des logs
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: log-service.js 403 2016-01-06 16:52:08Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';
  
  var objectName = 'pm.common.logService';

  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$window',
        '$interval',
        '$injector',
        '$q',
        'pm.common.configService',
        'pm.common.cronService',
        'pm.common.stacktraceService',
        'pm.common.timeService',
        function(
            $window,
            $interval,
            $injector,
            $q,
            pmConfig,
            pmCron,
            pmStacktrace,
            pmTime) {

          //********************
          // Propriétés privées
          //********************

          /*
           * @property {object} Config locale
           */
          var _config = pmConfig.get();

          /*
           * @property {integer} Config locale
           */
          var _sendLogsInterval = _config.log.sendLogsInterval;

          /*
           * @property {integer} Niveau de log
           */
          var _logLevel = _config.log.logLevel;

          /*
           * @property {array} Niveaux de log
           */
          var _logLevelList = [
            'CRITICAL',
            'ERROR',
            'WARNING',
            'INFO',
            'DEBUG',
            'TRACE'
          ];

          /*
           * @property {array} Logs en attente
           */
          var _waitLogList = [];

          /*
           * @property {boolean} L'envoi vers le back est-il en erreur ?
           */
          var _isErrorSendLog = false;

          /*
           * @property {object} Logs envoyés au back
           */
          var _sendLogList = {};

          /*
           * @property {integer} Différence de timestamp entre le front et le back (en secondes)
           * Si > 0 : le back est en avance sur le front
           * Si = 0 : le back et le front sont synchronisés
           * Si < 0 : le back est en retard sur le front
           * Constante générée lors du bootstrap de pmApp
           */
          var _frontBackTimestampInterval = window.pmCommonConfigFrontBackTimestampInterval || 0;

          /*
           * @property {object} pm.common.backComHandlerService
           */
          var _pmBackComHandler;


          //********************
          // Méthodes privées
          //********************

          /*
           * Renvoie pm.common.backComHandlerService
           * 
           * @return {object} pm.common.backComHandlerService
           */
          var _getpmBackComHandler = function() {
            if (_pmBackComHandler === undefined) {
              // injection pour éviter des références circulaires
              _pmBackComHandler = $injector.get('pm.common.backComHandlerService');
            }
            return _pmBackComHandler;
          };

          /*
           * Stockage / émission du log
           * 
           * @param {integer} logLevel
           * @param {object} options
           * @return {boolean} Résultat de l'action
           */
          var _put = function(logLevel, options) {
            // interprétation des params
            var log = options.message;
            if (options.params !== undefined) {
              for (var key in options.params) {
                var reg = new RegExp('{{' + key + '}}', 'g');
                var value = options.params[key];
                if (value instanceof Object) {
                  value = JSON.stringify(value, null, 2);
                }
                log = log.replace(reg, value);
              }
            }

            // choix de la sortie
            if ((_config.isDevelopment && _config.log.developmentLogWriter === 'console')
                || (!_config.isDevelopment && _config.log.productionLogWriter === 'console')) {

              // création de la string
              var logString = '[' + options.tag + '] [' + options.object;
              if (options.method !== undefined) {
                logString += '#' + options.method;
              }
              logString += '] ' + log;

              // console
              switch (logLevel) {
                case 5:
                  console.log('TRACE ' + logString);
                  break;
                case 4:
                  console.debug('DEBUG ' + logString);
                  break;
                case 3:
                  console.info('INFO ' + logString);
                  break;
                case 2:
                  console.warn('WARNING ' + logString);
                  break;
                case 1:
                  console.error('ERROR ' + logString);
                  break;
                case 0:
                  console.error('CRITICAL ' + logString);
                  break;
              }

            } else {
              // remplacement de CRITICAL par ERROR (CRITICAL n'est pas reconnu par le back)
              if (logLevel === 0) {
                logLevel = 1;
              }
              // construction de l'objet
              var logObject = {
                FrontEndLog: {
                  applicationId: _config.applicationInstanceId,
                  url: $window.location.href,
                  timestamp: pmTime.moment().unix() + _frontBackTimestampInterval,
                  level: _logLevelList[logLevel],
                  tag: options.tag,
                  issuerObject: options.object,
                  message: log
                }
              };

              if (options.method !== undefined) {
                logObject.FrontEndLog.method = options.method;
              }
              // ajout de la trace
              if (options.exception !== undefined) {
                pmStacktrace.StackTrace.fromError(options.exception)
                    .then(function(trace) {
                      logObject.FrontEndLog = trace.toString();
                    })
                    .finally(function() {
                      // enregistrement pour envoi ultérieur au serveur back
                      _waitLogList.push(logObject);
                    });
              } else {
                // enregistrement pour envoi ultérieur au serveur back
                _waitLogList.push(logObject);
              }
            }

            return true;
          };


          /*
           * Lancement de la tâche d'envoi des logs si le writer est backend
           * + stockage en service CRON
           * 
           * @return {void}
           */
          var _setSendCron = function() {
            if ((_config.isDevelopment && _config.log.developmentLogWriter !== 'backend')
                || (!_config.isDevelopment && _config.log.productionLogWriter !== 'backend')) {
              return;
            }
            try {
              // annulation du CRON s'il existe
              if (pmCron.isCronExists('pmLog-sendBackend')) {
                pmCron.cancel('pmLog-sendBackend');
              }

              // création du CRON
              var _intervalPromise = $interval(function() {
                _factory.send();
              }, _sendLogsInterval, 0, false);
              // stockage en service
              pmCron.put('pmLog-sendBackend', _intervalPromise);
              _factory.info({message: "Lancement réussi du CRON d'envoi des logs.", tag: "log", object: objectName, method: "_setSendCron"});
            }
            catch (e) {
              _factory.error({message: "Erreur d'enregistrement du CRON d'envoi de log : {{exceptionMessage}}", params: {exceptionMessage: e.message},
                tag: "log", object: objectName, method: "_setSendCron"});
            }
          };



          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Ajoute un log trace (où suis-je ? que vais-je faire ?)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            trace: function(options) {
              if (_logLevel < 5) {
                return false;
              }
              return _put(5, options);
            },
            /*
             * Ajoute un log debug (données)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            debug: function(options) {
              if (_logLevel < 4) {
                return false;
              }
              return _put(4, options);
            },
            /*
             * Ajoute un log info (infos importantes, historique des actions)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            info: function(options) {
              if (_logLevel < 3) {
                return false;
              }
              return _put(3, options);
            },
            /*
             * Ajoute un log warning (comportement anormal sans impact)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            warning: function(options) {
              if (_logLevel < 2) {
                return false;
              }
              return _put(2, options);
            },
            /*
             * Ajoute un log error (comportement anormal avec impact)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            error: function(options) {
              if (_logLevel < 1) {
                return false;
              }
              return _put(1, options);
            },
            /*
             * Ajoute un log critical (comportement anormal bloquant)
             * 
             * @param {object} options
             * @return {boolean} Résultat de l'action
             */
            critical: function(options) {
              if (_logLevel < 0) {
                return false;
              }
              return _put(0, options);
            },
            /*
             * Envoie les logs au backend
             * 
             * @return {void}
             */
            send: function() {
              var pmBackComHandler = _getpmBackComHandler(),
                  sendTimestamp = pmTime.moment().unix();
              _sendLogList['ts_' + sendTimestamp] = _waitLogList;
              _waitLogList = [];

              pmBackComHandler.post('log', _sendLogList['ts_' + sendTimestamp])
                  .then(function() {
                    // réinitialistion de l'intervale de logs
                    _sendLogsInterval = _config.log.sendLogsInterval;
                    _isErrorSendLog = false;
                    delete _sendLogList['ts_' + sendTimestamp];
                  })
                  .catch(function(response) {
                    if (response.hasPerformRedirect) {
                      return $q.reject(response);
                    }
                    _factory.warning({message: "Erreur lors de l'envoi du log vers le backend.", object: objectName, method: "send", tag: "log"});
                    // les logs sont remis dans _waitLogList si l'envoi n'était pas déjà en erreur
                    if (!_isErrorSendLog) {
                      _waitLogList = _sendLogList['ts_' + sendTimestamp].concat(_waitLogList);
                    }
                    _isErrorSendLog = true;

                    // augmentation de la durée de l'intervale
                    _sendLogsInterval += 60000;
                    // réinitialisation du cron
                    _setSendCron();
                    
                    delete _sendLogList['ts_' + sendTimestamp];
                  });
            },
            /*
             * Renvoie la différence de timestamp front / back
             * 
             * @return {integer}
             */
            getFrontBackTimestampInterval: function() {
              return _frontBackTimestampInterval;
            }
          };

          // initialisation
          _setSendCron();

          return _factory;
        }]
          );
// fin IIFE
})();
