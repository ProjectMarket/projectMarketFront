/** 
 * Directive abxActionGroup - Encapsule des actions multiples
 * 
 * @author     Vincent Guédé (vincent.guede@ac-bordeaux.fr)
 * @author     Sébastien Monbrun (sebastien.monbrun@ac-bordeaux.fr)
 * @author     Steve Van Wassenhoven (steve.vw@ac-bordeaux.fr)
 * @copyright  Copyright (c) 2014-2016, DSI de l'académie de Bordeaux (ce.dsi@ac-bordeaux.fr) - Tous droits réservés
 * @license    http://www.gnu.org/licenses/gpl.html  GNU/GPL License 3.0
 * @version    $Id: group-directive.js 621 2016-02-29 16:43:23Z vguede $
 */

/* global angular */

// encapsulation dans une IIFE
(function() {

  'use strict';

  // nom de la directive
  var directiveName = 'abxActionGroup';

  //***********
  // Directive
  //***********
  angular
      .module('abx.commonModule')
      .directive(directiveName,
          ['abx.common.logService',
            Directive]);

  function Directive(
      abxLog
      ) {

    abxLog.trace({message: "Instanciation objet", object: directiveName, tag: "objectInstantiation"});

    // directive
    return {
      restrict: 'E',
      scope: {},
      controller: function($scope, $element, $attrs) {

        var _this = this,
            lastUid = -1;
        
        var checkActions = function() {
          var selected = 0,
              total = 0;
          
          for (var action in _this.actionList.actions) {
            selected += _this.actionList.actions[action].selected;
            total += _this.actionList.actions[action].total;
          }
          _this.actionList.selected = selected;
          _this.actionList.total = total;
        };

        
        _this.selectList = {};
        _this.actionList = {
          actions: {},
          selected: 0,
          total: 0
        };
        _this.watchList = {};

        _this.addSelect = function(selectScope) {

          var uid = 'uid_' + ++lastUid;
          selectScope.uid = uid;

          _this.selectList[uid] = {
            scope: selectScope
          };

          _this.watchList[uid] = $scope.$watch(
              function() {
                return [
                  selectScope.actions,
                  (selectScope.vm.isSelected || false)
                ];
              },
              function(newValue, oldValue) {
                var newActions = newValue[0],
                    newIsSelected = newValue[1],
                    oldActions = oldValue[0],
                    oldIsSelected = oldValue[1];

                if (newValue === oldValue) {
                  for (var action in newActions) {
                    if (_this.actionList.actions[action] === undefined) {
                      _this.actionList.actions[action] = {
                        selected: 0,
                        total: 0
                      };
                    }
                    if (newActions[action]) {
                      _this.actionList.actions[action].total++;
                    }
                    if (newIsSelected) {
                      _this.actionList.actions[action].selected++;
                    }
                  }
                  checkActions();
                  return;
                }

                if (!angular.equals(newActions, oldActions)) {

                  for (var action in newActions) {
                    if (_this.actionList.actions[action] === undefined) {
                      abxLog.error({message: "Une nouvelle action a été ajoutée dynamiquement. action={{action}}",
                        params: {action: action}, tag: "$watch", object: directiveName, method: "controller"});
                      throw new Error("Il est interdit de rajouter des actions de façon dynamique");
                    }

                    if (newActions[action] === oldActions[action]) {
                      continue;
                    }
                    if (newActions[action]) {
                      _this.actionList.actions[action].total++;

                      if (newIsSelected) {
                        _this.actionList.actions[action].selected++;
                      }
                    } else {
                      _this.actionList.actions[action].total--;
                      if (oldIsSelected) {
                        _this.actionList.actions[action].selected--;
                      }

                    }
                  }

                  checkActions();

                } else if (newIsSelected !== oldIsSelected) {
                  for (var action in newActions) {
                    if (newActions[action]) {
                      newIsSelected ? _this.actionList.actions[action].selected++ : _this.actionList.actions[action].selected--;
                    }
                  }
                  checkActions();
                }
              },
              true
              );

          return uid;
        };


        _this.deleteSelect = function(uid) {

          // suppression du $watch
          _this.watchList[uid]();
          var selectScope = _this.selectList[uid].scope;

          for (var action in selectScope.actions) {
            if (selectScope.actions[action]) {
              _this.actionList.actions[action].total--;
              if (selectScope.vm.isSelected) {
                _this.actionList.actions[action].selected--;
              }
            }
          }

          checkActions();

          delete _this.watchList[uid];
          delete _this.selectList[uid];
        };
        
        
        _this.checkUncheckAll = function(check) {
          for (var uid in _this.selectList) {
            _this.selectList[uid].scope.vm.isSelected = check;
          }
        };
        
        _this.getSelectedIds = function(action) {
          var ids = [];
          for (var uid in _this.selectList) {
            if (_this.selectList[uid].scope.vm.isSelected && _this.selectList[uid].scope.actions[action]) {
              ids.push(_this.selectList[uid].scope.id);
            }
          }
          return ids;
        };

      }
    };
  }

// fin IIFE
})();