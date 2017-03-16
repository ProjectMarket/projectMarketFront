/** 
 * Config locale (format JSON) - version modèle de distribution
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

'use strict';

// variable globale volontaire pour que la config soit utilisable dans toute l'application
window.pmLocalConfig = {
  // base de la navigation
  baseHref: '/',
  // mode de l'application
  // {boolean}
  isDevelopment: true,
  // cache
  cache: {
    // intervale de nettoyage du cache (en millisecondes)
    // {integer}
    cleanInterval: 600000,
    // durée du lifetime d'une donnée si il n'est pas indiqué (en secondes)
    // {integer}
    undefinedLifetime: 3600
  },
  // log
  log: {
    // niveau de log
    // [5] trace [4] debug [3] info [2] warning [1] error [0] critical
    // {integer}
    logLevel: 5,
    // writer de log en développement
    // console|backend
    // {string}
    developmentLogWriter: 'console',
    // writer de log en production
    // console|backend
    // {string}
    productionLogWriter: 'backend',
    // intervale d'envoi des logs vers le serveur back (en millisecondes)
    // {integer}
    sendLogsInterval: 300000
  },
  // serveur back
  backend: {
    // base url du serveur de backend, avec le / final
    // {string}
    baseUrl: 'http://projectmarketapi.herokuapp.com/'
  },
  // serveur back
  auth: {
    // intervale de vérification de l'envoi du ping (en millisecondes)
    // vérifie qu'une action a eu lieu depuis moins de pingInterval et que le dernier ping a été envoyé depuis plus de pingInterval
    // {integer}
    checkPingInterval: 60000,
    // intervale d'envoi du ping pour maintenir ouverte la session sur le serveur backend (en millisecondes)
    // {integer}
    pingInterval: 600000
  },
  // options du layout
  layout: {
    // affiche ou non dans le layout les caractéristiques de l'affichage
    // {boolean}
    displayMediaBar: false
  }
};