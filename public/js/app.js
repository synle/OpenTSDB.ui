angular.module('opentsdbnw', ['ngRoute'])
.service('AppConfig', function(){
	return {
		tsdbHost: '192.168.1.100',
		tsdbPort: '4242'
	}
})
.config(function($routeProvider) {
  $routeProvider
    .when('/settings', {
      controller:'SettingController as settingController',
      templateUrl:'public/view/settings.html'
    })
    .otherwise({
      redirectTo:'/settings'
    });
})

// controllers
.controller('SettingController', function($scope, AppConfig) {
	$scope.appConfig = AppConfig;
})