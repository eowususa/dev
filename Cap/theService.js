(function(){
	var theService = function($http){
		var theurl = "/sites/M-PRI/Internal/Innovation/";		
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

		var _getIntakeID = function(thefilter) {
		    var theid = 0;
		    $.ajax({
		        url: theurl + "_vti_bin/listdata.svc/ProjectSolution()?$filter=GENID eq '" + thefilter + "' &$select=Id",
		        type: "GET",
		        headers: { "ACCEPT": "application/json;odata=verbose" },
		        async: false,
		        success: function (data) { theid = data.d.results[0].Id; }
		    });
		    return theid;
		};

		var _getIntakebyID = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolution()?$filter=Id eq " + thefilter)
				.then(function(response){
					return response.data.d.results;					
			});
		};

		var _getIntake = function() {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolution()?$expand=CreatedBy")
				.then(function(response){
					return response.data.d.results;					
			});
		};
		var _getTheIntakeDocs = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolutionDocs()?$filter=ReqmtID eq '" + thefilter + "' &select=Id,Name,Title,Modified")
				.then(function(response){
					return response.data.d.results;						
			});
		};		
		var _getIntakeDoc = function(thefilter) {
			return $http.get(location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolutionDocs()?$filter=Name eq '" + thefilter + "' &$select=Id,ReqmtID,Name,Title")
				.then(function(response){
					return response.data.d.results;					
			});
		};
		var _getIntakeAnalysisID = function(thefilter) {
		    var theid = 0;
		    $.ajax({
		        url: location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolution()?$filter=GENID eq '" + thefilter + "' &$select=Id",
		        type: "GET",
		        headers: { "ACCEPT": "application/json;odata=verbose" },
		        async: false,
		        success: function (data) { theid = data.d.results[0].Id; }
		    });
		    return theid;
		};

		var _getTheIntakeDocsDelete = function(thefilter) {
		    var the = "";
		    $.ajax({
		        url: location.protocol + "//" + location.host + theurl + "_vti_bin/listdata.svc/ProjectSolutionDocs()?$filter=ReqmtID eq '" + thefilter + "' &select=Id,Name,Title,Modified",
		        type: "GET",
		        headers: { "ACCEPT": "application/json;odata=verbose" },
		        async: false,
		        success: function (data) { the = data.d.results; }
		    });
		    return the;
		}


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
			getTheIntakeDocsDelete: _getTheIntakeDocsDelete,
			getIntakeID: _getIntakeID,
			getIntakeAnalysisID: _getIntakeAnalysisID,
			getTheIntakeDocs: _getTheIntakeDocs,				
			getIntakeDoc: _getIntakeDoc,
			getIntakebyID: _getIntakebyID,
			getIntake: _getIntake
		};
	};

var MSSApp = angular.module("MSSApp");
MSSApp.factory("theService", theService);

}());