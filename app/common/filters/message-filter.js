/** 
 * Filtre de messages cochés
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
      .module('pm.commonModule')
      .filter('pmCommonMessageFilter',
          [
            function(
                ) {

              /*
               * @param {object} messages
               * @return {string} 
               */
              var filter = function(messages) {
                  var _messageIds = [];
                for(var i = 0; i < messages.length; i++) {
                    if(messages[i].checked) {
                        _messageIds.push(messages[i].id);
                    }
                }
                return _messageIds;
              };
              return filter;
            }]
          );




// fin IIFE
})();