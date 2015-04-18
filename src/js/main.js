// 'use strict';
// public
var $ = require('jquery');
var _ = require('lodash');

//angular public
var angular = require('angular');
require('angular-route');
require('angular-resource');


//mine
var Logger = require('./lib/logger');
var ViewConstant = require('./constant/viewconstant');

//my angular


//angular
angular.module('opentsdbnw', ['ngRoute', 'ngResource']).service('AppConfig', function() {
    var self = {};
    self.tsdbHost = 'http://192.168.1.100',
    self.tsdbPort = '4242';
    return self;
}).service('TsdbClient', function(AppConfig, $http, $q) {
    Logger.log('Constructing TsdbClient', AppConfig, $http, $q);

    var self = {};
    self._ENDPOINTS = {
        s: '/s',
        aggregators: '/api/aggregators',
        annotation: '/api/annotation',
        config: '/api/config',
        dropcaches: '/api/dropcaches',
        put: '/api/put',
        query: '/api/query',
        search: '/api/search',
        serializers: '/api/serializers',
        stats: '/api/stats',
        suggest: '/api/suggest',
        tree: '/api/tree',
        uid: '/api/uid',
        version: '/api/version',
        logs : '/logs?json'
    };
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
    .when('/tsdbversion', {
        controller: 'TsdbVersionController',
        templateUrl: ViewConstant.tsdbverion
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
}).controller('TsdbVersionController', function($scope, TsdbClient) {
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

