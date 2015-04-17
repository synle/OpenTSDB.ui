'use strict';

//mine
var Logger = (function() {
    var self = {};
    self._errors = [];
    self.log = function() {
        console.log(arguments)
    }
    self.error = function() {
        console.error(arguments);
        self._errors.push(arguments);
    }
    return self;
})();


//angular
angular.module('opentsdbnw', ['ngRoute', 'ngResource'])
.service('AppConfig', function() {
    var self = {};
    self.tsdbHost = 'http://192.168.1.100',
    self.tsdbPort = '4242',
    self.getTsdbFullHost = function() {
        return self.tsdbHost + ':' + self.tsdbPort;
    }
    return self;
})
.service('ViewConstant', function() {
    return {
        settings : 'public/view/settings.html',
        tsdbverion : 'public/view/tsdbverion.html',
        header : 'public/view/common/header.html'
    }
})
.service('TsdbClient', function(AppConfig, $http, $q) {
    var ENDPOINTS = {
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
        version: '/api/version'
    }
    var self = {};
    var wrapHttpPromise = function(httpFun){
        var defer = $q.defer();

        httpFun.then(function(r){
            //success
            if (r.data){
                defer.resolve(r.data);
            }
            else{
                defer.reject('no data');
            }
        }, function(err){
            Logger.error('wrapHttpPromise failed', err)
            defer.reject(err);
        });

        return defer.promise;
    }


    self.version = function() {
        return wrapHttpPromise(
            $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.version)
        );
    }
    self.getAggregators = function() {
        return wrapHttpPromise(
            $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.aggregators)
        );
    }
    self.serializers = function() {
        return wrapHttpPromise(
            $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.serializers)
        );
    }
    return self;
})
//navs
.config(function($routeProvider, ViewConstant) {
    $routeProvider.when('/settings', {
        controller: 'SettingController',
        templateUrl: ViewConstant.settings
    }).when('/tsdbversion', {
        controller: 'TsdbVersionController',
        templateUrl: ViewConstant.tsdbverion
    }).otherwise({
        redirectTo: '/settings'
    });
})
// controllers
.controller('HeaderController', function($scope, AppConfig, ViewConstant) {
    $scope.templateUrl = ViewConstant.header;

})
.controller('SettingController', function($scope, AppConfig) {
    $scope.appConfig = AppConfig;
    $scope.origAppConfig = _.cloneDeep(AppConfig);
    $scope.save = function() {
        $scope.origAppConfig = _.cloneDeep($scope.appConfig);
        //needs to save to file
    }
    $scope.cancel = function() {
        $scope.appConfig = _.cloneDeep($scope.origAppConfig);
    }
}).controller('TsdbVersionController', function($scope, TsdbClient) {
    $scope.versions = 'loading';
    $scope.aggregators = 'loading';
    $scope.serializers = 'loading';
    $scope.refresh = function() {
        TsdbClient.version().then(function(r) {
            $scope.versions = r;
        }, function(r) {
            Logger.error('getVersion() failed', r)
        });
        TsdbClient.getAggregators().then(function(r) {
            $scope.aggregators = r;
        }, function(r) {
            Logger.error('getAggregators() failed', r)
        });
        TsdbClient.serializers().then(function(r) {
            $scope.serializers = r;
        }, function(r) {
            Logger.error('serializers() failed', r)
        });
    }
    //initial
    $scope.refresh();
})