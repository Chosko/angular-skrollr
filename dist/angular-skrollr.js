/*! angular-skrollr - v0.1.5 - 2016-03-06 */
"use strict";
/**
 * Wrap skrollr.js
 * @author SOON_
 * @module sn.skrollr
 */
angular.module("sn.skrollr", [])

/**
 * Provider to configuring skrollr
 * @example
 *      snSkrollrProvider.config({ smoothScrolling: true });
 *      snSkrollr.init();
 */
.provider("snSkrollr", function snSkrollrProvider() {

    var _this = this;

    /**
     * Skrollr initialisation options
     * @property {Object} config
     */
    this.config = {};

    /**
     * Instance of Skrollr
     * @property {Object}  skrollrInstance
     */
    this.skrollrInstance = {};

    /**
     * Has the skrollInstance been initialised
     * @property {Boolean} hasBeenInitialised
     */
    this.hasBeenInitialised = false;

    /**
     * Methods returned on snSkrollr service
     * @property {Object} serviceMethods
     */
    this.serviceMethods = {};

    /**
     * snSkroller service
     */
    this.$get = [
        "$window",
        "$document",
        "$rootScope",
        /**
         * @constructor
         * @param   {Object}  $window    angular wrapper for window
         * @param   {Object}  $document  angular wrapper for document
         * @param   {Object}  $rootScope angular root application scope
         */
        function($window, $document, $rootScope) {

            _this.serviceMethods = {

                /**
                 * Initialise skrollrjs with config options
                 * @method init
                 */
                init: function(config) {

                    var skrollrConfig = config ? config : _this.config,
                        skrollrInit = function skrollrInit(){
                        _this.skrollrInstance = $window.skrollr.init(skrollrConfig);
                        _this.hasBeenInitialised = true;
                        _this.serviceMethods.refresh();
                    };

                    $document.ready(function () {
                        if (!$rootScope.$$phase) {
                            $rootScope.$apply(skrollrInit);
                        } else {
                            skrollrInit();
                        }
                    });

                },

                /**
                 * Call refresh on Skrollr instance
                 * Useful for resetting skrollr after modifying the DOM
                 * @method refresh
                 */
                refresh: function($element) {
                    if (_this.hasBeenInitialised) {
                        _this.skrollrInstance.refresh($element);
                    }
                },

                /**
                 * Call skrollr.destroy()
                 * @method refresh
                 */
                destroy: function() {
                    if (_this.hasBeenInitialised) {
                        _this.skrollrInstance.destroy();
                        _this.hasBeenInitialised = false;
                    }
                },

                getSkrollrInstance: function () {
                  if (_this.hasBeenInitialised) {
                      return _this.skrollrInstance;
                  }
                  else {
                    return null;
                  }
                }
            };

            return _this.serviceMethods;
        }
    ];
})

/**
 * Refresh skrollrjs on element init
 * @class  snSkrollr
 */
.directive("snSkrollr", [
    "$timeout",
    "$window",
    "snSkrollr",
    /**
     * @constructor
     */
    function ($timeout, $window, snSkrollr){
        return {
            restrict: "AE",
            link: function($scope, $element) {

                /**
                 * delay refresh to allow time for
                 * template to render
                 * @property timer
                 */
                $scope.timer = $timeout(function(){
                    snSkrollr.refresh($element);
                }, 100);

                /**
                 * Event handler for scroll and resize. Cancel timer if there
                 * is an active one and then create a new timer to replace.
                 * This is so we can wait until the user has finished scrolling
                 * before calling refresh. This helps with performance.
                 * @method onChange
                 */
                $scope.onChange = function onChange(){
                    if ($scope.timer) {
                        $timeout.cancel($scope.timer);
                    }

                    $scope.timer = $timeout(function(){
                        snSkrollr.refresh($element);
                    }, 200);
                };

                angular.element($window).on("scroll", $scope.onChange);
                angular.element($window).on("resize", $scope.onChange);

            }
        };
    }
]);
