//public
var Q = require('q');
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
angular.module('opentsdbnw', ['ngRoute', 'ngResource']).service('AppConfig', function() {
    var self = {};
    self.tsdbHost = 'http://192.168.1.100',
    self.tsdbPort = '4242',
    self.getTsdbFullHost = function() {
        return self.tsdbHost + ':' + self.tsdbPort +
    }
    return self;
}).service('TsdbClient', function(AppConfig, $http) {
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
    self.version = function() {
        return $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.version);
    }
    self.getAggregators = function() {
        return $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.aggregators)
    }
    self.serializers = function() {
        return $http.get(AppConfig.getTsdbFullHost() + ENDPOINTS.serializers)
    }
    return self;
}).config(function($routeProvider) {
    $routeProvider.when('/settings', {
        controller: 'SettingController',
        templateUrl: 'public/view/settings.html'
    }).when('/tsdbversion', {
        controller: 'TsdbVersionController',
        templateUrl: 'public/view/tsdbverion.html'
    }).otherwise({
        redirectTo: '/settings'
    });
})
// controllers
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
    $scope.versions = {};
    $scope.aggregators = {};
    $scope.serializers = {};
    $scope.refresh = function() {
        //get version
        TsdbClient.version().then(function(r) {
            //success
            $scope.versions = r;
        }, function(r) {
            Logger.error('getVersion() failed', r)
        });
        TsdbClient.getAggregators().then(function(r) {
            //success
            $scope.aggregators = r;
        }, function(r) {
            Logger.error('getAggregators() failed', r)
        });
        TsdbClient.serializers().then(function(r) {
            //success
            $scope.serializers = r;
        }, function(r) {
            Logger.error('serializers() failed', r)
        });
    }
    //initial
    $scope.refresh();
})