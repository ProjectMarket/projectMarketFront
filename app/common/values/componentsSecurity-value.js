/** 
 * Model de config de sécurité des components
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */
'use strict';

// encapsulation dans une IIFE
(function () {

    'use strict';

    angular
            .module('pm.commonModule')
            .value('pm.common.componentsSecurityValue',
                    {
                        "pm": {
                            "app": {
                                "isProtected": false,
                                "crudObjects": []
                            },
                            "home": {
                                "home": {
                                    "isProtected": false,
                                    "crudObjects": []
                                }
                            },
                            "core": {
                                "home" : {
                                  "isProtected": true,
                                  "crudObjects": []
                                },
                                "user" : {
                                  "isProtected": true,
                                  "crudObjects": []
                                },
                                "project" : {
                                  "isProtected": true,
                                  "crudObjects": []
                                },
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
            );

// fin IIFE
})();