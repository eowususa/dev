(function(){
	var theService = function($http){
		var theurl = "/sites/M_GreenTeams/";		
		var results = [];
		var response = [];
		var arrayTest = {};


		var getListItems = function (url) {
			var thereturn = $.ajax({
				url: url,
				method: "GET",
				headers: { "Accept": "application/json; odata=verbose"},
				success: function (data) {
					results = results.concat(data.d.results);
					if(data.d.__next) { getListItems(data.d.__next); }
					else { results = []; }
				},
				error: function (data) { console.log("Error retrieving data"); }
			});
			return thereturn;
		};

		var _getTheCAPDocs = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/EnergyCAP()?$filter=ReqmtID eq '" + thefilter + "' &select=Id,Name,Title,Modified")
				.then(function(response){
					return response.data.d.results;						
			});
		};
		var _getMission = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/RPAID()?$filter=Bureau eq '" + thefilter + "' &$select=Id,Country&$orderby=Country")
				.then(function(response){
					return response.data.d.results;					
			});
		};
		var _getPost = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/RPAID()?$filter=Country eq '" + thefilter + "' &$select=Id,Post&$orderby=Post")
				.then(function(response){
					return response.data.d.results;					
			});
		};
		var _getRPAID = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/RPAID()?$filter=Post eq '" + thefilter + "' &$select=Id,RealPropertyUniqueID,PropertyName,AssociatedLot,StreetAddress1,StreetAddress2,StreetAddress3,Report&$orderby=AssociatedLot,RealPropertyUniqueID")
				.then(function(response){
					return response.data.d.results;					
			});
		};

		var _getRPAIDByLot = function(thefilter,thefilter2) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/RPAID()?$filter=Post eq '" + thefilter + "' and AssociatedLot eq '" + thefilter2 + "' &$select=Id,RealPropertyUniqueID&$orderby=AssociatedLot,RealPropertyUniqueID")
				.then(function(response){
					return response.data.d.results;					
			});
		};


		var _getUpdate = function(thefilter, thefilter2) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/RPAID()?$filter=Report eq '" + thefilter + "' and Post eq '" + thefilter2 + "' &$select=Id,RealPropertyUniqueID&$orderby=RealPropertyUniqueID")
				.then(function(response){
					return response.data.d.results;					
			});
		};

		var _getCAPDoc = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/EnergyCAP()?$filter=Name eq '" + thefilter + "' &$select=Id,Name,Title")
				.then(function(response){
					return response.data.d.results;					
			});
		};


///////////////////////////////////////////////
		var parseXml = function (xml) {
			var data = [];
			$(xml).SPFilterNode("z:row").each(function (i, row) {
				var ic = ['string;#', $(row).attr('ows_ID') + ';#'];
				var json = {};
				$(row.attributes).each(function (j, nvp) {
					var name = nvp.name.replace('ows_', '');
					var value = nvp.value;
					angular.forEach(ic, function (illegal) {
						var splitVal = value.split(illegal);
						value = splitVal.join('');
					});
					if (isNaN(value)) { json[name] = value; } 
					else if (value == " ") { json[name] = ''; } 
					else { json[name] = parseFloat(value); }
				});
				data.push(json);
			});
			return data;
		};

		return {
			getPost: _getPost,				
			getRPAID: _getRPAID,				
			getRPAIDByLot: _getRPAIDByLot,				
			getUpdate: _getUpdate,				
			getMission: _getMission,				
			getTheCAPDocs: _getTheCAPDocs,				
			getCAPDoc: _getCAPDoc
		};
	};

var ENERGYCAPApp = angular.module("ENERGYCAPApp");
ENERGYCAPApp.factory("theService", theService);

}());