/** 
 * Module global
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-app-module.js 714 2016-03-22 17:02:57Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  angular
      .module('abxApp', [
        'ngComponentRouter',
        'ngMaterial',
        'material.core.colors',
        'ngSanitize',
        'ngMessages',
        'ngMessageFormat',
        'ui.select',
        'ui.mask',
        'abx.commonModule',
        'abx.componentsModule'
      ]);

// fin IIFE
})();