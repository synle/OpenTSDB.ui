// 'use strict';
var origAppConfig = require('./appconfig');

// public
window.$ = require('jquery');
window._ = require('lodash');
window.moment = require('moment');
window.rome = require('rome/dist/rome.standalone.min.js');//date picker
window.insignia = require('insignia/dist/insignia.min.js');//tag list
window.horsey = require('horsey/dist/horsey.min.js');//autocomplete


//angular public
var angular = require('angular');
require('angular-route');
require('angular-resource');


//mine
var Logger = require('./lib/logger');
var GraphNormalizer = require('./lib/graphnormalizer.js');
var ViewConstant = require('./constant/viewconstant');
var Constant = require('./constant/constant');

//my angular
angular.module('opentsdbnw', ['ngRoute', 'ngResource', 'angular-chartist'])

//services
.service('AppConfig', function() {
    return origAppConfig;
}).service('TsdbClient', function(AppConfig, $http, $q) {
    Logger.log('Constructing TsdbClient', AppConfig, $http, $q);

    var self = {};
    self._ENDPOINTS = Constant.TSDB_ENDPOINTS;
    //private methods
    self._getTsdbFullHost = function(config) {
        return config.tsdbHost + ':' + config.tsdbPort;
    };
    self._wrapHttpPromise = function(httpFun) {
        var defer = $q.defer();
        httpFun().then(function(r) {
            //success
            if (r.data) {
                //resposne
                defer.resolve(r.data);
                //slow down response
                // setTimeout(function(){
                //     defer.resolve(r.data);
                // }, 35000);
            } else {
                defer.reject('no data');
            }
        }, function(err) {
            Logger.error('TsdbClient._wrapHttpPromise failed', err);
            defer.reject(err);
        });
        return defer.promise;
    };
    //constructors
    self.tsdbFullHost = self._getTsdbFullHost(AppConfig);
    //definitinons here
    self.version = function() {
        return self._wrapHttpPromise(function(){
            return $http.get(self.tsdbFullHost + self._ENDPOINTS.version);
        });
    };
    self.getAggregators = function() {
        return self._wrapHttpPromise(function(){
            return $http.get(self.tsdbFullHost + self._ENDPOINTS.aggregators);
        });
    };
    self.serializers = function() {
        return self._wrapHttpPromise(function(){
            return $http.get(self.tsdbFullHost + self._ENDPOINTS.serializers);
        });
    };
    self.log = function() {
        return self._wrapHttpPromise(function(){
            return $http.get(self.tsdbFullHost + self._ENDPOINTS.logs);
        });
    };

    self.query = function(requestData){
        return self._wrapHttpPromise(function(){
            return $http.post(
                self.tsdbFullHost + self._ENDPOINTS.query,
                requestData
            );
        });  
    }
    return self;
})
.service('ChartJsNormalizer', function(){
    //this needs to normalize data and config
    var self = {};

    self.normalizeConfig = function(tsdbData, styleConfig){

    }

    self.normalizeData = function(tsdbData){

    }

    return self;
})
//navs
.config(function($routeProvider) {
    $routeProvider.when('/settings', {
        controller: 'SettingController',
        templateUrl: ViewConstant.settings
    })
    .when('/query', {
        controller: 'QueryController',
        templateUrl: ViewConstant.query
    })
    .when('/tsdbsettings', {
        controller: 'TsdbSettingsController',
        templateUrl: ViewConstant.tsdbsettings
    })
    .when('/tsdblog', {
        controller: 'TsdbLogController',
        templateUrl: ViewConstant.tsdblog
    })
    .otherwise({
        redirectTo: '/query'
    });
})
// controllers
.controller('HeaderController', function($scope, AppConfig) {
    $scope.templateUrl = ViewConstant.header;
}).controller('SettingController', function($scope, AppConfig) {
    $scope.appConfig = AppConfig;
    $scope.origAppConfig = _.cloneDeep(AppConfig);
    $scope.save = function() {
        $scope.origAppConfig = _.cloneDeep($scope.appConfig);
        //needs to save to file
    };
    $scope.cancel = function() {
        $scope.appConfig = _.cloneDeep($scope.origAppConfig);
    };
}).controller('TsdbSettingsController', function($scope, TsdbClient) {
    $scope.versions = 'loading';
    $scope.aggregators = 'loading';
    $scope.serializers = 'loading';
    $scope.refresh = function() {
        $scope.versions = 'loading';
        $scope.aggregators = 'loading';
        $scope.serializers = 'loading';
        TsdbClient.version().then(function(r) {
            $scope.versions = r;
        }, function(r) {
            Logger.error('getVersion() failed', r);
        });
        TsdbClient.getAggregators().then(function(r) {
            $scope.aggregators = r;
        }, function(r) {
            Logger.error('getAggregators() failed', r);
        });
        TsdbClient.serializers().then(function(r) {
            $scope.serializers = r;
        }, function(r) {
            Logger.error('serializers() failed', r);
        });
    };
    //initial
    $scope.refresh();
})
.controller('QueryController', function($scope, TsdbClient) {
    $scope.query = {"start":"1428768937000","end":"1429373737000","queries":[{"aggregator":"zimsum","metric":"proc.loadavg.15min","rate":false,"tags":{},"downsample":"60m-avg"},{"aggregator":"zimsum","metric":"proc.loadavg.1min","rate":false,"tags":{},"downsample":"60m-avg"},{"aggregator":"zimsum","metric":"proc.loadavg.5min","rate":false,"tags":{},"downsample":"60m-avg"}]};
    $scope.tsdbData = [];

    $scope.save = function(){

    }

    $scope.render = function(){
        TsdbClient.query(
            $scope.query
        ).then(function(r){
            $scope.tsdbData = r;
        }, function(r){
            Logger.error('query() failed', r);
        });
    }

    //dummy chart data
    $scope.chartistData = {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      series: [
        [12, 9, 7, 8, 5],
        [2, 1, 3.5, 7, 3],
        [1, 3, 4, 5, 6]
      ]
    }
})
.controller('TsdbLogController', function($scope, TsdbClient) {
    $scope.logs = 'loading';

     $scope.refresh = function() {
        $scope.logs = 'loading';

        TsdbClient.log().then(function(r) {
            $scope.logs = r;
        }, function(r) {
            Logger.error('log() failed', r);
        });
    }

    //initial
    $scope.refresh();
});

