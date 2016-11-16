/** 
 * Service d'encapsulation de stacktrace.js
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: stacktrace-service.js 267 2015-11-17 15:38:50Z vguede $
 */

/* global angular, printStackTrace */

// encapsulation dans une IIFE
(function() {

  'use strict';
  
  var objectName = 'abx.common.stacktraceService';

  angular
      .module('abx.commonModule')
      .factory(objectName,
          function() {
            
            //********************
            // Factory
            //********************
            
            var _factory = {
              StackTrace: StackTrace
            };
            return _factory;
          }
      );

// fin IIFE
})();