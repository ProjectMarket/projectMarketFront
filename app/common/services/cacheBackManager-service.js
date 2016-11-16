/** 
 * Service qui encapsule le cache et la communication avec le back
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: cacheBackManager-service.js 716 2016-03-24 08:36:33Z vguede $
 */

/* global angular, e */

// encapsulation dans une IIFE
(function() {

  'use strict';
  var objectName = 'pm.common.cacheBackManagerService';
  angular
      .module('pm.commonModule')
      .factory(objectName, [
        '$q',
        'pm.common.logService',
        'pm.common.cacheService',
        'pm.common.backComHandlerService',
        function(
            $q,
            pmLog,
            pmCache,
            pmBackComHandler
            ) {

          pmLog.trace({message: "Instanciation objet", object: objectName, tag: "objectInstantiation"});
          //********************
          // Propriétés privées
          //********************

          /*
           * @property {array} Liste des nombres de requêtes combinées
           */
          var _concatList = [];
          /*
           * @property {object} Liste des requêtes à combiner
           */
          var _requestList = {};


          //********************
          // Méthodes privées
          //********************

          /*
           * Ajoute une requête vers le back et la réalise si ce n'est pas une requête combinée
           * ou si c'est la dernière des requêtes combinées
           * 
           * @param {string} method {create|read|update|delete|...}
           * @param {object} options
           * options = {
           *   concat: {undefined}|{
           *     concatId: {integer},
           *     requestNumber: {integer}
           *   },
           *   requestObjects: [
           *     {...},
           *     {...}
           *   ]
           * }
           * @return {object} Promise
           */
          var _addRequest = function(method, options) {
            pmLog.trace({message: "Entrée méthode", object: objectName, method: "_addRequest", tag: "methodEntry"});
            pmLog.debug({message: "Paramètres méthode : {{params}}",
              params: {params: arguments}, tag: "params", object: objectName, method: "_addRequest"});

            var deferred = $q.defer(),
                promise = deferred.promise,
                requestObjects,
                backRequestObjects = [];

            // requête combinée
            if (options.concat !== undefined) {
              // ajout dans la liste des requêtes
              _requestList['concatId_' + options.concat.concatId]['requestNumber_' + options.concat.requestNumber] = {
                deferred: deferred,
                requestObjects: options.requestObjects
              };

              var numberOfRequests = _concatList[options.concat.concatId],
                  requestListLength = Object.keys(_requestList['concatId_' + options.concat.concatId]).length,
                  requestObjectsLength = 0;

              // pas de requête si l'ensemble des requêtes combinées n'ont pas encore été soumises
              if (requestListLength < numberOfRequests) {
                pmLog.debug({message: "La requête ajoutée n'est pas la dernière des requêtes combinées : requête {{requestListLength}} / {{numberOfRequests}}",
                  params: {requestListLength: requestListLength, numberOfRequests: numberOfRequests}, tag: "params", object: objectName, method: "_addRequest"});
                return promise;
              }

              // récupération des requêtes
              for (var i = 0; i < numberOfRequests; i++) {
                requestObjects = angular.copy(_requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].requestObjects);
                for (var j = 0, length2 = requestObjects.length; j < length2; j++) {
                  backRequestObjects.push(requestObjects[j]);
                }
              }

              // aucune requête à effectuer => résoud toutes les promesses
              if (backRequestObjects.length === 0) {
                pmLog.debug({message: "Aucune requête à effectuer => résoud toutes les promesses.", tag: "debug", object: objectName, method: "_addRequest"});
                for (var i = 0; i < numberOfRequests; i++) {
                  _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.resolve([]);
                }
                delete _requestList['concatId_' + options.concat.concatId];
                return promise;
              }

              // requête simple
            } else {
              backRequestObjects = angular.copy(options.requestObjects);
            }


            // soumission de la requête
            pmBackComHandler.post('crud/' + method, backRequestObjects)
                .then(function(response) {

                  var requestLength = 0,
                      responseObjects = [],
                      unitResponse = {};
                  // requête simple
                  if (options.concat === undefined) {
                    var responseLength = response.length;
                    for (var i = 0; i < responseLength; i++) {
                      responseObjects.push(response[i].UnitResponse);
                    }

                    pmLog.debug({message: "Réponse avec succès à une requête simple. responseObjects={{responseObjects}}",
                      params: {responseObjects: responseObjects}, tag: "resolve", object: objectName, method: "_addRequest"});
                    deferred.resolve(responseObjects);
                    return;
                  }


                  // requête combinée
                  for (var i = 0; i < numberOfRequests; i++) {
                    responseObjects = [];
                    requestLength = _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].requestObjects.length;
                    // il n'y avait pas de requête : résoud à vide
                    if (requestLength === 0) {
                      pmLog.debug({message: "Réponse à vide à une requête combinée : requête numéro {{i}}",
                        params: {i: i}, tag: "resolve", object: objectName, method: "_addRequest"});
                      _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.resolve([]);

                    } else {
                      // ajoute les objets
                      for (var j = 0; j < requestLength; j++) {
                        unitResponse = response.shift();
                        responseObjects.push(unitResponse.UnitResponse);
                      }
                      pmLog.debug({message: "Réponse à une requête combinée : requête numéro {{i}}|requestObjects={{requestObjects}}",
                        params: {i: i, requestObjects: responseObjects}, tag: "resolve", object: objectName, method: "_addRequest"});
                      _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.resolve(responseObjects);
                    }
                  }
                  delete _requestList['concatId_' + options.concat.concatId];
                })
                .catch(function(response) {
                  if (response.hasPerformRedirect === true) {
                    // requête simple
                    if (options.concat === undefined) {
                      deferred.reject(response);
                      return;
                    }
                    // requête combinée
                    for (var i = 0; i < numberOfRequests; i++) {
                      _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.reject(response);
                    }
                    return;
                  }

                  var requestLength = 0,
                      responseObjects = [];
                  // requête simple
                  if (options.concat === undefined) {
                    requestLength = options.requestObjects.length;
                    for (var i = 0; i < requestLength; i++) {
                      responseObjects.push(response);
                    }
                    deferred.resolve(responseObjects);
                    return;
                  }

                  // requête combinée
                  for (var i = 0; i < numberOfRequests; i++) {
                    responseObjects = [];
                    requestLength = _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].requestObjects.length;
                    // il n'y avait pas de requête : résoud à vide
                    if (requestLength === 0) {
                      _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.resolve([]);
                    } else {
                      // ajoute les objets
                      for (var j = 0; j < requestLength; j++) {
                        responseObjects.push(response);
                      }
                      _requestList['concatId_' + options.concat.concatId]['requestNumber_' + i].deferred.resolve(responseObjects);
                    }
                  }
                  delete _requestList['concatId_' + options.concat.concatId];
                });
            return promise;
          };


          //********************
          // Factory
          //********************

          var _factory = {
            /*
             * Ajoute une requête combinée et renvoie l'identifiant
             * 
             * @param {integer} numberOfRequests Combien y aura-t-il de requêtes en tout ?
             * @return {string} concatId
             */
            addConcatRequest: function(numberOfRequests) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "addConcatRequest", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "addConcatRequest"});

              if (typeof numberOfRequests !== 'number' || numberOfRequests < 1) {
                pmLog.error({message: "Erreur de paramètre de méthode. NumberOfRequests doit être un integer > 0. Paramètre passé : {{{numberOfRequestsType}}}{{numberOfRequests}}",
                  params: {numberOfRequestsType: typeof numberOfRequests, numberOfRequests: numberOfRequests}, tag: "params", object: objectName, method: "addConcatRequest"});
                throw new Error("Erreur de paramètre de méthode. NumberOfRequests doit être un integer > 0.");
              }

              var concatId = (_concatList.push(numberOfRequests) - 1);
              _requestList['concatId_' + concatId] = {};
              pmLog.debug({message: "concatId={{concatId}}",
                params: {concatId: concatId}, tag: "return", object: objectName, method: "addConcatRequest"});
              return concatId;
            },
            /*
             * Fait un read
             * 
             * @param {object} options 
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   method: {undefined|string},
             *   requests: [
             *     {
             *       cache: {undefined}|{
             *         namespace: {string},
             *         key: {string},
             *         lifetime: {undefined|integer},
             *         forceBackRead: {undefined|boolean}, // force la requête vers le back même si la donnée est en cache
             *         isForbiddenPutInCache: {undefined|boolean}
             *       },
             *       request: {
             *         query: {string},
             *         searchCriteria: {undefined|array},
             *         itemsPerPage: {undefined|integer},
             *         page: {undefined|integer}
             *       },
             *       isUnique: {undefined|boolean} // la requête renverra 0 ou 1 objet
             *     },
             *     {...}
             *   ]
             * }
             * @return {object} Promise
             */
            read: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "read", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "read"});

              var deferred = $q.defer(),
                  requestsLength = options.requests.length,
                  resultObject = {},
                  cacheResult,
                  requestsResult = [],
                  backRequestObject = {},
                  backRequestObjectsList = [],
                  requestResultBackRequestObjectsMapping = [];

              if (requestsLength === 0) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode.", tag: "params", object: objectName, method: "read"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }

              for (var i = 0; i < requestsLength; i++) {
                // recherche en cache
                cacheResult = undefined;
                if (options.requests[i].cache !== undefined && options.requests[i].cache.forceBackRead !== true) {
                  cacheResult = pmCache.get(options.requests[i].cache.namespace, options.requests[i].cache.key);
                }

                if (cacheResult !== undefined) {
                  resultObject = {
                    isFromBack: false,
                    result: cacheResult
                  };
                  requestsResult.push(resultObject);
                  // requête vers le back
                } else {
                  requestsResult.push({});
                  backRequestObject = {
                    SelectQuery: {
                      query: options.requests[i].request.query
                    }
                  };
                  if (options.requests[i].request.searchCriteria !== undefined) {
                    backRequestObject.SelectQuery.searchCriteria = options.requests[i].request.searchCriteria;
                  }
                  if (options.requests[i].request.itemsPerPage !== undefined) {
                    backRequestObject.SelectQuery.itemsPerPage = options.requests[i].request.itemsPerPage;
                  }
                  if (options.requests[i].request.page !== undefined) {
                    backRequestObject.SelectQuery.page = options.requests[i].request.page;
                  }
                  backRequestObjectsList.push(backRequestObject);
                  requestResultBackRequestObjectsMapping.push(i);
                }
              }

              // Envoi vers le back
              // si c'est une requêtes combinée, il faut obligatoirement utiliser _addRequest
              if (backRequestObjectsList.length > 0 || options.concat !== undefined) {
                _addRequest((options.method || "read"), {
                  concat: options.concat,
                  requestObjects: backRequestObjectsList
                })
                    .then(function(response) {

                      var backRequestObjectsListLength = backRequestObjectsList.length,
                          backObjectsLength = response.length,
                          resultObjects = [];

                      // il n'y avait pas de requête
                      if (backRequestObjectsListLength === 0) {
                        deferred.resolve(requestsLength === 1 ? requestsResult[0] : requestsResult);
                        return;
                      }

                      // il y avait des requêtes
                      for (i = 0; i < backObjectsLength; i++) {
                        if (response[i].result === 'success') {
                          resultObjects = response[i].objects;
                          if (options.requests[i].isUnique === true) {
                            if (resultObjects.length === 0) {
                              resultObjects = undefined;
                            } else {
                              resultObjects = resultObjects[0];
                            }
                          }
                          // mise en cache
                          if (options.requests[i].cache !== undefined && options.requests[i].cache.isForbiddenPutInCache !== true) {
                            pmCache.put(options.requests[i].cache.namespace, options.requests[i].cache.key, resultObjects, options.requests[i].cache.lifetime);
                          }
                        } else {
                          if (response[i].errorType === undefined) {
                            response[i].errorType = 'back-unitresponse-object-error';
                          }
                          if (response[i].errorCode === undefined) {
                            response[i].errorCode = 'back-unitresponse-object-error';
                          }

                          resultObjects = response[i];
                        }

                        resultObject = {
                          isFromBack: true,
                          result: resultObjects
                        };
                        requestsResult[requestResultBackRequestObjectsMapping[i]] = resultObject;

                      }
                      deferred.resolve(requestsLength === 1 ? requestsResult[0] : requestsResult);
                    })
                    .catch(function(response) {
                      // on a un reject que s'il y a un un redirect
                      // => propage le reject
                      deferred.reject(response);
                    });
              } else {
                deferred.resolve(requestsLength === 1 ? requestsResult[0] : requestsResult);
              }

              return deferred.promise;
            },
            /*
             * Fait un create, un update ou un delete
             * 
             * @param {object} options 
             * options = {
             *   concat: {undefined}|{
             *     concatId: {integer},
             *     requestNumber: {integer}
             *   },
             *   action: {string}, // "create"|"update"|"delete"
             *   requests: [
             *     {
             *       cache: {undefined}|{
             *         namespace: {string},
             *         key: {string},
             *         lifetime: {undefined|integer},
             *         isForbiddenPutInCache: {undefined|boolean}
             *       },
             *       object: {}
             *     },
             *     {...}
             *   ]
             * }
             * @return {object} Promise
             */
            createUpdateDelete: function(options) {
              pmLog.trace({message: "Entrée méthode", object: objectName, method: "createUpdateDelete", tag: "methodEntry"});
              pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: objectName, method: "createUpdateDelete"});

              var deferred = $q.defer(),
                  requestsLength = options.requests.length,
                  requestsResult = [],
                  backRequestObjectsList = [];

              if (requestsLength === 0 || ["create", "update", "delete"].indexOf(options.action) < 0) {
                pmLog.error({message: "Erreur de paramètres en entrée de méthode.", tag: "params", object: objectName, method: "createUpdateDelete"});
                throw new Error('Erreur de paramètres en entrée de méthode.');
              }

              for (var i = 0; i < requestsLength; i++) {
                backRequestObjectsList.push(options.requests[i].object);
              }

              // Envoi vers le back
              _addRequest(options.action, {
                concat: options.concat,
                requestObjects: backRequestObjectsList
              })
                  .then(function(response) {

                    var resultObject = {};

                    // il y avait des requêtes
                    for (i = 0; i < requestsLength; i++) {
                      if (response[i].result === 'success') {

                        resultObject = response[i].objects[0];
                        // mise en cache
                        if (options.requests[i].cache !== undefined && options.requests[i].cache.isForbiddenPutInCache !== true) {
                          if (options.action === 'delete') {
                            pmCache.remove(options.requests[i].cache.namespace, options.requests[i].cache.key);
                          } else {
                            pmCache.put(options.requests[i].cache.namespace, options.requests[i].cache.key, resultObject, options.requests[i].cache.lifetime);
                          }
                        }
                      } else {
                        if (response[i].errorType === undefined) {
                          response[i].errorType = 'back-unitresponse-object-error';
                        }
                        if (response[i].errorCode === undefined) {
                          response[i].errorCode = 'back-unitresponse-object-error';
                        }
                        resultObject = response[i];
                      }
                      requestsResult.push(resultObject);
                    }
                    deferred.resolve(requestsResult);
                  })
                  .catch(function(response) {
                    // on a un reject que s'il y a un un redirect
                    // => propage le reject
                    deferred.reject(response);
                  });

              return deferred.promise;
            }
          };
          return _factory;
        }]
          );
// fin IIFE
})();