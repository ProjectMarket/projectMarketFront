/** 
 * Config locale (format JSON) - version modèle de distribution
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-local-config.json.js-dist 608 2016-02-19 13:00:47Z rpoussin $
 */

'use strict';

// variable globale volontaire pour que la config soit utilisable dans toute l'application
window.abxLocalConfig = {
  // base de la navigation
  // pour https://ent2d.ac-bordeaux.fr/isa/, indiquer '/isa/'
  // {string}
  baseHref: '/',
  // identifiant de l'instance
  // {string}
  applicationInstanceId: 'isa-front-web-dev-vg',
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
    //baseUrl: 'http://isa-back-emulated.local.ac-bordeaux.fr/'
    baseUrl: 'http://cdt-test.in.ac-bordeaux.fr:8080/isa/'
  },
  // serveur back
  auth: {
    // intervale de vérification de l'envoi du ping (en millisecondes)
    // vérifie qu'une action a eu lieu depuis moins de pingInterval et que le dernier ping a été envoyé depuis plus de pingInterval
    // {integer}
    checkPingInterval: 60000,
    // intervale d'envoi du ping pour maintenir ouverte la session sur le serveur backend (en millisecondes)
    // {integer}
    pingInterval: 600000,
    // logins pour la connexion en mode dévelopement
    // {array}
    developementUsersLogins: [
      {login: 'BIM00004', label: 'Vincent Guédé', description: '0330140Y'},
      {login: 'BUW04338', label: 'Serge Devaux', description: '0240043S'},
      {login: 'BNX00037', label: 'Alain Manigand', description: '0330128K'},
      {login: 'BBS07080', label: 'Sophie Borges', description: '0330140Y'},
      {login: 'BXP00086', label: 'Thierry Deville', description: '0330795K'},
      {login: 'BUU04338', label: 'Hugues Kitten', description: '0331663D'},
      {login: 'BCI05173', label: 'Jean-Paul Dauphin', description: '0331752A'},
      {login: 'BCP05173', label: 'Corinne Sauquet', description: '0332248P'},
      {login: 'BVI02795', label: 'Sandrine Florean', description: '0333213N'},
      {login: 'BGJ03519', label: 'Michael Dordain', description: '0400005N'},
      {login: 'BDC02799', label: 'Christophe Bignon', description: '0401015L'},
      {login: 'BIX00004', label: 'Eric Sayerce-Pon', description: '0640073G'},
      {login: 'BNB00044', label: 'Claude Betrancourt', description: '0640609P'}
    ]
  },
  // options du layout
  layout: {
    // affiche ou non dans le layout les caractéristiques de l'affichage
    // {boolean}
    displayMediaBar: false
  }
};