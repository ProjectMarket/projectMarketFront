/** 
 * Filtre de traduction des chaines de profils
 * FIXME à revoir quand la traduction sera disponible
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: profile-filter.js 618 2016-02-19 17:39:48Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';
  angular
      .module('abx.commonModule')
      .filter('abxCommonProfileFilter',
          function() {
            return filter;
          }
      );


  /*
   * Traduction
   * 
   * @param {string} text chaîne à traduire
   * @param {object} options
   * options = {
   *   sex: {undefined|string}, // m|f
   *   withUCFirst: {undefined|boolean} // avec première majuscule ?
   * }
   * @return {string} 
   */
  var filter = function(text, options) {
    var profileList = {
      student: 'élève',
      responsible: 'responsable',
      staff: 'personnel',
      schoolRoleType: 'rôle établissement',
      globalRoleType: 'rôle académique',
      ROLE_RESP: 'responsable',
      ROLE_STUDENT: 'élève',
      ROLE_SADMIN: 'sAdmin',
      ROLE_INS: {f: 'inspectrice', m: 'inspecteur'},
      ROLE_ADMIN: {f: 'administratrice', m: 'administrateur'},
      ROLE_MANAGER: {f: 'gestionnaire générale', m: 'gestionnaire général'},
      ROLE_MANAGER_DM: 'gestionnaire annuaire',
      ROLE_MANAGER_SCHEDULE: 'gestionnaire emploi du temps',
      ROLE_MANAGER_WRB: 'gestionnaire cahier de textes',
      ROLE_MANAGER_DMS: 'gestionnaire GED',
      ROLE_MANAGER_COMP: 'gestionnaire compétences',
      ROLE_DIR: 'direction',
      ROLE_TEACHER: {f: 'enseignante', m: 'enseignant'},
      ROLE_STAFF_LTD: 'personnel invité'
    };

    if (text === undefined) {
      return text;
    }

    if (profileList[text] === undefined) {
      throw new Error('Chaîne de profil non définie : ' + text);
    }

    var output = '';

    if (typeof profileList[text] === 'string') {
      output = profileList[text]
    } else if (options.sex === 'f' || options.sex === 'm') {
      output = profileList[text][options.sex];
    } else {
      output = profileList[text].m;
    }

    if (options.withUCFirst === true) {
      output = output.charAt(0).toUpperCase() + output.slice(1);
    }

    return output;
  };

// fin IIFE
})();