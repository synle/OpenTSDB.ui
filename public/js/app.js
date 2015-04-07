var TsdbClient = require('opentsdb_node_client');
var myTsdbClient = new TsdbClient({
    host: 'http://192.168.1.100',
    port: '4242'
});

var Logger = (function(){
	var self = {};

	self._errors = [];

	self.log = function(){
		console.log(arguments)
	}

	self.error = function(){
		console.error(arguments);
		self._errors.push(arguments);
	}

	return self;
})();

angular.module('opentsdbnw', ['ngRoute'])
.service('AppConfig', function(){
	return {
		tsdbHost: myTsdbClient.getHost(),
		tsdbPort: myTsdbClient.getPort()
	}
})
.config(function($routeProvider) {
  $routeProvider
    .when('/settings', {
      controller:'SettingController',
      templateUrl:'public/view/settings.html'
    })
    .when('/tsdbversion', {
      controller:'TsdbVersionController',
      templateUrl:'public/view/tsdbverion.html'
    })
    .otherwise({
      redirectTo:'/settings'
    });
})

// controllers
.controller('SettingController', function($scope, AppConfig) {
	$scope.appConfig = AppConfig;
	$scope.origAppConfig = _.cloneDeep(AppConfig);

	$scope.save = function(){
		$scope.origAppConfig = _.cloneDeep($scope.appConfig);

		//needs to save to file
	}

	$scope.cancel = function(){
		$scope.appConfig = _.cloneDeep($scope.origAppConfig);
	}
})
.controller('TsdbVersionController', function($scope) {
	$scope.versions = {};

	$scope.refresh = function(){
		//get version
		myTsdbClient.version().then(function(r){
			//success
			$scope.versions = r;
			$scope.$apply();//this is out of the scope, so needs $apply
		}, function(r){
			Logger.error('getVersion() failed', r)
		});


		myTsdbClient.getAggregators().then(function(r){
			//success
			$scope.aggregators = r;
			$scope.$apply();//this is out of the scope, so needs $apply
		}, function(r){
			Logger.error('getAggregators() failed', r)
		});


		myTsdbClient.serializers().then(function(r){
			//success
			$scope.serializers = r;
			$scope.$apply();//this is out of the scope, so needs $apply
		}, function(r){
			Logger.error('serializers() failed', r)
		});
	}


	//initial
	$scope.refresh();
})