/** 
 * Model de config de sécurité des components
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: componentsSecurity-value.js 724 2016-04-01 14:57:55Z zvergne $
 */

'use strict';

// encapsulation dans une IIFE
(function () {

  'use strict';

  angular
      .module('abx.commonModule')
      .value('abx.common.componentsSecurityValue',  
 // Inject JSON From Gulp Task 
 {
	"abx": {
		"app": {
			"isProtected": false,
			"crudObjects": []
		},
		"core": {
			"404": {
				"isProtected": true,
				"crudObjects": []
			},
			"index": {
				"isProtected": false,
				"crudObjects": []
			},
			"error": {
				"isProtected": false,
				"crudObjects": []
			},
			"profile": {
				"isProtected": false,
				"crudObjects": []
			},
			"home": {
				"isProtected": true,
				"crudObjects": []
			},
			"login": {
				"isProtected": false,
				"crudObjects": []
			},
			"loginResult": {
				"isProtected": false,
				"crudObjects": []
			},
			"logout": {
				"isProtected": false,
				"crudObjects": []
			},
			"help": {
				"isProtected": true,
				"crudObjects": []
			}
		},
		"admin": {
			"settings": {
				"home": {
					"isProtected": true,
					"crudObjects": [
						{
							"name": "SCHOOLYEAR",
							"action": "CREATE"
						},
						{
							"name": "YEARWEEK",
							"action": "CREATE"
						},
            	{
							"name": "ALTERNATINGWEEKS",
							"action": "CREATE"
						},
						{
							"name": "TIMETABLE",
							"action": "CREATE"
						},
						{
							"name": "PERIOD",
							"action": "CREATE"
						}
					]
				},
				"schoolYear": {
					"isProtected": true,
					"crudObjects": [
						{
							"name": "SCHOOLYEAR",
							"action": "CREATE"
						}
					]
				},
				"periodType": {
					"isProtected": true,
					"crudObjects": [
						{
							"name": "PERIODTYPE",
							"action": "CREATE"
						}
					]
				},
				"timetableContainer": {
					"isProtected": true,
					"crudObjects": [
						{
							"name": "TIMETABLECONTAINER",
							"action": "CREATE"
						}
					]
				},
				"alternatingWeeks": {
					"isProtected": true,
					"crudObjects": [
						{
							"name": "ALTERNATINGWEEKS",
							"action": "CREATE"
						}
					]
				},
				"yearWeek": { 
					"isProtected": true,
					"crudObjects": [
            {
              "name": "ALTERNATINGWEEKS",
							"action": "CREATE"
            }
          ]
				}
			},
			"permissions": {
				"isProtected": true,
				"crudObjects": [
					{
						"name": "SCHOOLYEARROLEPERMISSION",
						"action": "READ"
					},
					{
						"name": "CLASSROLEPERMISSION",
						"action": "READ"
					}
				]
			},
			"userSchoolRoles": {
				"isProtected": true,
				"crudObjects": [

          {
            "name": "USERSCHOOLROLE",
            "action": "READ"
          }
        ]

			}
		}
	}
} 
 // Inject JSON From Gulp Task 
);

// fin IIFE
})();