// Karma configuration
// Generated on Mon Nov 23 2015 10:47:46 GMT+0100 (Paris, Madrid)

module.exports = function (config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],
        // list of files / patterns to load in the browser
        files: [
            '../../local/pm-local-config.json.js',
            '../../lib/jquery/jquery.js',
            '../../app/pm.init.js',
            '../../lib/stacktrace/stacktrace.js',
            '../../lib/angular/angular.js',
            '../../lib/angular/angular-cookies.js',
            '../../lib/angular/angular-aria.js',
            '../../lib/angular/angular-animate.js',
            '../../lib/angular/angular-sanitize.js',
            '../../lib/componentRouter/angular_1_router.js',
            '../../lib/material/angular-material.js',
            '../../lib/angular-ui-select/select.js',
            '../../lib/moment/moment.min.js',
            '../../app/pm-app-module.js',
            '../../app/pm-app.config.js',
            '../../app/pm-app.run.js',
            '../../app/pm-app-controller.js',
            '../../app/common/common-module.js',
            '../../app/common/services/config-service.js',
            '../../app/common/services/moment-service.js',
            '../../app/common/services/stacktrace-service.js',
            '../../app/common/values/componentsSecurity-value.js',
            '../../app/common/services/cron-service.js',
            '../../app/common/services/log-service.js',
            '../../app/common/services/component-service.js',
            '../../app/common/services/cache-service.js',
            '../../app/common/services/cookie-service.js',
            '../../app/common/services/router-service.js',
            '../../app/common/services/exceptionHandler-service.js',
            '../../app/common/services/auth-service.js',
            '../../app/common/services/user-service.js',
            '../../app/common/services/backComHandler-service.js',
            '../../app/common/services/acl-service.js',
            '../../app/common/filters/profile-filter.js',
            '../../app/common/filters/school-filter.js',
            '../../app/common/filters/userName-filter.js',
            '../../app/common/directives/form/element/select/select-directive.js',
            '../../app/components/components-module.js',
            '../../app/components/core/core-module.js',
            '../../app/components/admin/admin-module.js',
            '../../app/components/layout-component.js',
            '../../app/components/core/error/error-component.js',
            '../../app/components/core/logout/logout-component.js',
            '../../app/components/core/index/index-component.js',
            '../../app/components/core/profile/profile-component.js',
            '../../app/components/core/home/home-component.js',
            '../../lib/angular/angular-mocks.js',
            '../../app/common/directives/form/element/select/select-directive.js',
            '../../app/common/services/log-service.js',
            '../../app/common/services/config-service.js',
            '../../app/common/services/cron-service.js',
            '../../app/common/services/stacktrace-service.js',
            '../../app/common/services/moment-service.js',
            '../../app/common/services/cacheBackManager-service.js',
            '../../app/common/services/modelManager-service.js',
            '../../app/common/services/cacheBackManager-service.js',
            '../../app/pm-app.bootstrap.js',
            'app/common/filters/userName-filter-spec.js',
            'app/common/filters/school-filter-spec.js',
            'app/common/services/cache-service-spec.js',
            'app/common/services/cookie-service-spec.js',
            'app/common/services/component-service-spec.js',
            'app/common/directives/form/element/select/select-directive-spec.js',
            'app/common/services/cron-service-spec.js',
            'app/common/services/acl-service-spec.js',
            'app/common/services/modelManager-service-spec.js',
            'app/common/services/cacheBackManager-service-spec.js',
            'app/common/services/auth-service-spec.js'

        ],
        // list of files to exclude
        exclude: [
        ],
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],
        // web server port
        port: 9876,
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,
        // Concurrency level
        // how many browser should be started simultanous
        concurrency: Infinity
    });
};
