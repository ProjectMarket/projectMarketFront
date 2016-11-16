/** 
 * Filtre permettant de filtrer une recherche ui.select avec un OR entre les propriétés
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: school-filter.js 234 2015-11-04 15:52:10Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('pm.commonModule')
      .filter('pmCommonPropertiesFilter',
          function() {
            return filter;
          }
      );


  /*
   * Filtre selon les propriétés d'un objet
   * @see http://plnkr.co/edit/a3KlK8dKH3wwiiksDSn2?p=preview
   * 
   * @param {object|string} items
   * @param {object} props
   * @return {string} 
   */
  var filter = function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
// fin IIFE
})();