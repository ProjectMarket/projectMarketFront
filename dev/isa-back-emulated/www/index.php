<?php

if (!function_exists('http_response_code')) {

  function http_response_code($code = NULL) {

    if ($code !== NULL) {

      switch ($code) {
        case 100: $text = 'Continue';
          break;
        case 101: $text = 'Switching Protocols';
          break;
        case 200: $text = 'OK';
          break;
        case 201: $text = 'Created';
          break;
        case 202: $text = 'Accepted';
          break;
        case 203: $text = 'Non-Authoritative Information';
          break;
        case 204: $text = 'No Content';
          break;
        case 205: $text = 'Reset Content';
          break;
        case 206: $text = 'Partial Content';
          break;
        case 300: $text = 'Multiple Choices';
          break;
        case 301: $text = 'Moved Permanently';
          break;
        case 302: $text = 'Moved Temporarily';
          break;
        case 303: $text = 'See Other';
          break;
        case 304: $text = 'Not Modified';
          break;
        case 305: $text = 'Use Proxy';
          break;
        case 400: $text = 'Bad Request';
          break;
        case 401: $text = 'Unauthorized';
          break;
        case 402: $text = 'Payment Required';
          break;
        case 403: $text = 'Forbidden';
          break;
        case 404: $text = 'Not Found';
          break;
        case 405: $text = 'Method Not Allowed';
          break;
        case 406: $text = 'Not Acceptable';
          break;
        case 407: $text = 'Proxy Authentication Required';
          break;
        case 408: $text = 'Request Time-out';
          break;
        case 409: $text = 'Conflict';
          break;
        case 410: $text = 'Gone';
          break;
        case 411: $text = 'Length Required';
          break;
        case 412: $text = 'Precondition Failed';
          break;
        case 413: $text = 'Request Entity Too Large';
          break;
        case 414: $text = 'Request-URI Too Large';
          break;
        case 415: $text = 'Unsupported Media Type';
          break;
        case 500: $text = 'Internal Server Error';
          break;
        case 501: $text = 'Not Implemented';
          break;
        case 502: $text = 'Bad Gateway';
          break;
        case 503: $text = 'Service Unavailable';
          break;
        case 504: $text = 'Gateway Time-out';
          break;
        case 505: $text = 'HTTP Version not supported';
          break;
        default:
          exit('Unknown http status code "' . htmlentities($code) . '"');
          break;
      }

      $protocol = (isset($_SERVER['SERVER_PROTOCOL']) ? $_SERVER['SERVER_PROTOCOL'] : 'HTTP/1.0');

      header($protocol . ' ' . $code . ' ' . $text);

      $GLOBALS['http_response_code'] = $code;
    } else {

      $code = (isset($GLOBALS['http_response_code']) ? $GLOBALS['http_response_code'] : 200);
    }

    return $code;
  }

}

header('Content-Type: application/json');

$object = array();

switch ($_SERVER['REDIRECT_URL']) {

  case '/synchronize':
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('TimeStamp' => array('instant' => time())))))), 'result' => 'success'));
    break;

  case '/session/connect':
    //http_response_code(401);
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('Token' => array('token' => 'dfhsqmjdflsl!qdhfjhsdf:hqsd')))))), 'result' => 'success'));
    break;

  case '/session/login':
    $object = array('login' => 'Page de login');
    break;

  case '/session/userinit':
    //http_response_code(500);
    $multi = '{
	"Response": {
		"id": null,
		"result": "success",
		"unitResponses": [{
			"UnitResponse": {
				"id": null,
				"result": "success",
				"objects": [{
					"FrontEndUserDetails": {
						"id": null,
						"userId": 2161,
						"lastName": "ONYME",
						"firstName": "Anne",
                        "sex": "f",
                        "lastSelectedGrantedAuthority": {
                          "schoolId": 8,
                          "authority": "ROLE_TEACHER",
                          "studentUserId": null
                        },
						"profiles": {
							"staff": {
								"schools": [{
									"roles": ["ROLE_TEACHER"],
									"schoolId": "8"
								},{
									"roles": ["ROLE_TEACHER","ROLE_ADMIN"],
									"schoolId": "4"
								}],
								"globalRoles": ["ROLE_INS","ROLE_SADMIN"]
							},
							"student": [1,
							4],
							"responsible": [{
								"lastName": "FONFEC",
								"schoolIds": [1],
								"userId": 17,
								"firstName": "Sofie",
                                "sex": "f"
							},
							{
								"lastName": "AUNETTE",
								"schoolIds": [1,
								2],
								"userId": 28,
								"firstName": "Camille",
                                "sex": "f"
							}]
						},
						"schools": [
                        {"School": {
							"id": 8,
							"uai": "0330108N",
							"name": "Georges Brassens",
							"city": "Podensac",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": "[0330108N] COLLEGE Georges Brassens - Podensac"
                            }
						},
						{"School": {
							"id": 1,
							"uai": "0240101Z",
							"name": "Émile Zola",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": "[1254789D] COLLEGE Émile Zola - Bordeaux"
                            }
						},
						{"School": {
							"id": 4,
							"uai": "0330140Y",
							"name": "Grand Parc",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": null,
							"displayName": "[0330140Y] COLLEGE Grand Parc - Bordeaux"
                            }
						},
						{"School": {
							"id": 2,
							"uai": "0330102A",
							"name": "Victor Hugo",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": "[0330102A] COLLEGE Victor Hugo - Bordeaux"
                            }
						}]
					}
				}]
			}
		}]
	}
}';

    $responsible = '{
	"Response": {
		"id": null,
		"result": "success",
		"unitResponses": [{
			"UnitResponse": {
				"id": null,
				"result": "success",
				"objects": [{
					"FrontEndUserDetails": {
						"id": null,
						"userId": 6,
						"lastName": "henry",
						"firstName": "dupont",
						"profiles": {
							"staff": {
								"schools": [],
								"globalRoles": []
							},
							"student": [],
							"responsible": [{
								"lastName": "henry",
								"schoolIds": [1,2],
								"userId": 180,
								"firstName": "dupont"
							}]
						},
						"schools": [
						{"School": {
							"id": 1,
							"uai": "0240101Z",
							"name": "Émile Zola",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": "[1254789D] COLLEGE Émile Zola - Bordeaux"
                            }
						},
						{"School": {
							"id": 2,
							"uai": "0330102A",
							"name": "Victor Hugo",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": "[0330102A] COLLEGE Victor Hugo - Bordeaux"
                            }
						}]
					}
				}]
			}
		}]
	}
}';

    $student = '{
	"Response": {
		"id": null,
		"result": "success",
		"unitResponses": [{
			"UnitResponse": {
				"id": null,
				"result": "success",
				"objects": [{
					"FrontEndUserDetails": {
						"id": null,
						"userId": 180,
						"lastName": "HONNETTE",
						"firstName": "Camille",
                        "sex": "f",
                        "lastSelectedGrantedAuthority": {
                          "schoolId": 2,
                          "authority": "ROLE_STUDENT",
                          "studentUserId": null
                        },
						"profiles": {
							"staff": {
								"schools": [],
								"globalRoles": []
							},
							"student": [2],
							"responsible": []
						},
						"schools": [
                        {"School": {
							"id": 2,
							"uai": "0330102A",
							"name": "Victor Hugo",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": null,
							"displayName": ""
                            }
						}]
					}
				}]
			}
		}]
	}
}';
    $teacher = '{
	"Response": {
		"id": null,
		"result": "success",
		"unitResponses": [{
			"UnitResponse": {
				"id": null,
				"result": "success",
				"objects": [{
					"FrontEndUserDetails": {
						"id": null,
						"userId": 2127,
						"lastName": "serge",
						"firstName": "durand",
                        "sex": "m",
						"profiles": {
							"staff": {
								"schools": [{
									"roles": ["ROLE_TEACHER", "ROLE_ADMIN"],
									"schoolId": "4"
								}],
								"globalRoles": []
							},
							"student": [],
							"responsible": []
						},
						"schools": [
                        {"School": {
							"id": 4,
							"uai": "0330104A",
							"name": "Victor Hugo",
							"city": "Bordeaux",
							"sector": "pu",
							"type": "CLG",
							"nameType": "COLLEGE",
							"displayName": ""
                            }
						}]
					}
				}]
			}
		}]
	}
}';
    echo $multi;
    exit;
    break;

  case '/session/ping':
    http_response_code(200);
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('Token' => array('token' => 'dfhsqmjdflsl!qdhfjhsdf:hqsd')))))), 'result' => 'success'));
    break;

  case '/session/acl':
    //http_response_code(401);
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('FrontEndUserPermissionsPolicy' => array('frontEndUserPermissions' => array(
                                        "SCHOOLYEAR" => array("READ" => false, "CREATE" => false),
                                        "SESSION" => array("READ" => true, "CREATE" => false),
                                        "ALTERNATINGWEEKS" => array("READ" => true, "CREATE" => false),
                                        "TIMETABLE" => array("READ" => true, "CREATE" => false),
                                        "PERIOD"  => array("READ" => true, "CREATE" => false),
                                    ))))))), 'result' => 'success'));
    break;

  case '/j_spring_security_logout':
    //http_response_code(500);
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('Token' => array('token' => 'dfhsqmjdflsl!qdhfjhsdf:hqsd')))))), 'result' => 'success'));
    break;

  case '/sso':
    echo 'Full logout';
    exit();

  case '/log':
    //http_response_code(500);
    $object = array('Response' => array('unitResponses' => array(array('UnitResponse' => array('objects' => array(array('Token' => array('token' => 'dfhsqmjdflsl!qdhfjhsdf:hqsd')))))), 'result' => 'success'));
    break;

  case '/test':
    //http_response_code(401);
    $object = array('Response' => array('result' => 'success', 'unitResponses' => array(array('UnitResponse' => array('objects' => array(array('Token' => array('token' => 'dfhsqmjdflsl!qdhfjhsdf:hqsd'))))))));
    break;

  default:
    break;
}

echo json_encode($object);





