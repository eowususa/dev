(function(){

var theFilter = angular.module("theFilter", ['ENERGYCAPApp']);
	var today = new Date();
	var offsetTimeMS = today.getTimezoneOffset() *60 * 1000;

	var JSDate = function(){
		var re = /^.*?\([^\d]*(\d+)[^\d]*\).*$/;
	    return function (x) {
	    	if(x) var m = x.match(re);
	        if( m ) return new Date(parseInt(m[1]) + offsetTimeMS); //3600000;
	        //if( m ) return new Date(parseInt(m[1])); //3600000;
	        else return x;
	    };
	};

	var getHref = function() {
		return function(x){
			var href = /[^,]*/.exec(x)[0];
			if(href) return href;
			else return null;
		};
	};

	theFilter.filter("JSDate", JSDate);
	theFilter.filter("getHref", getHref);
}());