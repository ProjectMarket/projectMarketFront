/** 
 * Component pm.core.userComponent
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global angular */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var componentName = 'pm.core.userComponent';

    //***********
    // Component
    //***********
    angular
            .module('pm.components.coreModule')
            .component(componentName, {
                $canActivate: ['pm.common.routerService',
                    function (pmRouter) {
                        return pmRouter.canActivate(componentName);
                    }],
                require: {
                    pmAppController: '^pm.appComponent'
                },
                templateUrl: 'app/components/core/user/user-component.html',
                controller: [
                    'pm.common.logService',
                    'pm.common.routerService',
                    'pm.common.authService',
                    'pm.common.userService',
                    'pm.common.flashMessageService',
                    'pm.common.userModel',
                    '$mdSidenav',
                    Controller]
            });



    //************
    // Controller
    //************
    function Controller(
            pmLog,
            pmRouter,
            pmAuth,
            pmUser,
            pmFlashMessage,
            pmUserModel,
            $mdSidenav
            ) {

        pmLog.trace({message: "Instanciation objet", object: componentName, tag: "objectInstantiation"});

        //********************
        // Propriétés privées
        //********************

        /*
         * @property {object} this
         */
        var _this = this;

        /*
         * @property {object} paramètres de la route
         */
        var _routeParams = {};

        /*
         * Action du formulaire
         * 
         * @property {string} "create"|"update"
         */
        var _formAction = '';

        /*
         * Objets reçus du back
         * 
         * @property {object} 
         */
        var _backObjects = {};


        var allMuppets = [];
        //******************
        // Méthodes privées
        //******************

        /*
         * Affectation des données pour la vue
         * 
         * @param {object} result
         * @returns {void}
         */

        var _populateViewModel = function (result) {
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "_populateViewModel", tag: "methodEntry"});
            pmLog.debug({message: "Paramètres méthode : {{params}}",
                params: {params: arguments}, tag: "params", object: componentName, method: "_populateViewModel"});
            
            vm.userAccount = {
                firstname: result.firstname,
                lastname: result.lastname,
                email: result.email,
                avatar: result.avatar,
                createdAt: result.createdAt
            };
        };
        var _loadMuppets = function() {
             var muppets = [{
                  name: 'Animal',
                  iconurl: 'https://lh3.googleusercontent.com/-KGsfSssKoEU/AAAAAAAAAAI/AAAAAAAAAC4/j_0iL_6y3dE/s96-c-k-no/photo.jpg',
                  imgurl: 'http://muppethub.com/wp-content/uploads/2014/02/Animal-7.png',
                  content: 'Animal is the wild and frenzied drummer of Dr. Teeth and The Electric Mayhem, the fictional band from The Muppet Show. He is one of the Muppets originally created by Michael K. Frith.'
              }, {
                  name: 'Fozzie Bear',
                  iconurl: 'https://yt3.ggpht.com/-cEjxni3_Jig/AAAAAAAAAAI/AAAAAAAAAAA/cMW2NEAUf-k/s88-c-k-no/photo.jpg',
                  imgurl: 'http://i.ytimg.com/vi/x-OdqmzkuRg/maxresdefault.jpg',
                  content: 'Fozzie Bear is a Muppet character created by Jim Henson and developed by Frank Oz. Fozzie is an orange-brown, fozzie bear who often wears a brown pork pie hat and a red-and-white polka-dot necktie. The character debuted on The Muppet Show, as the show\'s stand-up comic, a role where he constantly employed his catchphrase, "Wocka Wocka Wocka!". Shortly after telling the joke, he was usually the target of ridicule, particularly from balcony hecklers Statler and Waldorf.'
              }, {
                  name: 'The Swedish Chef',
                  iconurl: 'https://goingforwardblog.files.wordpress.com/2013/01/swedish-chef.jpg',
                  imgurl: 'http://muppetmindset.files.wordpress.com/2012/02/8ff4c-ms_sc_05.jpg',
                  content: 'The Swedish Chef is a Muppet character that appeared on The Muppet Show. He was originally performed by Jim Henson and Frank Oz simultaneously, with Henson performing the head and voice and Oz performing the character\'s live hands. The Swedish Chef is now performed by Bill Barretta.'
              }, {
                  name: 'Cookie Monster',
                  iconurl: 'https://lh5.googleusercontent.com/-c5rVqhf66e4/UVIKJ3fXLFI/AAAAAAAAACU/s-TU4ER7-Ro/w800-h800/kimmie.jpg',
                  imgurl: 'http://bakadesuyo.bakadesuyo.netdna-cdn.com/wp-content/uploads/2013/12/ways-to-increase-willpower.jpg',
                  content: 'Cookie Monster is a Muppet on the long running children\'s television show Sesame Street. He is best known for his voracious appetite and his famous eating phrases: "Me want cookie!", "Me eat cookie!", and "Om nom nom nom" (said through a mouth full of food). He often eats anything and everything, including danishes, donuts, lettuce, apples, bananas, as well as normally inedible objects. However, as his name suggests, his preferred food is cookies. Chocolate chip cookies are his favorite kind; oatmeal cookies are his second favorite.'
              }];
                allMuppets = muppets;
                vm.muppets = [].concat(muppets);
                console.log("LOAD !!!!: ",vm.muppets);
                vm.selected = vm.muppets[0];
      };

        //*********************
        // Propriétés du scope
        //*********************

        /*
         * @property {object} vue-modèle
         */
        var vm = _this.vm = {};

        /*
         * @property {string} Action du formulaire (create|update)
         */
        vm.formAction = '';

        /*
         * @property {boolean} le hook $routerOnActivate est-t-il terminé ?
         */
        vm.canDisplayView = false;

        /*
         * @property {boolean} Ce compte est-il le mien ?
         */
        vm.isMyAccount = false;
        
        /*
         * @property {object} Compte à afficher
         */
        vm.userAccount = {};

        /*
         * Suppression du compte
         * 
         * @returns {void}
         */
        vm.delete = function () {
            pmUserModel.delete()
                    .then(function (response) {
                        pmFlashMessage.showSuccess("Votre compte a bien été supprimé.");
                        pmAuth.logout();
                    })
                    .catch(function (response) {

                    });
        };

        vm.toggleSidenav = function(name) {
            console.log("toggleSidenav !!!!!",name);
            $mdSidenav(name).toggle();
        };
  
        vm.selectMuppet = function(muppet) {
            console.log("selectMuppet !!!!!",muppet);
            vm.selected = angular.isNumber(muppet) ? vm.muppets[muppet] : muppet;
             console.log("selected !!!!!",vm.selected);
            vm.toggleSidenav('left');
        };



        //*******************
        // Méthodes du scope
        //*******************


        //************
        // Listeners
        //************



        //****************************
        // Méthodes du lifecycle hook
        //****************************

        /*
         * Hook lancé juste avant la fin de la navigation
         * 
         * @param {object} ComponentInstruction nextInstruction Composant en cours
         * @param {object} ComponentInstruction prevInstruction Composant précédent
         * @return {void} 
         */
        _this.$routerOnActivate = function (nextInstruction, prevInstruction) {
            var routeParams = angular.copy(nextInstruction.params);
            pmLog.trace({message: "Entrée méthode", object: componentName, method: "$onActivate", tag: "methodEntry"});
            pmLog.debug({message: "$routeParams : {{routeParams}}", params: {routeParams: routeParams}, tag: "$routeParams", object: componentName});

            _this.pmAppController.vm.setModule('core.user');

            vm.selected = null;
            vm.muppets = allMuppets;

            _loadMuppets();


            try {
                var userId = parseInt(routeParams.userId);
                userId = isNaN(userId) ? undefined : userId;

                vm.isMyAccount = userId === pmUser.getAccountId();

                if (userId !== undefined) {
                    pmUserModel.readById({userId: userId})
                            .then(function (response) {
                                _routeParams = routeParams;
                                _populateViewModel(response);
                                vm.canDisplayView = true;
                            })
                            .catch(function (response) {
                                var errorMessage = "Erreur lors de la récupération de l'utilisateur.";
                                pmLog.error({message: errorMessage,
                                    tag: "error", object: componentName, method: "$routerOnActivate"});
                                var options = {
                                    errorMessage: errorMessage,
                                    adviceMessage: "Vous ne pouvez pas visualiser les informations de l'utilisateur."
                                };
                                pmFlashMessage.showError(options);
                                pmRouter.navigate(['Core.home']);
                            });
                } else {
                    pmLog.error({message: "Impossible de récupérer un User depuis le back : userId={{userId}}.", object: componentName,
                        params: {userId: routeParams.userId}, tag: "settings", method: "$routerOnActivate"});
                    pmRouter.navigate(['Core.home']);
                }
            } catch (e) {
                var errorMessage = "Erreur lors de la récupération de l'utilisateur.";
                pmLog.error({message: errorMessage + " Message d'exception={{exceptionMessage}}",
                    params: {exceptionMessage: e.message}, tag: "error", object: componentName, method: "$routerOnActivate"});
                var options = {
                    errorMessage: errorMessage,
                    adviceMessage: "Vous ne pouvez pas visualiser les informations de l'utilisateur.",
                    errorObject: {errorMessage: e.message}
                };
                pmFlashMessage.showError(options);
                pmRouter.navigate(['Core.home']);
            }
        };

    }

// fin IIFE
})();