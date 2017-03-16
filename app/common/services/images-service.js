/** 
 * Service de gestion des images
 * 
 * @author     Romain Poussin (romain.poussin@ynov.com)
 * @author     Baptiste Lanusse (baptiste.lanusse@ynov.com)
 * @author     Zineddine Vergne (zineddine.vergne@ynov.com)
 */

/* global moment */

// encapsulation dans une IIFE
(function () {

    'use strict';

    var objectName = 'pm.common.imagesService';

    angular
            .module('pm.commonModule')
            .factory(objectName, [
                '$q',
                'pm.common.routerService',
                'Upload',
                'cloudinary',
                function (
                        $q,
                        pmRouter,
                        $upload,
                        cloudinary
                        ) {

                    //********************
                    // Propriétés privées
                    //********************


                    //********************
                    // Méthodes privées
                    //********************


                    //********************
                    // Factory
                    //********************

                    var _factory = {
                        /*
                         * Méthode d'envoie des images sur Cloudinary
                         * 
                         * @param files {files} fichier image à sauvegarder
                         * @param {options} options d'envoie de l'image
                         */
                        uploadFiles: function (files, tags) {

                            if (tags === undefined) {
                                pmRouter.navigate(['404', 'params']);
                            }

                            var d = new Date(),
                                    deferrred = $q.defer();
                            var title = "Image (" + d.getDate() + " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ")";

                            if (!files)
                                return;
                            angular.forEach(files, function (file) {
                                if (file && !file.$error) {
                                    file.upload = $upload.upload({
                                        url: "https://api.cloudinary.com/v1_1/" + cloudinary.config().cloud_name + "/upload",
                                        data: {
                                            api_key: cloudinary.config().api_key,
                                            api_secret: cloudinary.config().api_secret,
                                            tags: tags,
                                            context: 'photo=' + title,
                                            file: file,
                                            upload_preset: cloudinary.config().upload_preset
                                        },
                                        withCredentials: false
                                    }).progress(function (e) {
                                        file.progress = Math.round((e.loaded * 100.0) / e.total);
                                        file.status = "Uploading... " + file.progress + "%";
                                    }).success(function (data, status, headers, config) {
                                        deferrred.resolve(data.url);
                                    }).error(function (data, status, headers, config) {
                                        deferrred.reject();
                                    });
                                }
                            });
                            return deferrred.promise;
                        }
                    };
                    return _factory;
                }
            ]);

// fin IIFE
})();