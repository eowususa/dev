(function(){
  	//Defines the Module
  	var MSSApp = angular.module("MSSApp", ['ngRoute','theFilter','ui.bootstrap','ui.select','ui.grid','googlechart','angularUtils.directives.dirPagination','ngSanitize','isteven-multi-select','angularMoment','mwl.calendar','angularFileUpload','angular.filter','cleave.js','ng-currency']);

	//Defines Route
  	MSSApp.config(function($routeProvider){
		$routeProvider
			.when("/Home",{
				templateUrl: "home.html",
				controller: 'theController'			
			})
			.when("/CIntake",{
				templateUrl: "cintake.html",
				controller: 'theController'			
			})
			.when("/IDiscovery",{
				templateUrl: "idiscovery.html",
				controller: 'theController'			
			})
			.when("/Active",{
				templateUrl: "active.html",
				controller: 'theController'			
			})
			.when("/Complete",{
				templateUrl: "complete.html",
				controller: 'theController'			
			})
			.when("/TBacklog",{
				templateUrl: "tbacklog.html",
				controller: 'theController'			
			})
			.when("/QFulfillment",{
				templateUrl: "qfulfillment.html",
				controller: 'theController'			
			})
			.when("/Declined",{
				templateUrl: "declined.html",
				controller: 'theController'			
			})
			.when("/Plan",{
				templateUrl: "plan.html",
				controller: 'theController'		
			})
			.when("/Print/:INTAKEID",{
				templateUrl: "print.html",
				controller: 'theController'
			})
			.when("/Update/:INTAKEID",{
				templateUrl: "update.html",
				controller: 'theController'		
			})
			.when("/Draft/:INTAKEID",{
				templateUrl: "draft.html",
				controller: 'theController'		
			})
			.when("/Complete/:INTAKEID",{
				templateUrl: "complete.html",
				controller: 'theController'		
			})
			.when("/Revise/:INTAKEID",{
				templateUrl: "revise.html",
				controller: 'theController'		
			})
			.when("/Calendar",{
				templateUrl: "calendar.html",
				controller: 'theController'		
			})
			.when("/Review",{
				templateUrl: "review.html",
				controller: 'theController'		
			})
			.when("/ManageTeam",{
				templateUrl: "manageteam.html",
				controller: 'theController'		
			})
			.when("/ManageINTAKE",{
				templateUrl: "manageINTAKE.html",
				controller: 'theController'		
			})
			.when("/Metrics",{
				templateUrl: "metrics.html",
				controller: 'theController'		
			})
			.otherwise({redirectTo:"/Home"});
    });


MSSApp.directive('noSpecial', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9A-z ]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    


MSSApp.directive('noEntry', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    
    
    
MSSApp.directive('numbersOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    

MSSApp.directive('latLon', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^0-9.]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    

MSSApp.directive('1to5', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^1-5]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    

MSSApp.directive('1to4', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^1-4]/g, '');

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    

MSSApp.directive('nothing', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {
            function fromUser(text) {
                if (text) {
                    var transformedInput = text.replace(/[^]/g, ''); 

                    if (transformedInput !== text) {
                        ngModelCtrl.$setViewValue(transformedInput);
                        ngModelCtrl.$render();
                    }
                    return transformedInput;
                }
                return undefined;
            }            
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});    
    
}());