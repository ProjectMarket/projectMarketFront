/** 
 * Config du module global
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  angular
      .module('pmApp')
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
          $compileProvider.debugInfoEnabled(pmLocalConfig.isDevelopment);

          // ajout des credentials par défaut pour les requêtes HTTP + CORS
          $httpProvider.defaults.withCredentials = true;
          $httpProvider.defaults.useXDomain = true;

          // configuration de la fonte d'icônes par défaut et du jeu d'icônes par défaut
          $mdIconProvider
              .defaultFontSet('mdi') // fonte Material Design Icons
              .defaultIconSet('assets/svg/isa-icons.svg') // icônes de l'application
              .iconSet('layout', 'assets/svg/pm-layout.svg') // icônes du layout
              .iconSet('action', 'assets/svg/pm-actions.svg'); // icônes des boutons d'action

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
