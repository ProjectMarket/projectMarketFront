/** 
 * Config du module global
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: abx-app.config.js 617 2016-02-19 17:32:26Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  angular
      .module('abxApp')
      .config([
        '$locationProvider',
        '$httpProvider',
        '$compileProvider',
        '$mdIconProvider',
        '$mdThemingProvider',
        '$mdDateLocaleProvider',
        'uiSelectConfig',
        function(
            $locationProvider,
            $httpProvider,
            $compileProvider,
            $mdIconProvider,
            $mdThemingProvider,
            $mdDateLocaleProvider,
            uiSelectConfig) {

          // passe en mode HTML5 (sans hashtag)
          $locationProvider.html5Mode(true);

          // suppression du mode débug en production
          $compileProvider.debugInfoEnabled(abxLocalConfig.isDevelopment);

          // ajout des credentials par défaut pour les requêtes HTTP + CORS
          $httpProvider.defaults.withCredentials = true;
          $httpProvider.defaults.useXDomain = true;

          // configuration de la fonte d'icônes par défaut et du jeu d'icônes par défaut
          $mdIconProvider
              .defaultFontSet('mdi') // fonte Material Design Icons
              .defaultIconSet('assets/svg/isa-icons.svg') // icônes de l'application
              .iconSet('layout', 'assets/svg/abx-layout.svg') // icônes du layout
              .iconSet('action', 'assets/svg/abx-actions.svg'); // icônes des boutons d'action

          // configuration du thème par défaut
          $mdThemingProvider.theme('default')
              .primaryPalette('brown')  // palette d'origine du thème 'default' : indigo
              .accentPalette('orange') // palette d'origine du thème 'default' : pink
              .warnPalette('orange') // palette d'origine du thème 'default' : deep-orange
              .backgroundPalette('grey'); // palette d'origine du thème 'default' : grey

          // localisation de moment.js
          moment.locale('fr');

          // configuration de la locale du datepicker
          $mdDateLocaleProvider.months = moment.months();
          $mdDateLocaleProvider.shortMonths = moment.monthsShort();
          $mdDateLocaleProvider.days = moment.weekdays();
          $mdDateLocaleProvider.shortDays = moment.weekdaysMin();
          $mdDateLocaleProvider.firstDayOfWeek = 1;
          $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, 'L', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
          };
          $mdDateLocaleProvider.formatDate = function(date) {
            return !date ? '' : moment(date).format('L');
          };
          $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
            return $mdDateLocaleProvider.shortMonths[date.getMonth()] + ' ' + date.getFullYear();
          };
          $mdDateLocaleProvider.weekNumberFormatter = function(weekNumber) {
            return 'Semaine ' + weekNumber;
          };
          $mdDateLocaleProvider.msgCalendar = 'Calendrier';
          $mdDateLocaleProvider.msgOpenCalendar = 'Ouvrir le calendrier';

          // config de ui-delect
          uiSelectConfig.theme = 'select2';

        }]);

// fin IIFE
})();
