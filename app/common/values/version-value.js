/** 
 * Model de versionning de l'application
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: componentsSecurity-value.js 659 2016-03-08 09:58:02Z rpoussin $
 */

'use strict';

// encapsulation dans une IIFE
(function () {

  'use strict';

  angular
      .module('pm.commonModule')
      .value('pm.common.versionValue',
          {
            revision: "$Revision: 668 $",
            date: "$Date: 2016-03-08 15:01:50 +0100 (mar., 08 mars 2016) $",
            version: "1.0.0"
          }
      );
  // fin IIFE
})();