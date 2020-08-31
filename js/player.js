var stepped = 0, chunks = 0, rows = 0;
var start, end;
var parser;
var pauseChecked = false;
var printStepChecked = false;
var theTEMP = {};
var theCOMPLETE = [];
var theLoggedType = "";
var killloop = 0;
var popUpObj;
var CountFlight = 0;
var NewFlight = 0;
var ExpectedFlight = 0;
var thelimit = 500;

function showModalPopUp() {
	popUpObj=window.open("LoaderModal.html", "ModalPopUp", "toolbar=no," + "scrollbars=no," + "location=no," + "statusbar=no," + "menubar=no," + "resizable=0," + "width=600," + "height=400," + "left = 300," + "top=200");
	popUpObj.focus(); 
}

function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }
function showModalPopUpClose() { popUpObj.close(); }

		$().SPServices({
		      operation: "GetGroupCollectionFromUser",
		      userLoginName: $().SPServices.SPGetCurrentUser(),
		      async: false,
		      completefunc: function(xData, Status) {
		        if($(xData.responseXML).find("Group[Name='UASPSP PPM']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM All']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM DuckTape Solutions Inc']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM All']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM Choctaw Nation of OK']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM IEIA']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM Kansas DOT']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM Lee County']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM Memphis-Shelby County']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM North Carolina']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM North Dakota DOT']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM City of Reno']").length == 1) { theLoggedType = "PPM"; }
		        if($(xData.responseXML).find("Group[Name='UASIPP PPM University of Alaska']").length == 1) { theLoggedType = "PPM"; }
			  }
		});

	var createListItemREST = function (listName, metadata) {
			$.ajax({
				url: location.protocol + "//" + location.host + "/faa/uasipp/devipp/_vti_bin/listdata.svc/" + listName,
				type: "POST",
				processData: false,
				contentType: "application/json;odata=verbose",
				data: JSON.stringify(metadata),
				headers: { "Accept": "application/json;odata=verbose" },
				success: function (data) { return data; },
				error: function (data) { }
			});
	};

	var getAircraft = function(thefilter, thefilter2, thefilter3) {
		var theaircraft = "";
		$.ajax({
			url: location.protocol + "//" + location.host + "/faa/uasipp/devipp/_vti_bin/listdata.svc/" + thefilter + "()?$filter=Name eq '" + thefilter2 + "' and ParticipantDesignator eq '" + thefilter3 + "' &$select=Id,Name,Description,Configuration,Weight",
			type: "GET",
		    headers: { "ACCEPT": "application/json;odata=verbose" },
		    async: false,
		    success: function (data) { theaircraft = data.d.results[0]; }
		});
		return theaircraft;
	}
	
	var getOperation = function(thefilter, thefilter2, thefilter3) {
		var theoperation = "";
		$.ajax({
			url: location.protocol + "//" + location.host + "/faa/uasipp/devipp/_vti_bin/listdata.svc/" + thefilter + "()?$filter=Name eq '" + thefilter2 + "' and ParticipantDesignator eq '" + thefilter3 + "' &$select=Id,Name,Description,LocalGovtRegulation,NAICSCode,OperationType,OperationWaivers,PublicPrivate,IndustryType",
		    type: "GET",
		    headers: { "ACCEPT": "application/json;odata=verbose" },
		    async: false,
		    success: function (data) { theoperation = data.d.results[0]; }
		});
		return theoperation;
	};

	var getCONOP = function(thefilter, thefilter2, thefilter3) {
		var theconop = "";
		$.ajax({
			url: location.protocol + "//" + location.host + "/faa/uasipp/devipp/_vti_bin/listdata.svc/" + thefilter + "()?$filter=Name eq '" + thefilter2 + "' and ParticipantDesignator eq '" + thefilter3 + "' &$select=Id,Name,Description,ProgramType",
		    type: "GET",
		    headers: { "ACCEPT": "application/json;odata=verbose" },
		    async: false,
		    success: function (data) { theconop = data.d.results[0]; }
		});
		return theconop;
	};


	var getAdmin = function() {
		var theresult = "";
		$.ajax({
			url: location.protocol + "//" + location.host + "/faa/uasipp/devipp/_vti_bin/listdata.svc/Administration()?$select=LockDocuments,LockReports,LockFlights,LockImports&$expand=LockDocuments,LockReports,LockFlights,LockImports",
			type: "GET",
			headers: { "ACCEPT": "application/json;odata=verbose" },
			async: false,
			success: function (data) { theresult = data.d.results[0]; }
		});
		return theresult;
	}

	var getTheFlightsCount = function(thefilter) {
		var theflights = 0;
		$().SPServices({
			operation: "GetListItems",
			async: false,
			listName: thefilter,
			CAMLViewFields: "<ViewFields><FieldRef Name='Title' /></ViewFields>",
			completefunc: function (xData, Status) { $(xData.responseXML).SPFilterNode("z:row").each(function() { theflights = theflights + 1; }); }
		});
		return theflights;	
	};


$(function()
{	
	$('#submit-parse').click(function()
	{	
		if(getAdmin().LockImports.Value == "Locked" || theLoggedType == "PPM" || theLoggedType == "PPM") { alert("Importing Flights is currently locked!"); }
		else if(document.getElementById("optSingle").checked && ($('#theconops').val() == "" || $('#theoperations').val() == "")) { alert("Please select a CONOPS and Operation to continue!"); }
		else if($('#files')[0].value.indexOf(".csv") == -1) { alert("Import only supports a single .CSV file!"); }
		else {				
				
			if($('#files')[0].value != "" || $('#input')[0].value != "") {

				var theconf = confirm("Are you sure you would like to import these flights?");
				
				if (theconf == true) {
					document.getElementById("thestatusmsg").value = "Import in progress... Please wait!";
					theprogress = 12;
					stepped = 0;
					chunks = 0;
					rows = 0;
			
					var txt = $('#input').val();
					var localChunkSize = $('#localChunkSize').val();
					var remoteChunkSize = $('#remoteChunkSize').val();
					var files = $('#files')[0].files;


					if(theParticipantDesignator == "LNVRENO") {
						if(document.getElementById("optSingle").checked) { var config = buildConfigLNVRENO(); }
						else if(document.getElementById("optMultiple").checked) { var config = buildConfigLNVRENOOperations(); }
					}
					else if(theParticipantDesignator != "LNVRENO") {
						if(document.getElementById("optSingle").checked) { var config = buildConfig(); }
						else if(document.getElementById("optMultiple").checked) { var config = buildConfigOperations(); }
					}

					if(conopsprogtype == "IPP") { CountFlight = getTheFlightsCount(theFlights); }
					if(conopsprogtype == "PSP") { CountFlight = getTheFlightsCount(thePSPFlights); }
						
			
					// NOTE: Chunk size does not get reset if changed and then set back to empty/default value
					if (localChunkSize)
						Papa.LocalChunkSize = localChunkSize;
					if (remoteChunkSize)
						Papa.RemoteChunkSize = remoteChunkSize;
			
					pauseChecked = $('#step-pause').prop('checked');
					printStepChecked = $('#print-steps').prop('checked');
			
			
					if (files.length > 0)
					{
						if (!$('#stream').prop('checked') && !$('#chunk').prop('checked'))
						{
							for (var i = 0; i < files.length; i++)
							{
								if (files[i].size > 1024 * 1024 * 10)
								{
									alert("A file you've selected is larger than 10 MB; please choose to stream or chunk the input to prevent the browser from crashing.");
									return;
								}
							}
						}
			
						start = performance.now();
			
						$('#files').parse({
							config: config,
							before: function(file, inputElem) { console.log("Parsing file:", file); },
							complete: function() { console.log("Done with all files."); }
						});
					}
					else {
						start = performance.now();
						var results = Papa.parse(txt, config);
						console.log("Synchronous parse results:", results);			
					}
				}
			}			
			else { alert("Please provide data to import!"); }
		}
	});

	$('#submit-unparse').click(function()
	{
		var input = $('#input').val();
		var delim = $('#delimiter').val();
		var header = $('#header').prop('checked');

		var results = Papa.unparse(input, {
			delimiter: delim,
			header: header,
		});

		console.log("Unparse complete!");
		console.log("--------------------------------------");
		console.log(results);
		console.log("--------------------------------------");
	});

	$('#insert-tab').click(function() { $('#delimiter').val('\t'); });
});


function buildConfig()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFn,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "<br>";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r<br>";
		else
			return "";
	}
}
function buildConfigLNVRENO()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFnLNVRENO,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "<br>";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r<br>";
		else
			return "";
	}
}

function buildConfigOperations()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFnOperations,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "<br>";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r<br>";
		else
			return "";
	}
}
function buildConfigLNVRENOOperations()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFnLNVRENOOperations,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "<br>";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r<br>";
		else
			return "";
	}
}


function stepFn(results, parserHandle)
{
	stepped++;
	rows += results.data.length;

	parser = parserHandle;

	if (pauseChecked)
	{
		console.log(results, results.data[0]);
		parserHandle.pause();
		return;
	}

	if (printStepChecked)
		console.log(results, results.data[0]);
}

function chunkFn(results, streamer, file)
{
	if (!results)
		return;
	chunks++;
	rows += results.data.length;

	parser = streamer;

	if (printStepChecked)
		console.log("Chunk data:", results.data.length, results);

	if (pauseChecked)
	{
		console.log("Pausing; " + results.data.length + " rows in chunk; file:", file);
		streamer.pause();
		return;
	}
}

function errorFn(error, file) { console.log("ERROR:", error, file); }

function completeFn()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length - 3;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
	
			var i = 2;
			var therow = i + 1;

			//showModalPopUp();
			var thestatus = "";

			while(i < arguments[0].data.length - 1 && killloop != 1 && rows < thelimit) {						

				if(arguments[0].data[0][0] != 'VERSION 1.4') { killloop = 1; thestatus = thestatus + "\n\nThe current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; document.getElementById("thestatusmsg").value = "The current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; }

				if(arguments[0].data[i][1] != '' && arguments[0].data[i][2] != '') {
				
					var theTEMP = {};

					if(OperationType.toUpperCase().indexOf("BVLOS") != -1 && (arguments[0].data[i][74] == '' || arguments[0].data[i][75] == '' || arguments[0].data[i][76] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Distance Traveled BVLOS (NM)', 'Duration Traveled BVLOS (h:mm:ss)', and Question 'Were there any aircraft detected that could potentially impede the UA's flight path?' are required for a BVLOS associated Operation"; }
					if(OperationType.toUpperCase().indexOf("BVLOS") == -1 && (arguments[0].data[i][74] != '' || arguments[0].data[i][75] != '' || arguments[0].data[i][76] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'BVLOS' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") != -1 && (arguments[0].data[i][98] == '' || arguments[0].data[i][99] == '' || arguments[0].data[i][100] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Weight (lbs)', Question 'Does cargo contain hazardous material?', and 'Payload Description' are required for a Cargo Delivery associated Operation"; }
					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") == -1 && (arguments[0].data[i][98] != '' || arguments[0].data[i][99] != '' || arguments[0].data[i][100] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Cargo Delivery' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") != -1 && (arguments[0].data[i][101] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Maximum distance between the Observer and UA (NM)' is required for a Night Operations associated Operation"; }
					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") == -1 && (arguments[0].data[i][101] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Night Operations' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("UTM") == -1 && (arguments[0].data[i][102] != '' || arguments[0].data[i][103] != '' || arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'One To Many' to import associated fields to be imported."; }
					if(OperationType.toUpperCase().indexOf("UTM") != -1 && (arguments[0].data[i][102] == '' || arguments[0].data[i][103] == '' || arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Simultaneously Operating UAs Planned and Actual', and 'Minimum Distance Between UAs (ft) Planned and Actual' are required for a One To Many associated Operation"; }

					var date = new Date(arguments[0].data[i][1]);
					var start_date = date;
					var checkdate = arguments[0].data[i][1];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.StartTime = arguments[0].data[i][1]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Start Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					var date = new Date(arguments[0].data[i][2]);
					var end_date = date;
					var checkdate = arguments[0].data[i][2];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.EndTime = arguments[0].data[i][2]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'End Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					if(start_date >= end_date) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Start Date/Time' must precede the 'End Date/Time'"; }
	
					if(arguments[0].data[i][3] != "") { theTEMP.LaunchLocation = arguments[0].data[i][3]; }	
															
					if(arguments[0].data[i][4].toUpperCase() == 'Alabama'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Alaska'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Arizona'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Arkansas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'California'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Colorado'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Connecticut'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Delaware'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Florida'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Georgia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Hawaii'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Idaho'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Illinois'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Indiana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Iowa'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Kansas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Kentucky'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Louisiana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Maine'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Maryland'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Massachusetts'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Michigan'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Minnesota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Mississippi'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Missouri'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Montana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Nebraska'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Nevada'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Hampshire'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Jersey'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Mexico'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New York'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'North Carolina'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'North Dakota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Ohio'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Oklahoma'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Oregon'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Pennsylvania'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Rhode Island'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'South Carolina'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'South Dakota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Tennessee'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Texas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Utah'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Vermont'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Virginia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Washington'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'West Virginia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Wisconsin'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Wyoming'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Israel'.toUpperCase()) { theTEMP.LaunchLocation2 = arguments[0].data[i][4].toUpperCase(); }					
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launch Location State' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][5] != '') {
						if(Number(arguments[0].data[i][5])) { theTEMP.LLLatitude = arguments[0].data[i][5]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Latitude (DD)' must be a decimal number"; }
					}
					if(arguments[0].data[i][6] != '') {
						if(Number(arguments[0].data[i][6])) { theTEMP.LLLongitude = arguments[0].data[i][6]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Longitude (DD)' must be a decimal number"; }
					}

					if(arguments[0].data[i][3] == "" && (arguments[0].data[i][5] == "" || arguments[0].data[i][6] == "")) { thestatus = thestatus + "\n\nRow " + therow + " : Either 'Launch Location City or Launch Location Latitude and Longitude' must be provided with the Launch Location State"; }

					if(arguments[0].data[i][7].toUpperCase() == 'Catapult or Rail Launch'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Hand Launch'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Launch from Vehicle'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Vertical Take-Off'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Wheeled Take-Off'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LaunchMethod = arguments[0].data[i][7].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launching Method' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][7].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][8] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Launching Method' please provide Other"; }
					else if(arguments[0].data[i][7] == 'Other' && arguments[0].data[i][8] != '') { theTEMP.LaunchMethodOther = arguments[0].data[i][8].toUpperCase(); }
	
					if(arguments[0].data[i][9] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Aircraft' is required and must contain an option from the system manage aircraft"; }
					else { 					
						if(getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Name' you entered must exist in the system under Manage Aircraft"; }
						else {				
							theTEMP.Aircraft = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Name;
							theTEMP.AircraftID = JSON.stringify(getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Id);
							theTEMP.AircraftDescription = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Description;
							theTEMP.AircraftConfiguration = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Configuration;				
							theTEMP.AircraftWeight = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Weight;	
						}	
					}

					if(arguments[0].data[i][10] != '') { theTEMP.AircraftConfiguration = arguments[0].data[i][10]; theTEMP.AircraftOverrides = "Configuration"; }

					if(arguments[0].data[i][11] != '') {
						if(Number(arguments[0].data[i][11])) { 						
							theTEMP.AircraftWeight = arguments[0].data[i][11]; 
									
							if(theTEMP.AircraftOverrides == undefined) { theTEMP.AircraftOverrides = "Weight"; }
							else { theTEMP.AircraftOverrides = theTEMP.AircraftOverrides + ", Weight"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Weight' must abe a number"; }
					}
					
					if(arguments[0].data[i][12].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1) { theTEMP.WeatherSources = arguments[0].data[i][12].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' is required and must contain an option from the menu"; }
	
					var datai8 = 0;
					if(arguments[0].data[i][12].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1) { datai8 = datai8 + 21; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1) { datai8 = datai8 + 9; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1) { datai8 =  datai8 + 22; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }										
					if(arguments[0].data[i][12].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' contains incorrect data"; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][13] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Weather Sources' please provide Other"; }
					else if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][13] != '') { theTEMP.WeatherSourcesOther = arguments[0].data[i][13]; }

					if(arguments[0].data[i][14].toUpperCase().indexOf("Class B".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class C".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class D".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class E".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class G".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class B".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class C".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class D".toUpperCase()) != -1) { datai8 =  datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class E".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class G".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][14].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { datai8 =  datai8 + 3; }										
						if(arguments[0].data[i][14].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' contains incorrect data"; }
					
						theTEMP.OperationAirSpaceClass = arguments[0].data[i][14].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' is required and must contain an option from the menu"; }

					if(arguments[0].data[i][15].toUpperCase() == 'Rural'.toUpperCase() || arguments[0].data[i][15].toUpperCase() == 'Urban'.toUpperCase() || arguments[0].data[i][15].toUpperCase() == 'Assembly'.toUpperCase()) { theTEMP.PopulationDensity = arguments[0].data[i][15].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Most Dense Population Area Flown Over' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][16].toUpperCase() == 'No'.toUpperCase()) { theTEMP.BoundingBox = arguments[0].data[i][16].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Is geofencing implemented?' is required and must contain a Yes or No"; }

					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' is required if 'Yes' is selected for 'Is geofencing implemented?'"; }
	
					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ExceedBounding = arguments[0].data[i][17].toUpperCase(); }

					else if(arguments[0].data[i][16].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][17].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' should not contain a value"; }
					else if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][18].toUpperCase().indexOf("Part 61".toUpperCase()) != -1 || arguments[0].data[i][18].toUpperCase().indexOf("Part 107".toUpperCase()) != -1 || arguments[0].data[i][18].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][18].toUpperCase().indexOf("Part 61".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][18].toUpperCase().indexOf("Part 107".toUpperCase()) != -1) { datai8 = datai8 + 7; }
						if(arguments[0].data[i][18].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][18].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' contains incorrect data"; }
					
						theTEMP.CertificationsType = arguments[0].data[i][18].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' is required and must contain an option from the menu"; }

					
					if(arguments[0].data[i][19] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][19]))) { theTEMP.MissionTraining = arguments[0].data[i][19]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Training hours for RPIC (hrs)' must be a whole number"; }				
					}	
	
					if(arguments[0].data[i][20] != '') {
						if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
							var datai8 = 0;
							if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) { datai8 = datai8 + 11; }
							if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { datai8 = datai8 + 14; }
							if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { datai8 = datai8 + 7; }				
							if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
							if(arguments[0].data[i][20].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' contains incorrect data"; }
						
							theTEMP.UTMCrewRoles = arguments[0].data[i][20].toUpperCase();
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' must contain an option from the menu"; }
					}

					if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) {
						if(Number.isInteger(Number(arguments[0].data[i][21]))) { theTEMP.UTMCrewRoles2box = arguments[0].data[i][21]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' must be a whole number"; }
	
						if(arguments[0].data[i][21] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) == -1 && arguments[0].data[i][21] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' should not contain data";
					}									
					if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][22]))) { theTEMP.UTMCrewRoles3box = arguments[0].data[i][22]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' must be a whole number"; }
	
						if(arguments[0].data[i][22] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) == -1 && arguments[0].data[i][22] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' should not contain data";
					}	

					if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][23]))) { theTEMP.UTMCrewRoles4box = arguments[0].data[i][23]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' must be a whole number"; }
	
						if(arguments[0].data[i][23] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) == -1 && arguments[0].data[i][23] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' should not contain data";
					}	
					if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][24]))) { theTEMP.UTMCrewRoles5box = arguments[0].data[i][24]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' must be a whole number"; }
	
						if(arguments[0].data[i][24] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) == -1 && arguments[0].data[i][24] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' should not contain data";
					}	

					if(arguments[0].data[i][25] != '') {
						var datai8 = 0;
						if(arguments[0].data[i][25].toUpperCase().indexOf("Radio".toUpperCase()) != -1) { datai8 = datai8 + 5; }
						if(arguments[0].data[i][25].toUpperCase().indexOf("Landline".toUpperCase()) != -1) { datai8 = datai8 + 8; }
						if(arguments[0].data[i][25].toUpperCase().indexOf("Cell Phone".toUpperCase()) != -1) { datai8 = datai8 + 9; }				
						if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][25].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Coordination Methods between Crew Members' contains incorrect data"; }
					
						theTEMP.UTMPlannedCoordination = arguments[0].data[i][25].toUpperCase(); 				
					}
					if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][26] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Coordination Methods between Crew Members' please provide Other"; }
					else if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][26] != '') { theTEMP.UTMPlannedCoordinationOther = arguments[0].data[i][26]; }

					if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][27].toUpperCase() == 'No'.toUpperCase()) { theTEMP.NeedAirTrafficServices = arguments[0].data[i][27].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight was there contact with Air Traffic Control to receive any services?' is required and must contain a Yes or No"; }
							
					if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][28] != '') { theTEMP.Ifapplicable1 = arguments[0].data[i][28]; }
					else if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][28] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' is required when selecting Yes to 'During this flight was there contact with Air Traffic Control to receive any services?'"; }
	
					if(arguments[0].data[i][27].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][28] != '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' should not contain data"; }



					if(arguments[0].data[i][29].length == 7 && Number.isInteger(Number(arguments[0].data[i][29].replace(/[:]/g,"")))) {


						theTEMP.LatencyThreshold = arguments[0].data[i][29].replace(/[:]/g,"");
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
		
					if(arguments[0].data[i][30] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][30]))) { theTEMP.LostLinkOccurrences = arguments[0].data[i][30]; 
					
							if(Number(arguments[0].data[i][30]) > 1) {
							
								if(arguments[0].data[i][31].length == 7 && Number.isInteger(Number(arguments[0].data[i][31].replace(/[:]/g,"")))) {
									theTEMP.LostLinkDuration = arguments[0].data[i][31].replace(/[:]/g,"");
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
								if(arguments[0].data[i][32].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
	
									var datai8 = 0;
									if(arguments[0].data[i][32].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][33] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][33]))) { theTEMP.LostLinkIndication1box = arguments[0].data[i][33]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][34] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][34]))) { theTEMP.LostLinkIndication2box = arguments[0].data[i][34]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][35] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][35]))) { theTEMP.LostLinkIndication3box = arguments[0].data[i][35]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1) { datai8 = datai8 + 27; 
	
										if(arguments[0].data[i][36] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][36]))) { theTEMP.LostLinkIndication4box = arguments[0].data[i][36]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1) { datai8 = datai8 + 20; 
	
										if(arguments[0].data[i][37] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][37]))) { theTEMP.LostLinkIndication5box = arguments[0].data[i][37]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][38] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][38]))) { theTEMP.LostLinkIndication6box = arguments[0].data[i][38]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}			
									if(arguments[0].data[i][32].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][39] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][39]))) { theTEMP.LostLinkIndication7box = arguments[0].data[i][39]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.LostLinkIndication = arguments[0].data[i][32].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
								if(arguments[0].data[i][40] != '') {
									theTEMP.LostLinkIndication7abox = arguments[0].data[i][40];				
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' Lost Link Procedures performed during this flight is required"; }
	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
	
	
					if(arguments[0].data[i][41].length == 7 && Number.isInteger(Number(arguments[0].data[i][41].replace(/[:]/g,"")))) {
						theTEMP.GLatencyThreshold = arguments[0].data[i][41].replace(/[:]/g,"");	
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'GPS Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
	
					if(arguments[0].data[i][42] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][42]))) { theTEMP.GLostLinkOccurrences = arguments[0].data[i][42]; 
					
							if(Number(arguments[0].data[i][42]) > 1) {
	

								if(arguments[0].data[i][43].length == 7 && Number.isInteger(Number(arguments[0].data[i][43].replace(/[:]/g,"")))) {
									theTEMP.GLostLinkDuration = arguments[0].data[i][43].replace(/[:]/g,"");	
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a GPS Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
	
	
								if(arguments[0].data[i][44].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Other".toUpperCase()) != -1) {
	
									var datai8 = 0;
									if(arguments[0].data[i][44].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][45] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][45]))) { theTEMP.GLostLinkIndication1box = arguments[0].data[i][45]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][46] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][46]))) { theTEMP.GLostLinkIndication2box = arguments[0].data[i][46]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][47] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][47]))) { theTEMP.GLostLinkIndication3box = arguments[0].data[i][47]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}				
									if(arguments[0].data[i][44].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][48] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][48]))) { theTEMP.GLostLinkIndication6box = arguments[0].data[i][48]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}				
									if(arguments[0].data[i][44].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][49] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][49]))) { theTEMP.GLostLinkIndication7box = arguments[0].data[i][49]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.GLostLinkIndication = arguments[0].data[i][44].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
	
								if(arguments[0].data[i][50] != '') { theTEMP.GLostLinkIndication7abox = arguments[0].data[i][50];	}

								if(arguments[0].data[i][49] != '' && arguments[0].data[i][50] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' GPS Lost Link Procedures performed during this flight is required"; }


///	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
		
					if(arguments[0].data[i][51].toUpperCase() == 'Manual'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Semi-Automatic'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Automatic'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Semi-Autonomous'.toUpperCase()) { theTEMP.Levelhumaninvolvement = arguments[0].data[i][51].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Level of Automation' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][52] != '') {
						if(Number(arguments[0].data[i][52]) || arguments[0].data[i][52] == "0") { theTEMP.TotalDistTraveled = arguments[0].data[i][52]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
	
					if(arguments[0].data[i][53] != '') {	
						if(Number(arguments[0].data[i][53])) { theTEMP.MaxRPICtoUA = arguments[0].data[i][53]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					
					if(arguments[0].data[i][54] != '') {				
						if(Number(arguments[0].data[i][54])) { theTEMP.MaxPlannedAltitude = arguments[0].data[i][54]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					}	
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					
					if(arguments[0].data[i][55] != '') {				
						if(Number(arguments[0].data[i][55])) { theTEMP.MaxActualAltitude = arguments[0].data[i][55]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
	
					if(arguments[0].data[i][56] != '') {					
						if(Number(arguments[0].data[i][56])) { theTEMP.Velocity = arguments[0].data[i][56]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
	
					if(arguments[0].data[i][57] != '') {
						if(Number(arguments[0].data[i][57])) { theTEMP.Velocity2 = arguments[0].data[i][57]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
	
	
					if(arguments[0].data[i][58].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][58].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DesignatedLandingArea = arguments[0].data[i][58].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA Land in Designated Landing Area?' is required and must contain a Yes or No"; }
	
					if(arguments[0].data[i][58].toUpperCase() == 'No'.toUpperCase()) {
						if(arguments[0].data[i][59] != '' && Number(arguments[0].data[i][59])) {
							if(Number(arguments[0].data[i][59])) { theTEMP.DestinationConformance = arguments[0].data[i][59]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
					}				
					if(arguments[0].data[i][60].toUpperCase() == 'Vertical Landing'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Runway'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Capture System'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LandMethod = arguments[0].data[i][60].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Landing Method' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][61] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Landing Method' please provide Other"; }
					else if(arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][61] != '') { theTEMP.LandMethodOther = arguments[0].data[i][61]; }
	
					if(arguments[0].data[i][62].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADeviate = arguments[0].data[i][62].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA deviate from planned flight path?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][62].toUpperCase() == 'Yes'.toUpperCase()) {
						if(arguments[0].data[i][63] != '') {
							if(Number(arguments[0].data[i][63]) >= 0) { theTEMP.HMax = arguments[0].data[i][63]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' must be a number2"; }		
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' is required and must be a number3"; }				

						if(arguments[0].data[i][64] != '') {
							if(Number(arguments[0].data[i][64]) >= 0) { theTEMP.VMax = arguments[0].data[i][64]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' is required and must be a number"; }				
					}
	
	
					if(arguments[0].data[i][65].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ReportAccidentIncident = arguments[0].data[i][65].toUpperCase(); }

					if(arguments[0].data[i][65].toUpperCase() == 'Yes'.toUpperCase()) { 
						theTEMP.ReportAccidentIncident = arguments[0].data[i][65].toUpperCase(); 
	
						if(arguments[0].data[i][66].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1 || arguments[0].data[i][66].indexOf("Damage to the UA") != -1 || arguments[0].data[i][66].indexOf("Damage to property") != -1 || arguments[0].data[i][66].indexOf("Injuries to people/animals") != -1 || arguments[0].data[i][66].indexOf("Public Disturbance") != -1) {
							var datai8 = 0;
							if(arguments[0].data[i][66].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1) { datai8 = datai8 + 37; }
							if(arguments[0].data[i][66].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1) { 
								datai8 = datai8 + 13; 
	
								if(arguments[0].data[i][67]!= '' && Number(arguments[0].data[i][67])) { theTEMP.CostofDamagesUAV = arguments[0].data[i][67]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the UA ($)' is required and must be a number"; }
							}
							if(arguments[0].data[i][66].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1) { 
								datai8 = datai8 + 16; 
///							
								if(arguments[0].data[i][68]!= '' && Number(arguments[0].data[i][68])) { theTEMP.CostofDamagesProperty = arguments[0].data[i][68]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the Property ($)' is required and  must be a number"; }						
							}		
									
							if(arguments[0].data[i][66].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1) { datai8 = datai8 + 24; }				
							if(arguments[0].data[i][66].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) { datai8 =  datai8 + 17; }
							if(arguments[0].data[i][66].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' contains incorrect data"; }
							theTEMP.WhatOccurred = arguments[0].data[i][66].toUpperCase(); 


							if(arguments[0].data[i][69].length == 7 && Number.isInteger(Number(arguments[0].data[i][69].replace(/[:]/g,"")))) {
								theTEMP.AccidentOccurrenceTime = arguments[0].data[i][69].replace(/[:]/g,"");	
							}
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration in flight (h:mm:ss)' is required and must be in the format provided"; }
			
							if(Number(arguments[0].data[i][70])) { theTEMP.AccidentLatitude = arguments[0].data[i][70]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Latitude' is required and  must be a number"; }
			
							if(Number(arguments[0].data[i][71])) { theTEMP.AccidentLongitude = arguments[0].data[i][71]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Longtitude' is required and must be a number"; }

							if(arguments[0].data[i][72] != '') { theTEMP.AccidentDescription = arguments[0].data[i][72]; }			
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Description of what occurred is required and must contain a value"; }	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' must contain an option from the menu"; }				
					}

					if(arguments[0].data[i][65].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][65].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight, did you experience any: (1) Critical hardware/software malfunctions; (2) Damage to the UA; (3) Damage to property; (4) Injuries to people/animals and/or (5) Public Disturbance?' is required and must contain a Yes or No"; }	

	
					if(arguments[0].data[i][74] != '' || arguments[0].data[i][75] != '' || arguments[0].data[i][76] != '') {
	
						if(arguments[0].data[i][74] == '' || arguments[0].data[i][75] == '' || arguments[0].data[i][76] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM), Duration Traveled BVLOS (h:mm:ss), and Were there any aircraft detected that could potentially impede the UA's flight path?' are all required for BVLOS"; }
										
						if(arguments[0].data[i][74] != '') {
							if(Number(arguments[0].data[i][74])) { theTEMP.BVLOSDistance = arguments[0].data[i][74]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM)' is required for BVLOS and must be a number"; }
						}
	


						if(arguments[0].data[i][75].length == 7 && Number.isInteger(Number(arguments[0].data[i][75].replace(/[:]/g,"")))) {
							theTEMP.BVLOSTime = arguments[0].data[i][75].replace(/[:]/g,"");	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration Traveled BVLOS (h:mm:ss)' is required for BVLOS and must be in the format provided"; }				
											
						if(arguments[0].data[i][76].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][76].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADetect = arguments[0].data[i][76].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Were there any aircraft detected that could potentially impede the UA's flight path?' is required for BVLOS and must contain a Yes or No"; }				
					}
	
					if(arguments[0].data[i][76].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][77] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][77]))) { theTEMP.BVLOSDetected = arguments[0].data[i][77]; 
											
						if(Number(arguments[0].data[i][77]) > 0) {
	
							if(arguments[0].data[i][78] == '' || arguments[0].data[i][79] == '' || arguments[0].data[i][80] == '' || arguments[0].data[i][81] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft), 1) Duration in flight when detected (h:mm:ss), 1) Closet Proximity to UA (ft), and 1) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][78])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][79].length == 7 && Number.isInteger(Number(arguments[0].data[i][79].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][80])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][81].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][81].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][81].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '1) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][78]) && Number(arguments[0].data[i][80]) && (arguments[0].data[i][81].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][81].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][81].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA1 = arguments[0].data[i][78] + "#" + arguments[0].data[i][79].replace(/[:]/g,"") + "##" + arguments[0].data[i][80] + "###" + arguments[0].data[i][81].toUpperCase() + "####"; }
						}
						
						if(Number(arguments[0].data[i][77]) > 1) {
	
							if(arguments[0].data[i][82] == '' || arguments[0].data[i][83] == '' || arguments[0].data[i][84] == '' || arguments[0].data[i][85] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft), 2) Duration in flight when detected (h:mm:ss), 2) Closet Proximity to UA (ft), and 2) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][82])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft)' is required and must be a number"; }
///			

							if(arguments[0].data[i][83].length == 7 && Number.isInteger(Number(arguments[0].data[i][83].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][84])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][85].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '2) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][82]) && Number(arguments[0].data[i][84]) && (arguments[0].data[i][85].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA2 = arguments[0].data[i][82] + "#" + arguments[0].data[i][83].replace(/[:]/g,"") + "##" + arguments[0].data[i][84] + "###" + arguments[0].data[i][85].toUpperCase() + "####"; }
						}		
	
	
			
						if(Number(arguments[0].data[i][77]) > 2) {
	
							if(arguments[0].data[i][86] == '' || arguments[0].data[i][87] == '' || arguments[0].data[i][88] == '' || arguments[0].data[i][89] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft), 3) Duration in flight when detected (h:mm:ss), 3) Closet Proximity to UA (ft), and 3) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][86])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][87].length == 7 && Number.isInteger(Number(arguments[0].data[i][87].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][88])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][89].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '3) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][86]) && Number(arguments[0].data[i][88]) && (arguments[0].data[i][89].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA3 = arguments[0].data[i][86] + "#" + arguments[0].data[i][87].replace(/[:]/g,"") + "##" + arguments[0].data[i][88] + "###" + arguments[0].data[i][89].toUpperCase() + "####"; }
						}
			
						if(Number(arguments[0].data[i][77]) > 3) {
	///
							if(arguments[0].data[i][90] == '' || arguments[0].data[i][91] == '' || arguments[0].data[i][92] == '' || arguments[0].data[i][93] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft), 4) Duration in flight when detected (h:mm:ss), 4) Closet Proximity to UA (ft), and 4) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][90])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][91].length == 7 && Number.isInteger(Number(arguments[0].data[i][91].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][92])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][93].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '4) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][90]) && Number(arguments[0].data[i][92]) && (arguments[0].data[i][93].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA4 = arguments[0].data[i][90] + "#" + arguments[0].data[i][91].replace(/[:]/g,"") + "##" + arguments[0].data[i][92] + "###" + arguments[0].data[i][93].toUpperCase() + "####"; }
						}		
	
						if(Number(arguments[0].data[i][77]) > 4) {
			
							if(arguments[0].data[i][94] == '' || arguments[0].data[i][95] == '' || arguments[0].data[i][96] == '' || arguments[0].data[i][97] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft), 5) Duration in flight when detected (h:mm:ss), 5) Closet Proximity to UA (ft), and 5) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][94])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][95].length == 7 && Number.isInteger(Number(arguments[0].data[i][95].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 

							if(Number(arguments[0].data[i][96])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][97].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '5) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][94]) && Number(arguments[0].data[i][96]) && (arguments[0].data[i][97].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA5 = arguments[0].data[i][94] + "#" + arguments[0].data[i][95].replace(/[:]/g,"") + "##" + arguments[0].data[i][96] + "###" + arguments[0].data[i][97].toUpperCase() + "####"; }
						}	
///
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' must be a whole number"; }
					}
					else if(arguments[0].data[i][76].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][77] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' is required and must be a whole number when 'Were there any aircraft detected that could potentially impede the UA's flight path?' is set to Yes"; }
					else if(arguments[0].data[i][76].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][77] != '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' should not contain a value when answering No to 'Were there any aircraft detected that could potentially impede the UA's flight path?'"; }

					if(arguments[0].data[i][98] != '' || arguments[0].data[i][99] != '' || arguments[0].data[i][100] != '') {
						if(arguments[0].data[i][98] == '' || arguments[0].data[i][99] == '' || arguments[0].data[i][100] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs), Does cargo contain hazardous material?, and Payload Description' are all required for Cargo Delivery"; }
	
	
	
						if(arguments[0].data[i][98] != '') {
							if(Number(arguments[0].data[i][98]) || Number(arguments[0].data[i][98]) == 0) { theTEMP.PayloadWeight = arguments[0].data[i][98]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs)' is required for Cargo Delivery and must be a number"; }	
						}
						if(arguments[0].data[i][99].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'No'.toUpperCase()) { theTEMP.HazardousMaterial = arguments[0].data[i][99].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Does cargo contain hazardous material?' is required for Cargo Delivery and must contain a Yes or No"; }
		
						if(arguments[0].data[i][100] != '') { theTEMP.PayloadDescription = arguments[0].data[i][100];	}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Description' is required for Cargo Delivery"; }
					}

					if(arguments[0].data[i][101] != '') {
						if(Number(arguments[0].data[i][101])) { theTEMP.NightOperationsDistance = arguments[0].data[i][101]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Maximum distance between the Observer and UA (NM)' is required for Night Operations and must be a number"; }
					}
	
					if(arguments[0].data[i][102] != '' || arguments[0].data[i][103] != '' || arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '') {
	
						if(arguments[0].data[i][102] == '' || arguments[0].data[i][103] == '' || arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned, Total Simultaneously Operating Uas - Actual, Minimum Distance Between UAs (ft) - Planned, and Minimum Distance Between UAs (ft) - Actual' are all required for One To Many (1:n)"; }
						
						if(arguments[0].data[i][102] != '') {
							if(Number.isInteger(Number(arguments[0].data[i][102]))) { theTEMP.UTMPlannedSimultaneously = arguments[0].data[i][102]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned' is required for One To Many (1:n) and must be a whole number"; }
						}
						if(arguments[0].data[i][103] != '') {	
							if(Number.isInteger(Number(arguments[0].data[i][103]))) { theTEMP.UTMActualSimultaneously = arguments[0].data[i][103]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Actual' is required for One To Many (1:n) and must be a whole number"; }
						}	
						if(arguments[0].data[i][104] != '') {
							if(Number(arguments[0].data[i][104])) { theTEMP.UTMPlannedDistance = arguments[0].data[i][104]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Planned' is required for One To Many (1:n) and must be a number"; }
						}
						if(arguments[0].data[i][105] != '') {
							if(Number(arguments[0].data[i][105])) { theTEMP.UTMActualDistance = arguments[0].data[i][105]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Actual' is required for One To Many (1:n) and must be a number"; }
						}
					}

					function guidGenerator() { var S4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }; return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }	 
	
					theTEMP.RegistrationNumber = guidGenerator() + Date.now();		
					theTEMP.AdditionalNotes = arguments[0].data[i][106]; //DONE TXT				
					theTEMP.ParticipantDesignator = theParticipantDesignator; //DONE
					theTEMP.Mission = $('#theconops').val();  //DONE				
					theTEMP.Operation = $('#theoperations').val(); //DONE				
					theTEMP.MissionID = conopsid; //DONE				
					theTEMP.MissionDescription = conopsdesc; //DONE				
					theTEMP.ProgramType = conopsprogtype; //DONE				
					theTEMP.OperationID = operationsid; //DONE				
					theTEMP.OperationDescription = operationsdesc; //DONE				
					theTEMP.LocalGovtRegulation = LocalGovtRegulation; //DONE				
					theTEMP.NCAISCode = NAICSCode; //DONE				
					theTEMP.OperationType = OperationType; //DONE				
					theTEMP.OperationWaivers = OperationWaivers; //DONE				
					theTEMP.PublicPrivate = PublicPrivate; //DONE				
					theTEMP.IndustryType = IndustryType; //DONE
					theTEMP.Import = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.toLocaleTimeString(); //DONE
	
					theCOMPLETE.push({ theTEMP });
					var theTEMP = 0;				


				}
				else { killloop = 1; }
				
				i++;
				therow++;
			}

			if(rows > thelimit) { thestatus = "\n\nThere is a " + thelimit + " flight maximum when importing!"; }

			if(thestatus == undefined || thestatus == "") {

				var ed = 0;
				while(ed < theCOMPLETE.length) {
					if(conopsprogtype == "IPP") { createListItemREST(theFlights, theCOMPLETE[ed].theTEMP); }
					if(conopsprogtype == "PSP") { createListItemREST(thePSPFlights, theCOMPLETE[ed].theTEMP); }

					ed = ed + 1;
					console.log("Row: " + ed + " processed sucessfully...");
				}
				ExpectedFlight = CountFlight + ed;

				if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
				if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

				while(ExpectedFlight != NewFlight) {

					if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
					if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

					console.log(NewFlight + " of " + ExpectedFlight + " inserted sucessfully...");
				}
				document.getElementById("thestatusmsg").value = "You have successfully imported " + ed + " flight(s)...";
			}
			else {
				document.getElementById("thestatusmsg").value = "Import canceled\n\nError(s) in import which need to be addressed:" + thestatus;			}
			stepped = 0;
			chunks = 0;
			rows = 0;
			pauseChecked = false;
			printStepChecked = false;
			theTEMP = {};
			theCOMPLETE = [];
			theLoggedType = "";
			killloop = 0;
			
}

function completeFnLNVRENO()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length - 3;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
	
			var i = 2;
			var therow = i + 1;

			var thestatus = "";

			while(i < arguments[0].data.length - 1 && killloop != 1 && rows < thelimit) {						

				if(arguments[0].data[0][0] != 'VERSION 1.4') { killloop = 1; thestatus = thestatus + "\n\nThe current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; document.getElementById("thestatusmsg").value = "The current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; }

				if(arguments[0].data[i][1] != '' && arguments[0].data[i][2] != '') {
				
					var theTEMP = {};

					if(OperationType.toUpperCase().indexOf("BVLOS") != -1 && (arguments[0].data[i][76] == '' || arguments[0].data[i][77] == '' || arguments[0].data[i][78] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Distance Traveled BVLOS (NM)', 'Duration Traveled BVLOS (h:mm:ss)', and Question 'Were there any aircraft detected that could potentially impede the UA's flight path?' are required for a BVLOS associated Operation"; }
					if(OperationType.toUpperCase().indexOf("BVLOS") == -1 && (arguments[0].data[i][76] != '' || arguments[0].data[i][77] != '' || arguments[0].data[i][78] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'BVLOS' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") != -1 && (arguments[0].data[i][100] == '' || arguments[0].data[i][101] == '' || arguments[0].data[i][102] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Weight (lbs)', Question 'Does cargo contain hazardous material?', and 'Payload Description' are required for a Cargo Delivery associated Operation"; }
					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") == -1 && (arguments[0].data[i][100] != '' || arguments[0].data[i][101] != '' || arguments[0].data[i][102] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Cargo Delivery' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") != -1 && (arguments[0].data[i][103] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Maximum distance between the Observer and UA (NM)' is required for a Night Operations associated Operation"; }
					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") == -1 && (arguments[0].data[i][103] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Night Operations' to import associated fields to be imported."; }
	
					if(OperationType.toUpperCase().indexOf("UTM") == -1 && (arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '' || arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'One To Many' to import associated fields to be imported."; }
					if(OperationType.toUpperCase().indexOf("UTM") != -1 && (arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '' || arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Simultaneously Operating UAs Planned and Actual', and 'Minimum Distance Between UAs (ft) Planned and Actual' are required for a One To Many associated Operation"; }

					var date = new Date(arguments[0].data[i][1]);
					var start_date = date;
					var checkdate = arguments[0].data[i][1];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.StartTime = arguments[0].data[i][1]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Start Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					var date = new Date(arguments[0].data[i][2]);
					var end_date = date;
					var checkdate = arguments[0].data[i][2];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.EndTime = arguments[0].data[i][2]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'End Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					if(start_date >= end_date) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Start Date/Time' must precede the 'End Date/Time'"; }
	
					if(arguments[0].data[i][3] != "") { theTEMP.LaunchLocation = arguments[0].data[i][3]; }	
					
					if(arguments[0].data[i][4].toUpperCase() == 'Alabama'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Alaska'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Arizona'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Arkansas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'California'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Colorado'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Connecticut'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Delaware'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Florida'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Georgia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Hawaii'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Idaho'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Illinois'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Indiana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Iowa'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Kansas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Kentucky'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Louisiana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Maine'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Maryland'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Massachusetts'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Michigan'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Minnesota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Mississippi'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Missouri'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Montana'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Nebraska'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Nevada'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Hampshire'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Jersey'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New Mexico'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'New York'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'North Carolina'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'North Dakota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Ohio'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Oklahoma'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Oregon'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Pennsylvania'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Rhode Island'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'South Carolina'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'South Dakota'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Tennessee'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Texas'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Utah'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Vermont'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Virginia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Washington'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'West Virginia'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Wisconsin'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Wyoming'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Israel'.toUpperCase()) { theTEMP.LaunchLocation2 = arguments[0].data[i][4].toUpperCase(); }					
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launch Location State' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][5] != '') {
						if(Number(arguments[0].data[i][5])) { theTEMP.LLLatitude = arguments[0].data[i][5]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Latitude (DD)' must be a decimal number"; }
					}
					if(arguments[0].data[i][6] != '') {
						if(Number(arguments[0].data[i][6])) { theTEMP.LLLongitude = arguments[0].data[i][6]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Longitude (DD)' must be a decimal number"; }
					}

					if(arguments[0].data[i][3] == "" && (arguments[0].data[i][5] == "" || arguments[0].data[i][6] == "")) { thestatus = thestatus + "\n\nRow " + therow + " : Either 'Launch Location City or Launch Location Latitude and Longitude' must be provided with the Launch Location State"; }

					if(arguments[0].data[i][7].toUpperCase() == 'Catapult or Rail Launch'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Hand Launch'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Launch from Vehicle'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Vertical Take-Off'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Wheeled Take-Off'.toUpperCase() || arguments[0].data[i][7].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LaunchMethod = arguments[0].data[i][7].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launching Method' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][7].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][8] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Launching Method' please provide Other"; }
					else if(arguments[0].data[i][7] == 'Other' && arguments[0].data[i][8] != '') { theTEMP.LaunchMethodOther = arguments[0].data[i][8].toUpperCase(); }
	
					if(arguments[0].data[i][9] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Aircraft' is required and must contain an option from the system manage aircraft"; }
					else { 					
						if(getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Name' you entered must exist in the system under Manage Aircraft"; }
						else {
							theTEMP.Aircraft = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Name;
							theTEMP.AircraftID = JSON.stringify(getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Id);
							theTEMP.AircraftDescription = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Description;
							theTEMP.AircraftConfiguration = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Configuration;
							theTEMP.AircraftWeight = getAircraft(theAircrafts, arguments[0].data[i][9], theParticipantDesignator).Weight;	
						}	
					}

					if(arguments[0].data[i][10] != '') { theTEMP.AircraftConfiguration = arguments[0].data[i][10]; theTEMP.AircraftOverrides = "Configuration"; }

					if(arguments[0].data[i][11] != '') {
						if(Number(arguments[0].data[i][11])) { 						
							theTEMP.AircraftWeight = arguments[0].data[i][11]; 
									
							if(theTEMP.AircraftOverrides == undefined) { theTEMP.AircraftOverrides = "Weight"; }
							else { theTEMP.AircraftOverrides = theTEMP.AircraftOverrides + ", Weight"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Weight' must abe a number"; }
					}
					
					if(arguments[0].data[i][12].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1 || arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1) { theTEMP.WeatherSources = arguments[0].data[i][12].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' is required and must contain an option from the menu"; }
	
					var datai8 = 0;
					if(arguments[0].data[i][12].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1) { datai8 = datai8 + 21; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1) { datai8 = datai8 + 9; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1) { datai8 =  datai8 + 22; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }										
					if(arguments[0].data[i][12].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' contains incorrect data"; }
					if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][13] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Weather Sources' please provide Other"; }
					else if(arguments[0].data[i][12].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][13] != '') { theTEMP.WeatherSourcesOther = arguments[0].data[i][13]; }

					if(arguments[0].data[i][14].toUpperCase().indexOf("Class B".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class C".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class D".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class E".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Class G".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class B".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class C".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class D".toUpperCase()) != -1) { datai8 =  datai8 + 6; }
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class E".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][14].toUpperCase().indexOf("Class G".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][14].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { datai8 =  datai8 + 3; }										
						if(arguments[0].data[i][14].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' contains incorrect data"; }
					
						theTEMP.OperationAirSpaceClass = arguments[0].data[i][14].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' is required and must contain an option from the menu"; }

					if(arguments[0].data[i][15].toUpperCase() == 'Rural'.toUpperCase() || arguments[0].data[i][15].toUpperCase() == 'Urban'.toUpperCase() || arguments[0].data[i][15].toUpperCase() == 'Assembly'.toUpperCase()) { theTEMP.PopulationDensity = arguments[0].data[i][15].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Most Dense Population Area Flown Over' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][16].toUpperCase() == 'No'.toUpperCase()) { theTEMP.BoundingBox = arguments[0].data[i][16].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Is geofencing implemented?' is required and must contain a Yes or No"; }

					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' is required if 'Yes' is selected for 'Is geofencing implemented?'"; }
	
					if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ExceedBounding = arguments[0].data[i][17].toUpperCase(); }

					else if(arguments[0].data[i][16].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][17].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' should not contain a value"; }
					else if(arguments[0].data[i][16].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][17].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][18].toUpperCase().indexOf("Part 61".toUpperCase()) != -1 || arguments[0].data[i][18].toUpperCase().indexOf("Part 107".toUpperCase()) != -1 || arguments[0].data[i][18].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][18].toUpperCase().indexOf("Part 61".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][18].toUpperCase().indexOf("Part 107".toUpperCase()) != -1) { datai8 = datai8 + 7; }
						if(arguments[0].data[i][18].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][18].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' contains incorrect data"; }
					
						theTEMP.CertificationsType = arguments[0].data[i][18].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' is required and must contain an option from the menu"; }

					
					if(arguments[0].data[i][19] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][19]))) { theTEMP.MissionTraining = arguments[0].data[i][19]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Training hours for RPIC (hrs)' must be a whole number"; }				
					}	
	
					if(arguments[0].data[i][20] != '') {
						if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
							var datai8 = 0;
							if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) { datai8 = datai8 + 11; }
							if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { datai8 = datai8 + 14; }
							if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { datai8 = datai8 + 7; }				
							if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
							if(arguments[0].data[i][20].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' contains incorrect data"; }
						
							theTEMP.UTMCrewRoles = arguments[0].data[i][20].toUpperCase();
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' must contain an option from the menu"; }
					}

					if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) {
						if(Number.isInteger(Number(arguments[0].data[i][21]))) { theTEMP.UTMCrewRoles2box = arguments[0].data[i][21]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' must be a whole number"; }
	
						if(arguments[0].data[i][21] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("GCS Operator".toUpperCase()) == -1 && arguments[0].data[i][21] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' should not contain data";
					}									
					if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][22]))) { theTEMP.UTMCrewRoles3box = arguments[0].data[i][22]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' must be a whole number"; }
	
						if(arguments[0].data[i][22] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Visual Observer".toUpperCase()) == -1 && arguments[0].data[i][22] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' should not contain data";
					}	

					if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][23]))) { theTEMP.UTMCrewRoles4box = arguments[0].data[i][23]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' must be a whole number"; }
	
						if(arguments[0].data[i][23] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Manager".toUpperCase()) == -1 && arguments[0].data[i][23] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' should not contain data";
					}	
					if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][24]))) { theTEMP.UTMCrewRoles5box = arguments[0].data[i][24]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' must be a whole number"; }
	
						if(arguments[0].data[i][24] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) == -1 && arguments[0].data[i][24] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' should not contain data";
					}	

					if(arguments[0].data[i][25] != '') {
						var datai8 = 0;
						if(arguments[0].data[i][25].toUpperCase().indexOf("Radio".toUpperCase()) != -1) { datai8 = datai8 + 5; }
						if(arguments[0].data[i][25].toUpperCase().indexOf("Landline".toUpperCase()) != -1) { datai8 = datai8 + 8; }
						if(arguments[0].data[i][25].toUpperCase().indexOf("Cell Phone".toUpperCase()) != -1) { datai8 = datai8 + 9; }				
						if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][25].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Coordination Methods between Crew Members' contains incorrect data"; }
					
						theTEMP.UTMPlannedCoordination = arguments[0].data[i][25].toUpperCase(); 				
					}
					if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][26] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Coordination Methods between Crew Members' please provide Other"; }
					else if(arguments[0].data[i][25].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][26] != '') { theTEMP.UTMPlannedCoordinationOther = arguments[0].data[i][26]; }

					if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][27].toUpperCase() == 'No'.toUpperCase()) { theTEMP.NeedAirTrafficServices = arguments[0].data[i][27].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight was there contact with Air Traffic Control to receive any services?' is required and must contain a Yes or No"; }
							
					if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][28] != '') { theTEMP.Ifapplicable1 = arguments[0].data[i][28]; }
					else if(arguments[0].data[i][27].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][28] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' is required when selecting Yes to 'During this flight was there contact with Air Traffic Control to receive any services?'"; }
	
					if(arguments[0].data[i][27].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][28] != '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' should not contain data"; }



					if(arguments[0].data[i][29].length == 7 && Number.isInteger(Number(arguments[0].data[i][29].replace(/[:]/g,"")))) { theTEMP.LatencyThreshold = arguments[0].data[i][29].replace(/[:]/g,""); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
	
					if(arguments[0].data[i][30] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][30]))) { theTEMP.LostLinkOccurrences = arguments[0].data[i][30]; 
					
							if(Number(arguments[0].data[i][30]) > 1) {
							
								if(arguments[0].data[i][31].length == 7 && Number.isInteger(Number(arguments[0].data[i][31].replace(/[:]/g,"")))) {
									theTEMP.LostLinkDuration = arguments[0].data[i][31].replace(/[:]/g,"");
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
								if(arguments[0].data[i][32].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][32].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
	
									var datai8 = 0;
									if(arguments[0].data[i][32].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][33] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][33]))) { theTEMP.LostLinkIndication1box = arguments[0].data[i][33]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][34] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][34]))) { theTEMP.LostLinkIndication2box = arguments[0].data[i][34]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][35] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][35]))) { theTEMP.LostLinkIndication3box = arguments[0].data[i][35]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1) { datai8 = datai8 + 27; 
	
										if(arguments[0].data[i][36] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][36]))) { theTEMP.LostLinkIndication4box = arguments[0].data[i][36]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1) { datai8 = datai8 + 20; 
	
										if(arguments[0].data[i][37] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][37]))) { theTEMP.LostLinkIndication5box = arguments[0].data[i][37]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][38] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][38]))) { theTEMP.LostLinkIndication6box = arguments[0].data[i][38]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}			
									if(arguments[0].data[i][32].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][39] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][39]))) { theTEMP.LostLinkIndication7box = arguments[0].data[i][39]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][32].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.LostLinkIndication = arguments[0].data[i][32].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
								if(arguments[0].data[i][40] != '') {
									theTEMP.LostLinkIndication7abox = arguments[0].data[i][40];				
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' Lost Link Procedures performed during this flight is required"; }
	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }

	
	
					if(arguments[0].data[i][41].length == 7 && Number.isInteger(Number(arguments[0].data[i][41].replace(/[:]/g,"")))) { theTEMP.GLatencyThreshold = arguments[0].data[i][41].replace(/[:]/g,""); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
		
					if(arguments[0].data[i][42] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][42]))) { theTEMP.GLostLinkOccurrences = arguments[0].data[i][42]; 
					
							if(Number(arguments[0].data[i][42]) > 1) {
	

								if(arguments[0].data[i][43].length == 7 && Number.isInteger(Number(arguments[0].data[i][43].replace(/[:]/g,"")))) {
									theTEMP.GLostLinkDuration = arguments[0].data[i][43].replace(/[:]/g,"");	
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a GPS Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
	
	
								if(arguments[0].data[i][44].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][44].toUpperCase().indexOf("Other".toUpperCase()) != -1) {
	
									var datai8 = 0;
									if(arguments[0].data[i][44].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][45] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][45]))) { theTEMP.GLostLinkIndication1box = arguments[0].data[i][45]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][46] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][46]))) { theTEMP.GLostLinkIndication2box = arguments[0].data[i][46]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][47] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][47]))) { theTEMP.GLostLinkIndication3box = arguments[0].data[i][47]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}				
									if(arguments[0].data[i][44].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][48] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][48]))) { theTEMP.GLostLinkIndication6box = arguments[0].data[i][48]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}				
									if(arguments[0].data[i][44].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][49] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][49]))) { theTEMP.GLostLinkIndication7box = arguments[0].data[i][49]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][44].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.GLostLinkIndication = arguments[0].data[i][44].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
	
								if(arguments[0].data[i][50] != '') { theTEMP.GLostLinkIndication7abox = arguments[0].data[i][50];	}

								if(arguments[0].data[i][49] != '' && arguments[0].data[i][50] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' GPS Lost Link Procedures performed during this flight is required"; }
///	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }		


					
					if(arguments[0].data[i][51].toUpperCase() == 'Manual'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Semi-Automatic'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Automatic'.toUpperCase() || arguments[0].data[i][51].toUpperCase() == 'Semi-Autonomous'.toUpperCase()) { theTEMP.Levelhumaninvolvement = arguments[0].data[i][51].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Level of Automation' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][52] != '') {
						if(Number(arguments[0].data[i][52]) || arguments[0].data[i][52] == "0") { theTEMP.TotalDistTraveled = arguments[0].data[i][52]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
	
					if(arguments[0].data[i][53] != '') {	
						if(Number(arguments[0].data[i][53])) { theTEMP.MaxRPICtoUA = arguments[0].data[i][53]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					
					if(arguments[0].data[i][54] != '') {				
						if(Number(arguments[0].data[i][54])) { theTEMP.MaxPlannedAltitude = arguments[0].data[i][54]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					}	
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					
					if(arguments[0].data[i][55] != '') {				
						if(Number(arguments[0].data[i][55])) { theTEMP.MaxActualAltitude = arguments[0].data[i][55]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
	
					if(arguments[0].data[i][56] != '') {					
						if(Number(arguments[0].data[i][56])) { theTEMP.Velocity = arguments[0].data[i][56]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
	
					if(arguments[0].data[i][57] != '') {
						if(Number(arguments[0].data[i][57])) { theTEMP.Velocity2 = arguments[0].data[i][57]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }

	
	
					if(arguments[0].data[i][58].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][58].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DesignatedLandingArea = arguments[0].data[i][58].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA Land in Designated Landing Area?' is required and must contain a Yes or No"; }
	
					if(arguments[0].data[i][58].toUpperCase() == 'No'.toUpperCase()) {
						if(arguments[0].data[i][59] != '' && Number(arguments[0].data[i][59])) {
							if(Number(arguments[0].data[i][59])) { theTEMP.DestinationConformance = arguments[0].data[i][59]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
					}				
					if(arguments[0].data[i][60].toUpperCase() == 'Vertical Landing'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Runway'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Capture System'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LandMethod = arguments[0].data[i][60].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Landing Method' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][61] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Landing Method' please provide Other"; }
					else if(arguments[0].data[i][60].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][61] != '') { theTEMP.LandMethodOther = arguments[0].data[i][61]; }
	
					if(arguments[0].data[i][62].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADeviate = arguments[0].data[i][62].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA deviate from planned flight path?' must contain a Yes or No"; }





					if(arguments[0].data[i][62].toUpperCase() == 'Yes'.toUpperCase()) {
						if(arguments[0].data[i][63] != '') {
							if(Number(arguments[0].data[i][63]) >= 0) { theTEMP.HMax = arguments[0].data[i][63]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' must be a number2"; }		
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' is required and must be a number3"; }				

						if(arguments[0].data[i][64] != '') {
							if(Number(arguments[0].data[i][64]) >= 0) { theTEMP.VMax = arguments[0].data[i][64]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' is required and must be a number"; }				
					}

	
					if(arguments[0].data[i][65] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][65]))) { 
							theTEMP.IntermediateTL = arguments[0].data[i][65]; 						
														
							if(arguments[0].data[i][66].length == 7 && Number.isInteger(Number(arguments[0].data[i][66].replace(/[:]/g,"")))) { theTEMP.FlightDuration = arguments[0].data[i][66].replace(/[:]/g,""); }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Flight Duration (h:mm:ss)' must be in the format provided and is required if 'Intermediate Take off / Landing' is filled in"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Intermediate Take off / Landing' must be a whole number"; }

					}
			

/////INCREASE BY 2 /////////////////////////////

					if(arguments[0].data[i][67].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ReportAccidentIncident = arguments[0].data[i][67].toUpperCase(); }	

					if(arguments[0].data[i][67].toUpperCase() == 'Yes'.toUpperCase()) { 
						theTEMP.ReportAccidentIncident = arguments[0].data[i][67].toUpperCase(); 
	
						if(arguments[0].data[i][68].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1 || arguments[0].data[i][68].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1 || arguments[0].data[i][68].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1 || arguments[0].data[i][68].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1 || arguments[0].data[i][68].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) {
							var datai8 = 0;
							if(arguments[0].data[i][68].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1) { datai8 = datai8 + 37; }
							if(arguments[0].data[i][68].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1) { 
								datai8 = datai8 + 13; 
	
								if(arguments[0].data[i][69]!= '' && Number(arguments[0].data[i][69])) { theTEMP.CostofDamagesUAV = arguments[0].data[i][69]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the UA ($)' is required and must be a number"; }
							}
							if(arguments[0].data[i][68].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1) { 
								datai8 = datai8 + 16; 
///							
								if(arguments[0].data[i][70]!= '' && Number(arguments[0].data[i][70])) { theTEMP.CostofDamagesProperty = arguments[0].data[i][70]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the Property ($)' is required and  must be a number"; }						
							}		
									
							if(arguments[0].data[i][68].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1) { datai8 = datai8 + 24; }				
							if(arguments[0].data[i][68].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) { datai8 =  datai8 + 17; }
							if(arguments[0].data[i][68].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' contains incorrect data"; }
							theTEMP.WhatOccurred = arguments[0].data[i][68]; 


							if(arguments[0].data[i][66].length == 7 && Number.isInteger(Number(arguments[0].data[i][66].replace(/[:]/g,"")))) { theTEMP.AccidentOccurrenceTime = arguments[0].data[i][66].replace(/[:]/g,""); }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration in flight (h:mm:ss)' is required and must be in the format provided"; }
			
							if(Number(arguments[0].data[i][72])) { theTEMP.AccidentLatitude = arguments[0].data[i][72]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Latitude' is required and  must be a number"; }
			
							if(Number(arguments[0].data[i][73])) { theTEMP.AccidentLongitude = arguments[0].data[i][73]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Longtitude' is required and must be a number"; }

							if(arguments[0].data[i][74] != '') { theTEMP.AccidentDescription = arguments[0].data[i][74]; }			
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Description of what occurred is required and must contain a value"; }	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' must contain an option from the menu"; }				
					}

					if(arguments[0].data[i][67].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][67].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight, did you experience any: (1) Critical hardware/software malfunctions; (2) Damage to the UA; (3) Damage to property; (4) Injuries to people/animals and/or (5) Public Disturbance?' is required and must contain a Yes or No"; }	
	
	
	
					if(arguments[0].data[i][76] != '' || arguments[0].data[i][77] != '' || arguments[0].data[i][78] != '') {
	
						if(arguments[0].data[i][76] == '' || arguments[0].data[i][77] == '' || arguments[0].data[i][78] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM), Duration Traveled BVLOS (h:mm:ss), and Were there any aircraft detected that could potentially impede the UA's flight path?' are all required for BVLOS"; }
										
						if(arguments[0].data[i][76] != '') {
							if(Number(arguments[0].data[i][76])) { theTEMP.BVLOSDistance = arguments[0].data[i][76]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM)' is required for BVLOS and must be a number"; }
						}
	
						if(arguments[0].data[i][77].length == 7 && Number.isInteger(Number(arguments[0].data[i][77].replace(/[:]/g,"")))) { theTEMP.BVLOSTime = arguments[0].data[i][77].replace(/[:]/g,""); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration Traveled BVLOS (h:mm:ss)' is required for BVLOS and must be in the format provided"; }				
											
						if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][78].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADetect = arguments[0].data[i][78].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Were there any aircraft detected that could potentially impede the UA's flight path?' is required for BVLOS and must contain a Yes or No"; }				
					}

				
	
					if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][79] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][79]))) { theTEMP.BVLOSDetected = arguments[0].data[i][79]; 
											
						if(Number(arguments[0].data[i][79]) > 0) {
	
							if(arguments[0].data[i][80] == '' || arguments[0].data[i][81] == '' || arguments[0].data[i][82] == '' || arguments[0].data[i][83] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft), 1) Duration in flight when detected (h:mm:ss), 1) Closet Proximity to UA (ft), and 1) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][80])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft)' is required and must be a number"; }
						
							if(arguments[0].data[i][81].length == 7 && Number.isInteger(Number(arguments[0].data[i][81].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][82])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][83].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '1) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][80]) && Number(arguments[0].data[i][82]) && (arguments[0].data[i][83].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA1 = arguments[0].data[i][80] + "#" + arguments[0].data[i][81].replace(/[:]/g,"") + "##" + arguments[0].data[i][82] + "###" + arguments[0].data[i][83].toUpperCase() + "####"; }
						}	
						
						if(Number(arguments[0].data[i][79]) > 1) {
	
							if(arguments[0].data[i][84] == '' || arguments[0].data[i][85] == '' || arguments[0].data[i][86] == '' || arguments[0].data[i][87] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft), 2) Duration in flight when detected (h:mm:ss), 2) Closet Proximity to UA (ft), and 2) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][84])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft)' is required and must be a number"; }
///			
							if(arguments[0].data[i][85].length == 7 && Number.isInteger(Number(arguments[0].data[i][85].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][86])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][87].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '2) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][84]) && Number(arguments[0].data[i][86]) && (arguments[0].data[i][87].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA2 = arguments[0].data[i][84] + "#" + arguments[0].data[i][85].replace(/[:]/g,"") + "##" + arguments[0].data[i][86] + "###" + arguments[0].data[i][87].toUpperCase() + "####"; }
						}		
	
	
			
						if(Number(arguments[0].data[i][79]) > 2) {
	
							if(arguments[0].data[i][88] == '' || arguments[0].data[i][89] == '' || arguments[0].data[i][90] == '' || arguments[0].data[i][91] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft), 3) Duration in flight when detected (h:mm:ss), 3) Closet Proximity to UA (ft), and 3) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][88])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][89].length == 7 && Number.isInteger(Number(arguments[0].data[i][89].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][90])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][91].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '3) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][88]) && Number(arguments[0].data[i][90]) && (arguments[0].data[i][91].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA3 = arguments[0].data[i][88] + "#" + arguments[0].data[i][89].replace(/[:]/g,"") + "##" + arguments[0].data[i][90] + "###" + arguments[0].data[i][91].toUpperCase() + "####"; }
						}
			
						if(Number(arguments[0].data[i][79]) > 3) {
	///
							if(arguments[0].data[i][92] == '' || arguments[0].data[i][93] == '' || arguments[0].data[i][94] == '' || arguments[0].data[i][95] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft), 4) Duration in flight when detected (h:mm:ss), 4) Closet Proximity to UA (ft), and 4) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][92])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][93].length == 7 && Number.isInteger(Number(arguments[0].data[i][93].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][94])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][95].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '4) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][92]) && Number(arguments[0].data[i][94]) && (arguments[0].data[i][95].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA4 = arguments[0].data[i][92] + "#" + arguments[0].data[i][93].replace(/[:]/g,"") + "##" + arguments[0].data[i][94] + "###" + arguments[0].data[i][95].toUpperCase() + "####"; }
						}		
	
						if(Number(arguments[0].data[i][79]) > 4) {
			
							if(arguments[0].data[i][96] == '' || arguments[0].data[i][97] == '' || arguments[0].data[i][98] == '' || arguments[0].data[i][99] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft), 5) Duration in flight when detected (h:mm:ss), 5) Closet Proximity to UA (ft), and 5) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][96])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][97].length == 7 && Number.isInteger(Number(arguments[0].data[i][97].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][98])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][99].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '5) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][96]) && Number(arguments[0].data[i][98]) && (arguments[0].data[i][99].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA5 = arguments[0].data[i][96] + "#" + arguments[0].data[i][97].replace(/[:]/g,"") + "##" + arguments[0].data[i][98] + "###" + arguments[0].data[i][99].toUpperCase() + "####"; }
						}	
///
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' must be a whole number"; }
					}
					else if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][79] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' is required and must be a whole number when 'Were there any aircraft detected that could potentially impede the UA's flight path?' is set to Yes"; }
					else if(arguments[0].data[i][78].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][79] != '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' should not contain a value when answering No to 'Were there any aircraft detected that could potentially impede the UA's flight path?'"; }

					if(arguments[0].data[i][100] != '' || arguments[0].data[i][101] != '' || arguments[0].data[i][102] != '') {
						if(arguments[0].data[i][100] == '' || arguments[0].data[i][101] == '' || arguments[0].data[i][102] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs), Does cargo contain hazardous material?, and Payload Description' are all required for Cargo Delivery"; }
	
						if(arguments[0].data[i][100] != '') {					
							if(Number(arguments[0].data[i][100]) || Number(arguments[0].data[i][100]) == 0) { theTEMP.PayloadWeight = arguments[0].data[i][100]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs)' is required for Cargo Delivery and must be a number"; }	
						}
						if(arguments[0].data[i][101].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'No'.toUpperCase()) { theTEMP.HazardousMaterial = arguments[0].data[i][101].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Does cargo contain hazardous material?' is required for Cargo Delivery and must contain a Yes or No"; }
		
						if(arguments[0].data[i][102] != '') { theTEMP.PayloadDescription = arguments[0].data[i][102];	}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Description' is required for Cargo Delivery"; }
					}

					if(arguments[0].data[i][103] != '') {
						if(Number(arguments[0].data[i][103])) { theTEMP.NightOperationsDistance = arguments[0].data[i][103]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Maximum distance between the Observer and UA (NM)' is required for Night Operations and must be a number"; }
					}
	
					if(arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '' || arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '') {
	
						if(arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '' || arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned, Total Simultaneously Operating Uas - Actual, Minimum Distance Between UAs (ft) - Planned, and Minimum Distance Between UAs (ft) - Actual' are all required for One To Many (1:n)"; }
						
						if(arguments[0].data[i][104] != '') {
							if(Number.isInteger(Number(arguments[0].data[i][104]))) { theTEMP.UTMPlannedSimultaneously = arguments[0].data[i][104]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned' is required for One To Many (1:n) and must be a whole number"; }
						}
						if(arguments[0].data[i][105] != '') {	
							if(Number.isInteger(Number(arguments[0].data[i][105]))) { theTEMP.UTMActualSimultaneously = arguments[0].data[i][105]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Actual' is required for One To Many (1:n) and must be a whole number"; }
						}	
						if(arguments[0].data[i][106] != '') {
							if(Number(arguments[0].data[i][106])) { theTEMP.UTMPlannedDistance = arguments[0].data[i][106]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Planned' is required for One To Many (1:n) and must be a number"; }
						}
						if(arguments[0].data[i][107] != '') {
							if(Number(arguments[0].data[i][107])) { theTEMP.UTMActualDistance = arguments[0].data[i][107]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Actual' is required for One To Many (1:n) and must be a number"; }
						}
					}
	
					function guidGenerator() { var S4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }; return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }	 
	
					theTEMP.RegistrationNumber = guidGenerator() + Date.now();			
					theTEMP.AdditionalNotes = arguments[0].data[i][108]; //DONE TXT				
					theTEMP.ParticipantDesignator = theParticipantDesignator; //DONE
					theTEMP.Mission = $('#theconops').val();  //DONE				
					theTEMP.Operation = $('#theoperations').val(); //DONE				
					theTEMP.MissionID = conopsid; //DONE				
					theTEMP.MissionDescription = conopsdesc; //DONE				
					theTEMP.ProgramType = conopsprogtype; //DONE				
					theTEMP.OperationID = operationsid; //DONE				
					theTEMP.OperationDescription = operationsdesc; //DONE				
					theTEMP.LocalGovtRegulation = LocalGovtRegulation; //DONE				
					theTEMP.NCAISCode = NAICSCode; //DONE				
					theTEMP.OperationType = OperationType; //DONE				
					theTEMP.OperationWaivers = OperationWaivers; //DONE				
					theTEMP.PublicPrivate = PublicPrivate; //DONE				
					theTEMP.IndustryType = IndustryType; //DONE
					theTEMP.Import = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.toLocaleTimeString(); //DONE	
					theCOMPLETE.push({ theTEMP });
					var theTEMP = 0;				
				}
				else { killloop = 1; }
				
				i++;
				therow++;
			}

			if(rows > thelimit) { thestatus = "\n\nThere is a " + thelimit + " flight maximum when importing!"; }

			if(thestatus == undefined || thestatus == "") {

				var ed = 0;
				while(ed < theCOMPLETE.length) {
					if(conopsprogtype == "IPP") { createListItemREST(theFlights, theCOMPLETE[ed].theTEMP); }
					if(conopsprogtype == "PSP") { createListItemREST(thePSPFlights, theCOMPLETE[ed].theTEMP); }
					ed = ed + 1;
					console.log("Row: " + ed + " processed sucessfully...");
				}
				ExpectedFlight = CountFlight + ed;

				if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
				if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

				while(ExpectedFlight != NewFlight) {
					if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
					if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }
					console.log(NewFlight + " of " + ExpectedFlight + " inserted sucessfully...");
				}
				document.getElementById("thestatusmsg").value = "You have successfully imported " + ed + " flight(s)...";
			}
			else {
				document.getElementById("thestatusmsg").value = "Import canceled\n\nError(s) in import which need to be addressed:" + thestatus;			}
			stepped = 0;
			chunks = 0;
			rows = 0;
			pauseChecked = false;
			printStepChecked = false;
			theTEMP = {};
			theCOMPLETE = [];
			theLoggedType = "";
			killloop = 0;
}

function completeFnOperations()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length - 3;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
	
			var i = 2;
			var therow = i + 1;

			//showModalPopUp();
			var thestatus = "";			

			while(i < arguments[0].data.length - 1 && killloop != 1 && rows < thelimit) {						

				if(arguments[0].data[0][0] != 'VERSION 1.4') { killloop = 1; thestatus = thestatus + "\n\nThe current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; document.getElementById("thestatusmsg").value = "The current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; }

				if(arguments[0].data[i][1] != '' && arguments[0].data[i][2] != '') {
				
					var theTEMP = {};

					if(getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'CONOPS' you entered must exist in the system"; }
					else {
						theTEMP.Mission = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Name;
						theTEMP.MissionID = JSON.stringify(getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Id);
						theTEMP.MissionDescription = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Description;
						theTEMP.ProgramType = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).ProgramType;
						conopsprogtype = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).ProgramType;
						if(conopsprogtype == "IPP") { CountFlight = getTheFlightsCount(theFlights); }
						if(conopsprogtype == "PSP") { CountFlight = getTheFlightsCount(thePSPFlights); }						
					}	

					if(getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Operation' you entered must exist in the system"; }
					else { 
						theTEMP.Operation = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Name;
						theTEMP.OperationID = JSON.stringify(getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Id);
						theTEMP.OperationDescription = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Description;
						theTEMP.LocalGovtRegulation = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).LocalGovtRegulation;
						theTEMP.NCAISCode = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).NAICSCode;
						theTEMP.OperationType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationType;
						OperationType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationType;
						theTEMP.OperationWaivers = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationWaivers;
						theTEMP.PublicPrivate = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).PublicPrivate;
						theTEMP.IndustryType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).IndustryType;
					}	


					if(OperationType.toUpperCase().indexOf("BVLOS") != -1 && (arguments[0].data[i][76] == '' || arguments[0].data[i][77] == '' || arguments[0].data[i][78] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Distance Traveled BVLOS (NM)', 'Duration Traveled BVLOS (h:mm:ss)', and Question 'Were there any aircraft detected that could potentially impede the UA's flight path?' are required for a BVLOS associated Operation"; }
					if(OperationType.toUpperCase().indexOf("BVLOS") == -1 && (arguments[0].data[i][76] != '' || arguments[0].data[i][77] != '' || arguments[0].data[i][78] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'BVLOS' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") != -1 && (arguments[0].data[i][100] == '' || arguments[0].data[i][101] == '' || arguments[0].data[i][102] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Weight (lbs)', Question 'Does cargo contain hazardous material?', and 'Payload Description' are required for a Cargo Delivery associated Operation"; }
					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") == -1 && (arguments[0].data[i][100] != '' || arguments[0].data[i][101] != '' || arguments[0].data[i][102] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Cargo Delivery' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") != -1 && (arguments[0].data[i][103] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Maximum distance between the Observer and UA (NM)' is required for a Night Operations associated Operation"; }
					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") == -1 && (arguments[0].data[i][103] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Night Operations' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("UTM") == -1 && (arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '' || arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'One To Many' to import associated fields to be imported."; }
					if(OperationType.toUpperCase().indexOf("UTM") != -1 && (arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '' || arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Simultaneously Operating UAs Planned and Actual', and 'Minimum Distance Between UAs (ft) Planned and Actual' are required for a One To Many associated Operation"; }

					var date = new Date(arguments[0].data[i][3]);
					var start_date = date;
					var checkdate = arguments[0].data[i][3];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.StartTime = arguments[0].data[i][3]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Start Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					var date = new Date(arguments[0].data[i][4]);
					var end_date = date;
					var checkdate = arguments[0].data[i][4];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.EndTime = arguments[0].data[i][4]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'End Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					if(start_date >= end_date) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Start Date/Time' must precede the 'End Date/Time'"; }
	
					if(arguments[0].data[i][5] != "") { theTEMP.LaunchLocation = arguments[0].data[i][5]; }	
															
					if(arguments[0].data[i][6].toUpperCase() == 'Alabama'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Alaska'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Arizona'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Arkansas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'California'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Colorado'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Connecticut'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Delaware'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Florida'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Georgia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Hawaii'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Idaho'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Illinois'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Indiana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Iowa'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Kansas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Kentucky'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Louisiana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Maine'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Maryland'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Massachusetts'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Michigan'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Minnesota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Mississippi'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Missouri'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Montana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Nebraska'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Nevada'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Hampshire'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Jersey'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Mexico'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New York'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'North Carolina'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'North Dakota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Ohio'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Oklahoma'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Oregon'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Pennsylvania'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Rhode Island'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'South Carolina'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'South Dakota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Tennessee'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Texas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Utah'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Vermont'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Virginia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Washington'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'West Virginia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Wisconsin'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Wyoming'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Israel'.toUpperCase()) { theTEMP.LaunchLocation2 = arguments[0].data[i][6].toUpperCase(); }					
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launch Location State' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][7] != '') {
						if(Number(arguments[0].data[i][7])) { theTEMP.LLLatitude = arguments[0].data[i][7]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Latitude (DD)' must be a decimal number"; }
					}
					if(arguments[0].data[i][8] != '') {
						if(Number(arguments[0].data[i][8])) { theTEMP.LLLongitude = arguments[0].data[i][8]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Longitude (DD)' must be a decimal number"; }
					}

					if(arguments[0].data[i][5] == "" && (arguments[0].data[i][7] == "" || arguments[0].data[i][8] == "")) { thestatus = thestatus + "\n\nRow " + therow + " : Either 'Launch Location City or Launch Location Latitude and Longitude' must be provided with the Launch Location State"; }

					if(arguments[0].data[i][9].toUpperCase() == 'Catapult or Rail Launch'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Hand Launch'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Launch from Vehicle'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Vertical Take-Off'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Wheeled Take-Off'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LaunchMethod = arguments[0].data[i][9].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launching Method' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][9].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][10] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Launching Method' please provide Other"; }
					else if(arguments[0].data[i][9] == 'Other' && arguments[0].data[i][10] != '') { theTEMP.LaunchMethodOther = arguments[0].data[i][10].toUpperCase(); }
	
					if(arguments[0].data[i][11] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Aircraft' is required and must contain an option from the system manage aircraft"; }
					else { 					
						if(getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Name' you entered must exist in the system under Manage Aircraft"; }
						else {				
							theTEMP.Aircraft = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Name;
							theTEMP.AircraftID = JSON.stringify(getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Id);
							theTEMP.AircraftDescription = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Description;
							theTEMP.AircraftConfiguration = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Configuration;				
							theTEMP.AircraftWeight = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Weight;	
						}	
					}

					if(arguments[0].data[i][12] != '') { theTEMP.AircraftConfiguration = arguments[0].data[i][12]; theTEMP.AircraftOverrides = "Configuration"; }

					if(arguments[0].data[i][13] != '') {
						if(Number(arguments[0].data[i][13])) { 						
							theTEMP.AircraftWeight = arguments[0].data[i][13]; 
									
							if(theTEMP.AircraftOverrides == undefined) { theTEMP.AircraftOverrides = "Weight"; }
							else { theTEMP.AircraftOverrides = theTEMP.AircraftOverrides + ", Weight"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Weight' must abe a number"; }
					}
					
					if(arguments[0].data[i][14].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1) { theTEMP.WeatherSources = arguments[0].data[i][14].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' is required and must contain an option from the menu"; }
	
					var datai8 = 0;
					if(arguments[0].data[i][14].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1) { datai8 = datai8 + 21; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1) { datai8 = datai8 + 9; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1) { datai8 =  datai8 + 22; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }										
					if(arguments[0].data[i][14].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' contains incorrect data"; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][15] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Weather Sources' please provide Other"; }
					else if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][15] != '') { theTEMP.WeatherSourcesOther = arguments[0].data[i][15]; }

					if(arguments[0].data[i][16].toUpperCase().indexOf("Class B".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class C".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class D".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class E".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class G".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class B".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class C".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class D".toUpperCase()) != -1) { datai8 =  datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class E".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class G".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][16].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { datai8 =  datai8 + 3; }										
						if(arguments[0].data[i][16].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' contains incorrect data"; }
					
						theTEMP.OperationAirSpaceClass = arguments[0].data[i][16].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' is required and must contain an option from the menu"; }
//04/29
					if(arguments[0].data[i][17].toUpperCase() == 'Rural'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'Urban'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'Assembly'.toUpperCase()) { theTEMP.PopulationDensity = arguments[0].data[i][17].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Most Dense Population Area Flown Over' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][18].toUpperCase() == 'No'.toUpperCase()) { theTEMP.BoundingBox = arguments[0].data[i][18].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Is geofencing implemented?' is required and must contain a Yes or No"; }

					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' is required if 'Yes' is selected for 'Is geofencing implemented?'"; }
	
					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][19].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ExceedBounding = arguments[0].data[i][19].toUpperCase(); }

					else if(arguments[0].data[i][18].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][19].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][19].toUpperCase() == 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' should not contain a value"; }
					else if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][20].toUpperCase().indexOf("Part 61".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Part 107".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][20].toUpperCase().indexOf("Part 61".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][20].toUpperCase().indexOf("Part 107".toUpperCase()) != -1) { datai8 = datai8 + 7; }
						if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][20].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' contains incorrect data"; }
					
						theTEMP.CertificationsType = arguments[0].data[i][22].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' is required and must contain an option from the menu"; }
//04/29
					
					if(arguments[0].data[i][21] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][21]))) { theTEMP.MissionTraining = arguments[0].data[i][21]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Training hours for RPIC (hrs)' must be a whole number"; }				
					}	
	
					if(arguments[0].data[i][22] != '') {
						if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
							var datai8 = 0;
							if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) { datai8 = datai8 + 11; }
							if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { datai8 = datai8 + 14; }
							if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { datai8 = datai8 + 7; }				
							if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
							if(arguments[0].data[i][22].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' contains incorrect data"; }
						
							theTEMP.UTMCrewRoles = arguments[0].data[i][22].toUpperCase();
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' must contain an option from the menu"; }
					}

					if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) {
						if(Number.isInteger(Number(arguments[0].data[i][23]))) { theTEMP.UTMCrewRoles2box = arguments[0].data[i][23]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' must be a whole number"; }
	
						if(arguments[0].data[i][23] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) == -1 && arguments[0].data[i][23] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' should not contain data";
					}									
					if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][24]))) { theTEMP.UTMCrewRoles3box = arguments[0].data[i][24]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' must be a whole number"; }
	
						if(arguments[0].data[i][24] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) == -1 && arguments[0].data[i][24] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' should not contain data";
					}	

					if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][25]))) { theTEMP.UTMCrewRoles4box = arguments[0].data[i][25]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' must be a whole number"; }
	
						if(arguments[0].data[i][25] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) == -1 && arguments[0].data[i][25] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' should not contain data";
					}	
					if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][26]))) { theTEMP.UTMCrewRoles5box = arguments[0].data[i][26]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' must be a whole number"; }
	
						if(arguments[0].data[i][26] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) == -1 && arguments[0].data[i][26] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' should not contain data";
					}	

					if(arguments[0].data[i][27] != '') {
						var datai8 = 0;
						if(arguments[0].data[i][27].toUpperCase().indexOf("Radio".toUpperCase()) != -1) { datai8 = datai8 + 5; }
						if(arguments[0].data[i][27].toUpperCase().indexOf("Landline".toUpperCase()) != -1) { datai8 = datai8 + 8; }
						if(arguments[0].data[i][27].toUpperCase().indexOf("Cell Phone".toUpperCase()) != -1) { datai8 = datai8 + 9; }				
						if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][27].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Coordination Methods between Crew Members' contains incorrect data"; }
					
						theTEMP.UTMPlannedCoordination = arguments[0].data[i][27].toUpperCase(); 				
					}
					if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][28] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Coordination Methods between Crew Members' please provide Other"; }
					else if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][28] != '') { theTEMP.UTMPlannedCoordinationOther = arguments[0].data[i][28]; }

					if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][29].toUpperCase() == 'No'.toUpperCase()) { theTEMP.NeedAirTrafficServices = arguments[0].data[i][29].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight was there contact with Air Traffic Control to receive any services?' is required and must contain a Yes or No"; }
							
					if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][30] != '') { theTEMP.Ifapplicable1 = arguments[0].data[i][30]; }
					else if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][30] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' is required when selecting Yes to 'During this flight was there contact with Air Traffic Control to receive any services?'"; }
	
					if(arguments[0].data[i][29].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][30] != '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' should not contain data"; }


					if(arguments[0].data[i][31].length == 7 && Number.isInteger(Number(arguments[0].data[i][31].replace(/[:]/g,"")))) {


						theTEMP.LatencyThreshold = arguments[0].data[i][31].replace(/[:]/g,"");
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
		
					if(arguments[0].data[i][32] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][32]))) { theTEMP.LostLinkOccurrences = arguments[0].data[i][32]; 
					
							if(Number(arguments[0].data[i][32]) > 1) {
							
								if(arguments[0].data[i][33].length == 7 && Number.isInteger(Number(arguments[0].data[i][33].replace(/[:]/g,"")))) {
									theTEMP.LostLinkDuration = arguments[0].data[i][33].replace(/[:]/g,"");
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
								if(arguments[0].data[i][34].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
	
									var datai8 = 0;
									if(arguments[0].data[i][34].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][35] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][35]))) { theTEMP.LostLinkIndication1box = arguments[0].data[i][35]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][36] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][36]))) { theTEMP.LostLinkIndication2box = arguments[0].data[i][36]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][37] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][37]))) { theTEMP.LostLinkIndication3box = arguments[0].data[i][37]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1) { datai8 = datai8 + 27; 
	
										if(arguments[0].data[i][38] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][38]))) { theTEMP.LostLinkIndication4box = arguments[0].data[i][38]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1) { datai8 = datai8 + 20; 
	
										if(arguments[0].data[i][39] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][39]))) { theTEMP.LostLinkIndication5box = arguments[0].data[i][39]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][40] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][40]))) { theTEMP.LostLinkIndication6box = arguments[0].data[i][40]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}			
									if(arguments[0].data[i][34].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][41] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][41]))) { theTEMP.LostLinkIndication7box = arguments[0].data[i][41]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.LostLinkIndication = arguments[0].data[i][34].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
								if(arguments[0].data[i][42] != '') {
									theTEMP.LostLinkIndication7abox = arguments[0].data[i][42];				
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' Lost Link Procedures performed during this flight is required"; }
	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
	
//04/29	
					if(arguments[0].data[i][43].length == 7 && Number.isInteger(Number(arguments[0].data[i][43].replace(/[:]/g,"")))) {
						theTEMP.GLatencyThreshold = arguments[0].data[i][43].replace(/[:]/g,"");	
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'GPS Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
	
					if(arguments[0].data[i][44] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][44]))) { theTEMP.GLostLinkOccurrences = arguments[0].data[i][44]; 
					
							if(Number(arguments[0].data[i][44]) > 1) {
	

								if(arguments[0].data[i][45].length == 7 && Number.isInteger(Number(arguments[0].data[i][45].replace(/[:]/g,"")))) {
									theTEMP.GLostLinkDuration = arguments[0].data[i][45].replace(/[:]/g,"");	
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a GPS Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
	
	
								if(arguments[0].data[i][46].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Other".toUpperCase()) != -1) {
	
									var datai8 = 0;
									if(arguments[0].data[i][46].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][47] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][47]))) { theTEMP.GLostLinkIndication1box = arguments[0].data[i][47]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][48] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][48]))) { theTEMP.GLostLinkIndication2box = arguments[0].data[i][48]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][49] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][49]))) { theTEMP.GLostLinkIndication3box = arguments[0].data[i][49]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}				
									if(arguments[0].data[i][46].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][50] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][50]))) { theTEMP.GLostLinkIndication6box = arguments[0].data[i][50]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}				
									if(arguments[0].data[i][46].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][51] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][51]))) { theTEMP.GLostLinkIndication7box = arguments[0].data[i][51]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.GLostLinkIndication = arguments[0].data[i][46].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
	

								if(arguments[0].data[i][52] != '') { theTEMP.GLostLinkIndication7abox = arguments[0].data[i][52];	}
								if(arguments[0].data[i][51] != '' && arguments[0].data[i][51] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' GPS Lost Link Procedures performed during this flight is required"; }
///	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
//04/29
					if(arguments[0].data[i][53].toUpperCase() == 'Manual'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Semi-Automatic'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Automatic'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Semi-Autonomous'.toUpperCase()) { theTEMP.Levelhumaninvolvement = arguments[0].data[i][53].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Level of Automation' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][54] != '') {
						if(Number(arguments[0].data[i][54]) || arguments[0].data[i][54] == "0") { theTEMP.TotalDistTraveled = arguments[0].data[i][54]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
	
					if(arguments[0].data[i][55] != '') {	
						if(Number(arguments[0].data[i][55])) { theTEMP.MaxRPICtoUA = arguments[0].data[i][55]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					
					if(arguments[0].data[i][56] != '') {				
						if(Number(arguments[0].data[i][56])) { theTEMP.MaxPlannedAltitude = arguments[0].data[i][56]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					}	
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					
					if(arguments[0].data[i][57] != '') {				
						if(Number(arguments[0].data[i][57])) { theTEMP.MaxActualAltitude = arguments[0].data[i][57]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
	
					if(arguments[0].data[i][58] != '') {					
						if(Number(arguments[0].data[i][58])) { theTEMP.Velocity = arguments[0].data[i][58]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
	
					if(arguments[0].data[i][59] != '') {
						if(Number(arguments[0].data[i][59])) { theTEMP.Velocity2 = arguments[0].data[i][59]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
	
	
					if(arguments[0].data[i][60].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DesignatedLandingArea = arguments[0].data[i][60].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA Land in Designated Landing Area?' is required and must contain a Yes or No"; }
	
					if(arguments[0].data[i][60].toUpperCase() == 'No'.toUpperCase()) {
						if(arguments[0].data[i][61] != '' && Number(arguments[0].data[i][61])) {
							if(Number(arguments[0].data[i][61])) { theTEMP.DestinationConformance = arguments[0].data[i][61]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
					}	
								
					if(arguments[0].data[i][62].toUpperCase() == 'Vertical Landing'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Runway'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Capture System'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LandMethod = arguments[0].data[i][62].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Landing Method' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][63] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Landing Method' please provide Other"; }
					else if(arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][63] != '') { theTEMP.LandMethodOther = arguments[0].data[i][63]; }
	
					if(arguments[0].data[i][64].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][64].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADeviate = arguments[0].data[i][64].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA deviate from planned flight path?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][64].toUpperCase() == 'Yes'.toUpperCase()) {
						if(arguments[0].data[i][65] != '') {
							if(Number(arguments[0].data[i][65]) >= 0) { theTEMP.HMax = arguments[0].data[i][65]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' must be a number2"; }		
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' is required and must be a number3"; }				

						if(arguments[0].data[i][66] != '') {
							if(Number(arguments[0].data[i][66]) >= 0) { theTEMP.VMax = arguments[0].data[i][66]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' is required and must be a number"; }				
					}
	
	
					if(arguments[0].data[i][67].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ReportAccidentIncident = arguments[0].data[i][67].toUpperCase(); }

					if(arguments[0].data[i][67].toUpperCase() == 'Yes'.toUpperCase()) { 
						theTEMP.ReportAccidentIncident = arguments[0].data[i][67].toUpperCase(); 
	
						if(arguments[0].data[i][68].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1 || arguments[0].data[i][68].indexOf("Damage to the UA") != -1 || arguments[0].data[i][68].indexOf("Damage to property") != -1 || arguments[0].data[i][68].indexOf("Injuries to people/animals") != -1 || arguments[0].data[i][68].indexOf("Public Disturbance") != -1) {
							var datai8 = 0;
							if(arguments[0].data[i][68].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1) { datai8 = datai8 + 37; }
							if(arguments[0].data[i][68].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1) { 
								datai8 = datai8 + 13; 
	
								if(arguments[0].data[i][69]!= '' && Number(arguments[0].data[i][69])) { theTEMP.CostofDamagesUAV = arguments[0].data[i][69]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the UA ($)' is required and must be a number"; }
							}
							if(arguments[0].data[i][68].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1) { 
								datai8 = datai8 + 16; 
///							
								if(arguments[0].data[i][70]!= '' && Number(arguments[0].data[i][70])) { theTEMP.CostofDamagesProperty = arguments[0].data[i][70]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the Property ($)' is required and  must be a number"; }						
							}		
									
							if(arguments[0].data[i][68].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1) { datai8 = datai8 + 24; }				
							if(arguments[0].data[i][68].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) { datai8 =  datai8 + 17; }
							if(arguments[0].data[i][68].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' contains incorrect data"; }
							theTEMP.WhatOccurred = arguments[0].data[i][68].toUpperCase(); 


							if(arguments[0].data[i][71].length == 7 && Number.isInteger(Number(arguments[0].data[i][71].replace(/[:]/g,"")))) {
								theTEMP.AccidentOccurrenceTime = arguments[0].data[i][71].replace(/[:]/g,"");	
							}
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration in flight (h:mm:ss)' is required and must be in the format provided"; }
			
							if(Number(arguments[0].data[i][72])) { theTEMP.AccidentLatitude = arguments[0].data[i][72]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Latitude' is required and  must be a number"; }
			
							if(Number(arguments[0].data[i][73])) { theTEMP.AccidentLongitude = arguments[0].data[i][73]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Longtitude' is required and must be a number"; }

							if(arguments[0].data[i][74] != '') { theTEMP.AccidentDescription = arguments[0].data[i][74]; }			
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Description of what occurred is required and must contain a value"; }	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' must contain an option from the menu"; }				
					}

					if(arguments[0].data[i][67].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][67].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight, did you experience any: (1) Critical hardware/software malfunctions; (2) Damage to the UA; (3) Damage to property; (4) Injuries to people/animals and/or (5) Public Disturbance?' is required and must contain a Yes or No"; }	

	
					if(arguments[0].data[i][76] != '' || arguments[0].data[i][77] != '' || arguments[0].data[i][78] != '') {
	
						if(arguments[0].data[i][76] == '' || arguments[0].data[i][77] == '' || arguments[0].data[i][78] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM), Duration Traveled BVLOS (h:mm:ss), and Were there any aircraft detected that could potentially impede the UA's flight path?' are all required for BVLOS"; }
										
						if(arguments[0].data[i][76] != '') {
							if(Number(arguments[0].data[i][76])) { theTEMP.BVLOSDistance = arguments[0].data[i][76]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM)' is required for BVLOS and must be a number"; }
						}
	


						if(arguments[0].data[i][77].length == 7 && Number.isInteger(Number(arguments[0].data[i][77].replace(/[:]/g,"")))) {
							theTEMP.BVLOSTime = arguments[0].data[i][77].replace(/[:]/g,"");	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration Traveled BVLOS (h:mm:ss)' is required for BVLOS and must be in the format provided"; }				
											
						if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][78].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADetect = arguments[0].data[i][78].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Were there any aircraft detected that could potentially impede the UA's flight path?' is required for BVLOS and must contain a Yes or No"; }				
					}
	
					if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][79] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][79]))) { theTEMP.BVLOSDetected = arguments[0].data[i][79]; 
											
						if(Number(arguments[0].data[i][79]) > 0) {
	
							if(arguments[0].data[i][80] == '' || arguments[0].data[i][81] == '' || arguments[0].data[i][82] == '' || arguments[0].data[i][83] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft), 1) Duration in flight when detected (h:mm:ss), 1) Closet Proximity to UA (ft), and 1) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][80])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][81].length == 7 && Number.isInteger(Number(arguments[0].data[i][81].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][82])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][83].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '1) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][80]) && Number(arguments[0].data[i][82]) && (arguments[0].data[i][83].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][83].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA1 = arguments[0].data[i][80] + "#" + arguments[0].data[i][81].replace(/[:]/g,"") + "##" + arguments[0].data[i][82] + "###" + arguments[0].data[i][83].toUpperCase() + "####"; }
						}
						
						if(Number(arguments[0].data[i][79]) > 1) {
	
							if(arguments[0].data[i][84] == '' || arguments[0].data[i][85] == '' || arguments[0].data[i][86] == '' || arguments[0].data[i][87] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft), 2) Duration in flight when detected (h:mm:ss), 2) Closet Proximity to UA (ft), and 2) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][84])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft)' is required and must be a number"; }
///			

							if(arguments[0].data[i][85].length == 7 && Number.isInteger(Number(arguments[0].data[i][85].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][86])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][87].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '2) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][84]) && Number(arguments[0].data[i][86]) && (arguments[0].data[i][87].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][87].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA2 = arguments[0].data[i][84] + "#" + arguments[0].data[i][85].replace(/[:]/g,"") + "##" + arguments[0].data[i][86] + "###" + arguments[0].data[i][87].toUpperCase() + "####"; }
						}		
	
//04/29	
			
						if(Number(arguments[0].data[i][79]) > 2) {
	
							if(arguments[0].data[i][88] == '' || arguments[0].data[i][89] == '' || arguments[0].data[i][90] == '' || arguments[0].data[i][91] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft), 3) Duration in flight when detected (h:mm:ss), 3) Closet Proximity to UA (ft), and 3) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][88])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][89].length == 7 && Number.isInteger(Number(arguments[0].data[i][89].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][90])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][91].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '3) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][88]) && Number(arguments[0].data[i][90]) && (arguments[0].data[i][91].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][91].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA3 = arguments[0].data[i][88] + "#" + arguments[0].data[i][89].replace(/[:]/g,"") + "##" + arguments[0].data[i][90] + "###" + arguments[0].data[i][91].toUpperCase() + "####"; }
						}
			
						if(Number(arguments[0].data[i][79]) > 3) {
	///
							if(arguments[0].data[i][92] == '' || arguments[0].data[i][93] == '' || arguments[0].data[i][94] == '' || arguments[0].data[i][95] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft), 4) Duration in flight when detected (h:mm:ss), 4) Closet Proximity to UA (ft), and 4) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][92])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][93].length == 7 && Number.isInteger(Number(arguments[0].data[i][93].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][94])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][95].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '4) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][92]) && Number(arguments[0].data[i][94]) && (arguments[0].data[i][95].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][95].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA4 = arguments[0].data[i][92] + "#" + arguments[0].data[i][93].replace(/[:]/g,"") + "##" + arguments[0].data[i][94] + "###" + arguments[0].data[i][95].toUpperCase() + "####"; }
						}		
	
						if(Number(arguments[0].data[i][79]) > 4) {
			
							if(arguments[0].data[i][96] == '' || arguments[0].data[i][97] == '' || arguments[0].data[i][98] == '' || arguments[0].data[i][99] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft), 5) Duration in flight when detected (h:mm:ss), 5) Closet Proximity to UA (ft), and 5) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][96])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][97].length == 7 && Number.isInteger(Number(arguments[0].data[i][97].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 

							if(Number(arguments[0].data[i][98])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][99].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '5) Outcome?' is required and must contain an option from the select menu"; }
//04/29			
							if(Number(arguments[0].data[i][96]) && Number(arguments[0].data[i][96]) && (arguments[0].data[i][99].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][99].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA5 = arguments[0].data[i][96] + "#" + arguments[0].data[i][97].replace(/[:]/g,"") + "##" + arguments[0].data[i][98] + "###" + arguments[0].data[i][99].toUpperCase() + "####"; }
						}	
///
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' must be a whole number"; }
					}
					else if(arguments[0].data[i][78].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][79] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' is required and must be a whole number when 'Were there any aircraft detected that could potentially impede the UA's flight path?' is set to Yes"; }
					else if(arguments[0].data[i][78].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][79] != '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' should not contain a value when answering No to 'Were there any aircraft detected that could potentially impede the UA's flight path?'"; }

					if(arguments[0].data[i][100] != '' || arguments[0].data[i][101] != '' || arguments[0].data[i][102] != '') {
						if(arguments[0].data[i][100] == '' || arguments[0].data[i][101] == '' || arguments[0].data[i][102] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs), Does cargo contain hazardous material?, and Payload Description' are all required for Cargo Delivery"; }
	
						if(arguments[0].data[i][100] != '') {					
							if(Number(arguments[0].data[i][100]) || Number(arguments[0].data[i][100]) == 0) { theTEMP.PayloadWeight = arguments[0].data[i][100]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs)' is required for Cargo Delivery and must be a number"; }	
						}
						if(arguments[0].data[i][101].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'No'.toUpperCase()) { theTEMP.HazardousMaterial = arguments[0].data[i][101].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Does cargo contain hazardous material?' is required for Cargo Delivery and must contain a Yes or No"; }
		
						if(arguments[0].data[i][102] != '') { theTEMP.PayloadDescription = arguments[0].data[i][102];	}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Description' is required for Cargo Delivery"; }
					}

					if(arguments[0].data[i][103] != '') {
						if(Number(arguments[0].data[i][103])) { theTEMP.NightOperationsDistance = arguments[0].data[i][103]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Maximum distance between the Observer and UA (NM)' is required for Night Operations and must be a number"; }
					}
	
					if(arguments[0].data[i][104] != '' || arguments[0].data[i][105] != '' || arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '') {
	
						if(arguments[0].data[i][104] == '' || arguments[0].data[i][105] == '' || arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned, Total Simultaneously Operating Uas - Actual, Minimum Distance Between UAs (ft) - Planned, and Minimum Distance Between UAs (ft) - Actual' are all required for One To Many (1:n)"; }
						
						if(arguments[0].data[i][104] != '') {
							if(Number.isInteger(Number(arguments[0].data[i][104]))) { theTEMP.UTMPlannedSimultaneously = arguments[0].data[i][104]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned' is required for One To Many (1:n) and must be a whole number"; }
						}
						if(arguments[0].data[i][105] != '') {	
							if(Number.isInteger(Number(arguments[0].data[i][105]))) { theTEMP.UTMActualSimultaneously = arguments[0].data[i][105]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Actual' is required for One To Many (1:n) and must be a whole number"; }
						}	
						if(arguments[0].data[i][106] != '') {
							if(Number(arguments[0].data[i][106])) { theTEMP.UTMPlannedDistance = arguments[0].data[i][106]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Planned' is required for One To Many (1:n) and must be a number"; }
						}
						if(arguments[0].data[i][107] != '') {
							if(Number(arguments[0].data[i][107])) { theTEMP.UTMActualDistance = arguments[0].data[i][107]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Actual' is required for One To Many (1:n) and must be a number"; }
						}
					}

					function guidGenerator() { var S4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }; return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }	 
	
					theTEMP.RegistrationNumber = guidGenerator() + Date.now();		
					theTEMP.AdditionalNotes = arguments[0].data[i][108]; //DONE TXT				
					theTEMP.ParticipantDesignator = theParticipantDesignator; //DONE
					theTEMP.Import = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.toLocaleTimeString(); //DONE
	
					theCOMPLETE.push({ theTEMP });
					var theTEMP = 0;				

				}
				else { killloop = 1; }
				
				i++;
				therow++;
			}
			

			if(rows > thelimit) { thestatus = "\n\nThere is a " + thelimit + " flight maximum when importing!"; }

			if(thestatus == undefined || thestatus == "") {

				var ed = 0;
				while(ed < theCOMPLETE.length) {
					if(conopsprogtype == "IPP") { createListItemREST(theFlights, theCOMPLETE[ed].theTEMP); }
					if(conopsprogtype == "PSP") { createListItemREST(thePSPFlights, theCOMPLETE[ed].theTEMP); }

					ed = ed + 1;
					console.log("Row: " + ed + " processed sucessfully...");
				}
				ExpectedFlight = CountFlight + ed;

				if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
				if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

				while(ExpectedFlight != NewFlight) {

					if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
					if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

					console.log(NewFlight + " of " + ExpectedFlight + " inserted sucessfully...");
				}
				document.getElementById("thestatusmsg").value = "You have successfully imported " + ed + " flight(s)...";
			}
			else {
				document.getElementById("thestatusmsg").value = "Import canceled\n\nError(s) in import which need to be addressed:" + thestatus;			}
			stepped = 0;
			chunks = 0;
			rows = 0;
			pauseChecked = false;
			printStepChecked = false;
			theTEMP = {};
			theCOMPLETE = [];
			theLoggedType = "";
			killloop = 0;	
}

function completeFnLNVRENOOperations()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length - 3;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
	
			var i = 2;
			var therow = i + 1;

			var thestatus = "";

			while(i < arguments[0].data.length - 1 && killloop != 1 && rows < thelimit) {						

				if(arguments[0].data[0][0] != 'VERSION 1.4') { killloop = 1; thestatus = thestatus + "\n\nThe current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; document.getElementById("thestatusmsg").value = "The current version of the spreadsheet is 1.4.\nPlease download the current spreadsheet..."; }

				if(arguments[0].data[i][1] != '' && arguments[0].data[i][2] != '') {
				
					var theTEMP = {};
					
					if(getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'CONOPS' you entered must exist in the system"; }
					else {
						theTEMP.Mission = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Name;
						theTEMP.MissionID = JSON.stringify(getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Id);
						theTEMP.MissionDescription = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).Description;
						theTEMP.ProgramType = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).ProgramType;
						conopsprogtype = getCONOP(theMissions, arguments[0].data[i][1], theParticipantDesignator).ProgramType;
						if(conopsprogtype == "IPP") { CountFlight = getTheFlightsCount(theFlights); }
						if(conopsprogtype == "PSP") { CountFlight = getTheFlightsCount(thePSPFlights); }						
					}	

					if(getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Operation' you entered must exist in the system"; }
					else { 
						theTEMP.Operation = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Name;
						theTEMP.OperationID = JSON.stringify(getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Id);
						theTEMP.OperationDescription = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).Description;
						theTEMP.LocalGovtRegulation = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).LocalGovtRegulation;
						theTEMP.NCAISCode = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).NAICSCode;
						theTEMP.OperationType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationType;
						OperationType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationType;
						theTEMP.OperationWaivers = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).OperationWaivers;
						theTEMP.PublicPrivate = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).PublicPrivate;
						theTEMP.IndustryType = getOperation(theOperations, arguments[0].data[i][2], theParticipantDesignator).IndustryType;
					}	


					if(OperationType.toUpperCase().indexOf("BVLOS") != -1 && (arguments[0].data[i][78] == '' || arguments[0].data[i][79] == '' || arguments[0].data[i][80] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Distance Traveled BVLOS (NM)', 'Duration Traveled BVLOS (h:mm:ss)', and Question 'Were there any aircraft detected that could potentially impede the UA's flight path?' are required for a BVLOS associated Operation"; }
					if(OperationType.toUpperCase().indexOf("BVLOS") == -1 && (arguments[0].data[i][78] != '' || arguments[0].data[i][79] != '' || arguments[0].data[i][80] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'BVLOS' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") != -1 && (arguments[0].data[i][102] == '' || arguments[0].data[i][103] == '' || arguments[0].data[i][104] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Weight (lbs)', Question 'Does cargo contain hazardous material?', and 'Payload Description' are required for a Cargo Delivery associated Operation"; }
					if(OperationType.toUpperCase().indexOf("CARGO DELIVERY") == -1 && (arguments[0].data[i][102] != '' || arguments[0].data[i][103] != '' || arguments[0].data[i][104] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Cargo Delivery' to import associated fields to be imported."; }

					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") != -1 && (arguments[0].data[i][105] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Maximum distance between the Observer and UA (NM)' is required for a Night Operations associated Operation"; }
					if(OperationType.toUpperCase().indexOf("NIGHT OPERATIONS") == -1 && (arguments[0].data[i][105] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'Night Operations' to import associated fields to be imported."; }
	
					if(OperationType.toUpperCase().indexOf("UTM") == -1 && (arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '' || arguments[0].data[i][108] != '' || arguments[0].data[i][109] != '')) { thestatus = thestatus + "\n\nRow " + therow + " : Operation Type must include 'One To Many' to import associated fields to be imported."; }
					if(OperationType.toUpperCase().indexOf("UTM") != -1 && (arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '' || arguments[0].data[i][108] == '' || arguments[0].data[i][109] == '')) { thestatus = thestatus + "\n\nRow " + therow + " : 'Total Simultaneously Operating UAs Planned and Actual', and 'Minimum Distance Between UAs (ft) Planned and Actual' are required for a One To Many associated Operation"; }

					var date = new Date(arguments[0].data[i][3]);
					var start_date = date;
					var checkdate = arguments[0].data[i][3];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.StartTime = arguments[0].data[i][3]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Start Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					var date = new Date(arguments[0].data[i][4]);
					var end_date = date;
					var checkdate = arguments[0].data[i][4];

					if(date instanceof Date && !isNaN(date.valueOf()) && (checkdate.replace(/[0-9 ]/g, '') == "//:AM" || checkdate.replace(/[0-9 ]/g, '') == "//:PM")) { theTEMP.EndTime = arguments[0].data[i][4]; }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'End Date/Time (Local Time)' is required and must be entered in the following format: 8/15/2018 2:59 PM"; }
	
					if(start_date >= end_date) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Start Date/Time' must precede the 'End Date/Time'"; }
	
					if(arguments[0].data[i][5] != "") { theTEMP.LaunchLocation = arguments[0].data[i][5]; }	
					
					if(arguments[0].data[i][6].toUpperCase() == 'Alabama'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Alaska'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Arizona'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Arkansas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'California'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Colorado'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Connecticut'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Delaware'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Florida'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Georgia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Hawaii'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Idaho'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Illinois'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Indiana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Iowa'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Kansas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Kentucky'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Louisiana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Maine'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Maryland'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Massachusetts'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Michigan'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Minnesota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Mississippi'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Missouri'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Montana'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Nebraska'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Nevada'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Hampshire'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Jersey'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New Mexico'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'New York'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'North Carolina'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'North Dakota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Ohio'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Oklahoma'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Oregon'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Pennsylvania'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Rhode Island'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'South Carolina'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'South Dakota'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Tennessee'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Texas'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Utah'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Vermont'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Virginia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Washington'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'West Virginia'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Wisconsin'.toUpperCase() || arguments[0].data[i][6].toUpperCase() == 'Wyoming'.toUpperCase() || arguments[0].data[i][4].toUpperCase() == 'Israel'.toUpperCase()) { theTEMP.LaunchLocation2 = arguments[0].data[i][6].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launch Location State' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][7] != '') {
						if(Number(arguments[0].data[i][7])) { theTEMP.LLLatitude = arguments[0].data[i][7]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Latitude (DD)' must be a decimal number"; }
					}
					if(arguments[0].data[i][8] != '') {
						if(Number(arguments[0].data[i][8])) { theTEMP.LLLongitude = arguments[0].data[i][8]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Launch Location Longitude (DD)' must be a decimal number"; }
					}

					if(arguments[0].data[i][5] == "" && (arguments[0].data[i][7] == "" || arguments[0].data[i][8] == "")) { thestatus = thestatus + "\n\nRow " + therow + " : Either 'Launch Location City or Launch Location Latitude and Longitude' must be provided with the Launch Location State"; }

					if(arguments[0].data[i][9].toUpperCase() == 'Catapult or Rail Launch'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Hand Launch'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Launch from Vehicle'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Vertical Take-Off'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Wheeled Take-Off'.toUpperCase() || arguments[0].data[i][9].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LaunchMethod = arguments[0].data[i][9].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Launching Method' is required and must contain an option from the select menu"; }

					if(arguments[0].data[i][9].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][10] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Launching Method' please provide Other"; }
					else if(arguments[0].data[i][9] == 'Other' && arguments[0].data[i][10] != '') { theTEMP.LaunchMethodOther = arguments[0].data[i][10].toUpperCase(); }
	
					if(arguments[0].data[i][11] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Aircraft' is required and must contain an option from the system manage aircraft"; }
					else { 					
						if(getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator) == undefined) { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Name' you entered must exist in the system under Manage Aircraft"; }
						else {
							theTEMP.Aircraft = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Name;
							theTEMP.AircraftID = JSON.stringify(getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Id);
							theTEMP.AircraftDescription = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Description;
							theTEMP.AircraftConfiguration = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Configuration;
							theTEMP.AircraftWeight = getAircraft(theAircrafts, arguments[0].data[i][11], theParticipantDesignator).Weight;	
						}	
					}

					if(arguments[0].data[i][12] != '') { theTEMP.AircraftConfiguration = arguments[0].data[i][12]; theTEMP.AircraftOverrides = "Configuration"; }

					if(arguments[0].data[i][13] != '') {
						if(Number(arguments[0].data[i][13])) { 						
							theTEMP.AircraftWeight = arguments[0].data[i][13]; 
									
							if(theTEMP.AircraftOverrides == undefined) { theTEMP.AircraftOverrides = "Weight"; }
							else { theTEMP.AircraftOverrides = theTEMP.AircraftOverrides + ", Weight"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Aircraft Weight' must abe a number"; }
					}
					
					if(arguments[0].data[i][14].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1 || arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1) { theTEMP.WeatherSources = arguments[0].data[i][14].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' is required and must contain an option from the menu"; }
	
					var datai8 = 0;
					if(arguments[0].data[i][14].toUpperCase().indexOf("Aviation Weather (NOAA)".toUpperCase()) != -1) { datai8 = datai8 + 21; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("ASOS/AWOS".toUpperCase()) != -1) { datai8 = datai8 + 9; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("On-site Instrumentation".toUpperCase()) != -1) { datai8 =  datai8 + 22; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }										
					if(arguments[0].data[i][14].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Weather Sources' contains incorrect data"; }
					if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][15] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Weather Sources' please provide Other"; }
					else if(arguments[0].data[i][14].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][15] != '') { theTEMP.WeatherSourcesOther = arguments[0].data[i][15]; }
//05/02
					if(arguments[0].data[i][16].toUpperCase().indexOf("Class B".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class C".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class D".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class E".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("Class G".toUpperCase()) != -1 || arguments[0].data[i][16].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class B".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class C".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class D".toUpperCase()) != -1) { datai8 =  datai8 + 6; }
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class E".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][16].toUpperCase().indexOf("Class G".toUpperCase()) != -1) { datai8 =  datai8 + 6; }										
						if(arguments[0].data[i][16].toUpperCase().indexOf("SUA".toUpperCase()) != -1) { datai8 =  datai8 + 3; }										
						if(arguments[0].data[i][16].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' contains incorrect data"; }
					
						theTEMP.OperationAirSpaceClass = arguments[0].data[i][16].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Operating Airspace' is required and must contain an option from the menu"; }

					if(arguments[0].data[i][17].toUpperCase() == 'Rural'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'Urban'.toUpperCase() || arguments[0].data[i][17].toUpperCase() == 'Assembly'.toUpperCase()) { theTEMP.PopulationDensity = arguments[0].data[i][17].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Most Dense Population Area Flown Over' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][18].toUpperCase() == 'No'.toUpperCase()) { theTEMP.BoundingBox = arguments[0].data[i][18].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Is geofencing implemented?' is required and must contain a Yes or No"; }

					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' is required if 'Yes' is selected for 'Is geofencing implemented?'"; }
	
					if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][19].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ExceedBounding = arguments[0].data[i][19].toUpperCase(); }
//05/02
					else if(arguments[0].data[i][18].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][19].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][19].toUpperCase() == 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' should not contain a value"; }
					else if(arguments[0].data[i][18].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][19].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA cross geofencing boundary?' must contain a Yes or No"; }
	
					if(arguments[0].data[i][20].toUpperCase().indexOf("Part 61".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Part 107".toUpperCase()) != -1 || arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						var datai8 = 0;
						if(arguments[0].data[i][20].toUpperCase().indexOf("Part 61".toUpperCase()) != -1) { datai8 = datai8 + 6; }
						if(arguments[0].data[i][20].toUpperCase().indexOf("Part 107".toUpperCase()) != -1) { datai8 = datai8 + 7; }
						if(arguments[0].data[i][20].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][20].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' contains incorrect data"; }
					
						theTEMP.CertificationsType = arguments[0].data[i][20].toUpperCase(); 				
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'RPIC Certifications' is required and must contain an option from the menu"; }

					
					if(arguments[0].data[i][21] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][21]))) { theTEMP.MissionTraining = arguments[0].data[i][19]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Training hours for RPIC (hrs)' must be a whole number"; }				
					}	
	
					if(arguments[0].data[i][22] != '') {
						if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1 || arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
							var datai8 = 0;
							if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) { datai8 = datai8 + 11; }
							if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { datai8 = datai8 + 14; }
							if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { datai8 = datai8 + 7; }				
							if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
							if(arguments[0].data[i][22].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' contains incorrect data"; }
						
							theTEMP.UTMCrewRoles = arguments[0].data[i][22].toUpperCase();
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Additional Crew Members' must contain an option from the menu"; }
					}

					if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) != -1) {
						if(Number.isInteger(Number(arguments[0].data[i][23]))) { theTEMP.UTMCrewRoles2box = arguments[0].data[i][23]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' must be a whole number"; }
	
						if(arguments[0].data[i][23] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("GCS Operator".toUpperCase()) == -1 && arguments[0].data[i][23] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'GCS Operator(s)' should not contain data";
					}									
					if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][24]))) { theTEMP.UTMCrewRoles3box = arguments[0].data[i][24]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' must be a whole number"; }
	
						if(arguments[0].data[i][24] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Visual Observer".toUpperCase()) == -1 && arguments[0].data[i][24] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Visual Observer(s)' should not contain data";
					}	

					if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][25]))) { theTEMP.UTMCrewRoles4box = arguments[0].data[i][25]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' must be a whole number"; }
	
						if(arguments[0].data[i][25] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Manager".toUpperCase()) == -1 && arguments[0].data[i][25] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Manager(s)' should not contain data";
					}	
					if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
						if(Number.isInteger(Number(arguments[0].data[i][26]))) { theTEMP.UTMCrewRoles5box = arguments[0].data[i][26]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' must be a whole number"; }
	
						if(arguments[0].data[i][26] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' is required based on the data supplied"; }
					}
					if(arguments[0].data[i][22].toUpperCase().indexOf("Other".toUpperCase()) == -1 && arguments[0].data[i][26] != '') {
						thestatus = thestatus + "\n\nRow " + therow + " : The number of crew members for 'Other' should not contain data";
					}	

					if(arguments[0].data[i][27] != '') {
						var datai8 = 0;
						if(arguments[0].data[i][27].toUpperCase().indexOf("Radio".toUpperCase()) != -1) { datai8 = datai8 + 5; }
						if(arguments[0].data[i][27].toUpperCase().indexOf("Landline".toUpperCase()) != -1) { datai8 = datai8 + 8; }
						if(arguments[0].data[i][27].toUpperCase().indexOf("Cell Phone".toUpperCase()) != -1) { datai8 = datai8 + 9; }				
						if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; }
						if(arguments[0].data[i][27].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Coordination Methods between Crew Members' contains incorrect data"; }
					
						theTEMP.UTMPlannedCoordination = arguments[0].data[i][27].toUpperCase(); 				
					}
					if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][28] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Coordination Methods between Crew Members' please provide Other"; }
					else if(arguments[0].data[i][27].toUpperCase().indexOf("Other".toUpperCase()) != -1 && arguments[0].data[i][28] != '') { theTEMP.UTMPlannedCoordinationOther = arguments[0].data[i][28]; }
//05/02
					if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][29].toUpperCase() == 'No'.toUpperCase()) { theTEMP.NeedAirTrafficServices = arguments[0].data[i][29].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight was there contact with Air Traffic Control to receive any services?' is required and must contain a Yes or No"; }
							
					if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][30] != '') { theTEMP.Ifapplicable1 = arguments[0].data[i][30]; }
					else if(arguments[0].data[i][29].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][30] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' is required when selecting Yes to 'During this flight was there contact with Air Traffic Control to receive any services?'"; }
	
					if(arguments[0].data[i][29].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][30] != '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Describe ATC services' should not contain data"; }



					if(arguments[0].data[i][31].length == 7 && Number.isInteger(Number(arguments[0].data[i][31].replace(/[:]/g,"")))) { theTEMP.LatencyThreshold = arguments[0].data[i][31].replace(/[:]/g,""); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
	
					if(arguments[0].data[i][32] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][32]))) { theTEMP.LostLinkOccurrences = arguments[0].data[i][32]; 
					
							if(Number(arguments[0].data[i][32]) > 1) {
							
								if(arguments[0].data[i][33].length == 7 && Number.isInteger(Number(arguments[0].data[i][33].replace(/[:]/g,"")))) {
									theTEMP.LostLinkDuration = arguments[0].data[i][33].replace(/[:]/g,"");
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
								if(arguments[0].data[i][34].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][34].toUpperCase().indexOf("Other".toUpperCase()) != -1) { 
	
									var datai8 = 0;
									if(arguments[0].data[i][34].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][35] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][35]))) { theTEMP.LostLinkIndication1box = arguments[0].data[i][35]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][36] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][36]))) { theTEMP.LostLinkIndication2box = arguments[0].data[i][36]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][37] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][37]))) { theTEMP.LostLinkIndication3box = arguments[0].data[i][37]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Landed at a designated waypoint".toUpperCase()) != -1) { datai8 = datai8 + 27; 
	
										if(arguments[0].data[i][38] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][38]))) { theTEMP.LostLinkIndication4box = arguments[0].data[i][38]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed at a designated waypoint' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Returned to launch site".toUpperCase()) != -1) { datai8 = datai8 + 20; 
	
										if(arguments[0].data[i][39] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][39]))) { theTEMP.LostLinkIndication5box = arguments[0].data[i][39]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Returned to launch site' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][40] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][40]))) { theTEMP.LostLinkIndication6box = arguments[0].data[i][40]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}			
									if(arguments[0].data[i][34].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][41] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][41]))) { theTEMP.LostLinkIndication7box = arguments[0].data[i][41]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][34].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.LostLinkIndication = arguments[0].data[i][34].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
								if(arguments[0].data[i][42] != '') {
									theTEMP.LostLinkIndication7abox = arguments[0].data[i][42];				
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' Lost Link Procedures performed during this flight is required"; }
	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of Lost Link Occurrences' is required and must be a whole number"; }

	
	
					if(arguments[0].data[i][43].length == 7 && Number.isInteger(Number(arguments[0].data[i][43].replace(/[:]/g,"")))) { theTEMP.GLatencyThreshold = arguments[0].data[i][43].replace(/[:]/g,""); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Lost Link Latency Threshold (h:mm:ss)' is required and must be in the format provided"; }
	
		
					if(arguments[0].data[i][44] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][44]))) { theTEMP.GLostLinkOccurrences = arguments[0].data[i][44]; 
					
							if(Number(arguments[0].data[i][44]) > 1) {
	

								if(arguments[0].data[i][45].length == 7 && Number.isInteger(Number(arguments[0].data[i][45].replace(/[:]/g,"")))) {
									theTEMP.GLostLinkDuration = arguments[0].data[i][45].replace(/[:]/g,"");	
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Longest duration of a GPS Lost Link Occurrence (h:mm:ss)' is required and must be in the format provided"; }
	
	
								if(arguments[0].data[i][46].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1 || arguments[0].data[i][46].toUpperCase().indexOf("Other".toUpperCase()) != -1) {
	
									var datai8 = 0;
									if(arguments[0].data[i][46].toUpperCase().indexOf("Continued flight".toUpperCase()) != -1) { datai8 = datai8 + 15; 
										if(arguments[0].data[i][47] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][47]))) { theTEMP.GLostLinkIndication1box = arguments[0].data[i][47]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Continued flight' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].toUpperCase().indexOf("Hovered in place until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 42; 
	
										if(arguments[0].data[i][48] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][48]))) { theTEMP.GLostLinkIndication2box = arguments[0].data[i][48]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Hovered in place until connection reestablished' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].toUpperCase().indexOf("Entered a holding pattern until connection reestablished".toUpperCase()) != -1) { datai8 = datai8 + 50; 
	
										if(arguments[0].data[i][49] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][49]))) { theTEMP.GLostLinkIndication3box = arguments[0].data[i][49]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Entered a holding pattern until connection reestablished' is required and must be a whole number"; }	
									}				
									if(arguments[0].data[i][46].toUpperCase().indexOf("Landed immediately".toUpperCase()) != -1) { datai8 = datai8 + 17; 
	
										if(arguments[0].data[i][50] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][50]))) { theTEMP.GLostLinkIndication6box = arguments[0].data[i][50]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Landed immediately' is required and must be a whole number"; }
									}				
									if(arguments[0].data[i][46].toUpperCase().indexOf("Other".toUpperCase()) != -1) { datai8 =  datai8 + 5; 
	
										if(arguments[0].data[i][51] != '') {	
											if(Number.isInteger(Number(arguments[0].data[i][51]))) { theTEMP.GLostLinkIndication7box = arguments[0].data[i][51]; }
											else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
										}
										else { thestatus = thestatus + "\n\nRow " + therow + " : The GPS Lost Link Procedures occurrences for 'Other' is required and must be a whole number"; }
									}
									if(arguments[0].data[i][46].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' contains incorrect data"; }
								
									theTEMP.GLostLinkIndication = arguments[0].data[i][46].toUpperCase(); 
								}
								else { thestatus = thestatus + "\n\nRow " + therow + " : 'Please indicate GPS Lost Link Procedures performed during this flight and the number of times each occurred' must contain an option from the menu"; }
	
								if(arguments[0].data[i][52] != '') { theTEMP.GLostLinkIndication7abox = arguments[0].data[i][52];	}
								if(arguments[0].data[i][51] != '' && arguments[0].data[i][51] == '') { thestatus = thestatus + "\n\nRow " + therow + " : 'Please Describe' GPS Lost Link Procedures performed during this flight is required"; }

///	
							}
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Number of GPS Lost Link Occurrences' is required and must be a whole number"; }		
//05/02

					
					if(arguments[0].data[i][53].toUpperCase() == 'Manual'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Semi-Automatic'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Automatic'.toUpperCase() || arguments[0].data[i][53].toUpperCase() == 'Semi-Autonomous'.toUpperCase()) { theTEMP.Levelhumaninvolvement = arguments[0].data[i][53].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Level of Automation' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][54] != '') {
						if(Number(arguments[0].data[i][54]) || arguments[0].data[i][54] == "0") { theTEMP.TotalDistTraveled = arguments[0].data[i][54]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled (NM)' is required and  must be a number"; }
	
					if(arguments[0].data[i][55] != '') {	
						if(Number(arguments[0].data[i][55])) { theTEMP.MaxRPICtoUA = arguments[0].data[i][55]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Distance Between RPIC and UA (NM)' is required and  must be a number"; }
					
					if(arguments[0].data[i][56] != '') {				
						if(Number(arguments[0].data[i][56])) { theTEMP.MaxPlannedAltitude = arguments[0].data[i][56]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					}	
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Planned' is required and  must be a number"; }
					
					if(arguments[0].data[i][57] != '') {				
						if(Number(arguments[0].data[i][57])) { theTEMP.MaxActualAltitude = arguments[0].data[i][57]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Altitude (Feet AGL) - Actual' is required and  must be a number"; }
	
					if(arguments[0].data[i][58] != '') {					
						if(Number(arguments[0].data[i][58])) { theTEMP.Velocity = arguments[0].data[i][58]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Planned' is required and  must be a number"; }
	
					if(arguments[0].data[i][59] != '') {
						if(Number(arguments[0].data[i][59])) { theTEMP.Velocity2 = arguments[0].data[i][59]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }
					}
					else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cruise/Average Speed (kts) - Actual' is required and  must be a number"; }

					if(arguments[0].data[i][60].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][60].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DesignatedLandingArea = arguments[0].data[i][60].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA Land in Designated Landing Area?' is required and must contain a Yes or No"; }
	//05/02
					if(arguments[0].data[i][60].toUpperCase() == 'No'.toUpperCase()) {
						if(arguments[0].data[i][61] != '' && Number(arguments[0].data[i][61])) {
							if(Number(arguments[0].data[i][61])) { theTEMP.DestinationConformance = arguments[0].data[i][61]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Deviation from Landing Area (ft)' is required and must be a number"; }
					}				
					if(arguments[0].data[i][62].toUpperCase() == 'Vertical Landing'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Runway'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Capture System'.toUpperCase() || arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase()) { theTEMP.LandMethod = arguments[0].data[i][62].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Landing Method' is required and must contain an option from the select menu"; }
	
					if(arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][63] == '') { thestatus = thestatus + "\n\nRow " + therow + " : When selecting the option Other for 'Landing Method' please provide Other"; }
					else if(arguments[0].data[i][62].toUpperCase() == 'Other'.toUpperCase() && arguments[0].data[i][63] != '') { theTEMP.LandMethodOther = arguments[0].data[i][63]; }
	
					if(arguments[0].data[i][64].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][64].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADeviate = arguments[0].data[i][64].toUpperCase(); }
					else { thestatus = thestatus + "\n\nRow " + therow + " : 'Did UA deviate from planned flight path?' must contain a Yes or No"; }



//05/02

					if(arguments[0].data[i][64].toUpperCase() == 'Yes'.toUpperCase()) {
						if(arguments[0].data[i][65] != '') {
							if(Number(arguments[0].data[i][65]) >= 0) { theTEMP.HMax = arguments[0].data[i][65]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' must be a number2"; }		
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Horizontal' is required and must be a number3"; }				

						if(arguments[0].data[i][66] != '') {
							if(Number(arguments[0].data[i][66]) >= 0) { theTEMP.VMax = arguments[0].data[i][66]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' must be a number"; }
						}								
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Max Deviation from Flight Path (ft) - Vertical' is required and must be a number"; }				
					}

	
					if(arguments[0].data[i][67] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][67]))) { 
							theTEMP.IntermediateTL = arguments[0].data[i][67]; 						
														
							if(arguments[0].data[i][68].length == 7 && Number.isInteger(Number(arguments[0].data[i][68].replace(/[:]/g,"")))) { theTEMP.FlightDuration = arguments[0].data[i][68].replace(/[:]/g,""); }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Flight Duration (h:mm:ss)' must be in the format provided and is required if 'Intermediate Take off / Landing' is filled in"; }
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Intermediate Take off / Landing' must be a whole number"; }

					}
			

/////INCREASE BY 2 /////////////////////////////

					if(arguments[0].data[i][69].toUpperCase() == 'No'.toUpperCase()) { theTEMP.ReportAccidentIncident = arguments[0].data[i][69].toUpperCase(); }	

					if(arguments[0].data[i][69].toUpperCase() == 'Yes'.toUpperCase()) { 
						theTEMP.ReportAccidentIncident = arguments[0].data[i][69].toUpperCase(); 
	
						if(arguments[0].data[i][70].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1 || arguments[0].data[i][70].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1 || arguments[0].data[i][70].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1 || arguments[0].data[i][70].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1 || arguments[0].data[i][70].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) {
							var datai8 = 0;
							if(arguments[0].data[i][70].toUpperCase().indexOf("Critical hardware/software malfunctions".toUpperCase()) != -1) { datai8 = datai8 + 37; }
							if(arguments[0].data[i][70].toUpperCase().indexOf("Damage to the UA".toUpperCase()) != -1) { 
								datai8 = datai8 + 13; 
	
								if(arguments[0].data[i][71]!= '' && Number(arguments[0].data[i][71])) { theTEMP.CostofDamagesUAV = arguments[0].data[i][71]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the UA ($)' is required and must be a number"; }
							}
							if(arguments[0].data[i][70].toUpperCase().indexOf("Damage to property".toUpperCase()) != -1) { 
								datai8 = datai8 + 16; 
///							
								if(arguments[0].data[i][72]!= '' && Number(arguments[0].data[i][72])) { theTEMP.CostofDamagesProperty = arguments[0].data[i][72]; }
								else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Cost of Damages to the Property ($)' is required and  must be a number"; }						
							}		
									
							if(arguments[0].data[i][70].toUpperCase().indexOf("Injuries to people/animals".toUpperCase()) != -1) { datai8 = datai8 + 24; }				
							if(arguments[0].data[i][70].toUpperCase().indexOf("Public Disturbance".toUpperCase()) != -1) { datai8 =  datai8 + 17; }
							if(arguments[0].data[i][70].replace(/[,\s]+|[,\s]+/g,'').length != datai8) { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' contains incorrect data"; }
							theTEMP.WhatOccurred = arguments[0].data[i][70]; 


							if(arguments[0].data[i][68].length == 7 && Number.isInteger(Number(arguments[0].data[i][68].replace(/[:]/g,"")))) { theTEMP.AccidentOccurrenceTime = arguments[0].data[i][68].replace(/[:]/g,""); }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration in flight (h:mm:ss)' is required and must be in the format provided"; }
			
							if(Number(arguments[0].data[i][74])) { theTEMP.AccidentLatitude = arguments[0].data[i][74]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Latitude' is required and  must be a number"; }
			
							if(Number(arguments[0].data[i][75])) { theTEMP.AccidentLongitude = arguments[0].data[i][75]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Location of Occurrence (DD) - Longtitude' is required and must be a number"; }

							if(arguments[0].data[i][76] != '') { theTEMP.AccidentDescription = arguments[0].data[i][76]; }			
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Description of what occurred is required and must contain a value"; }	
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'What Occurred?' must contain an option from the menu"; }				
					}

					if(arguments[0].data[i][69].toUpperCase() != 'Yes'.toUpperCase() && arguments[0].data[i][69].toUpperCase() != 'No'.toUpperCase()) { thestatus = thestatus + "\n\nRow " + therow + " : 'During this flight, did you experience any: (1) Critical hardware/software malfunctions; (2) Damage to the UA; (3) Damage to property; (4) Injuries to people/animals and/or (5) Public Disturbance?' is required and must contain a Yes or No"; }	
	
	
	
					if(arguments[0].data[i][78] != '' || arguments[0].data[i][79] != '' || arguments[0].data[i][80] != '') {
	
						if(arguments[0].data[i][78] == '' || arguments[0].data[i][79] == '' || arguments[0].data[i][80] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM), Duration Traveled BVLOS (h:mm:ss), and Were there any aircraft detected that could potentially impede the UA's flight path?' are all required for BVLOS"; }
										
						if(arguments[0].data[i][78] != '') {
							if(Number(arguments[0].data[i][78])) { theTEMP.BVLOSDistance = arguments[0].data[i][78]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Distance Traveled BVLOS (NM)' is required for BVLOS and must be a number"; }
						}
	
						if(arguments[0].data[i][79].length == 7 && Number.isInteger(Number(arguments[0].data[i][79].replace(/[:]/g,"")))) { theTEMP.BVLOSTime = arguments[0].data[i][79].replace(/[:]/g,""); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Duration Traveled BVLOS (h:mm:ss)' is required for BVLOS and must be in the format provided"; }				
											
						if(arguments[0].data[i][80].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][80].toUpperCase() == 'No'.toUpperCase()) { theTEMP.DidUADetect = arguments[0].data[i][80].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Were there any aircraft detected that could potentially impede the UA's flight path?' is required for BVLOS and must contain a Yes or No"; }				
					}

				
	
					if(arguments[0].data[i][80].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][81] != '') {
						if(Number.isInteger(Number(arguments[0].data[i][81]))) { theTEMP.BVLOSDetected = arguments[0].data[i][81]; 
											
						if(Number(arguments[0].data[i][81]) > 0) {
	
							if(arguments[0].data[i][82] == '' || arguments[0].data[i][83] == '' || arguments[0].data[i][84] == '' || arguments[0].data[i][85] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft), 1) Duration in flight when detected (h:mm:ss), 1) Closet Proximity to UA (ft), and 1) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][82])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Distance from UA when first detected (ft)' is required and must be a number"; }
						
							if(arguments[0].data[i][83].length == 7 && Number.isInteger(Number(arguments[0].data[i][83].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][84])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '1) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][85].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '1) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][82]) && Number(arguments[0].data[i][83]) && (arguments[0].data[i][85].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][85].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA1 = arguments[0].data[i][82] + "#" + arguments[0].data[i][83].replace(/[:]/g,"") + "##" + arguments[0].data[i][84] + "###" + arguments[0].data[i][85].toUpperCase() + "####"; }
						}	
						
						if(Number(arguments[0].data[i][81]) > 1) {
//05/02	
							if(arguments[0].data[i][86] == '' || arguments[0].data[i][87] == '' || arguments[0].data[i][88] == '' || arguments[0].data[i][89] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft), 2) Duration in flight when detected (h:mm:ss), 2) Closet Proximity to UA (ft), and 2) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][86])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Distance from UA when first detected (ft)' is required and must be a number"; }
///			
							if(arguments[0].data[i][87].length == 7 && Number.isInteger(Number(arguments[0].data[i][87].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][88])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '2) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][89].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '2) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][86]) && Number(arguments[0].data[i][88]) && (arguments[0].data[i][89].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][89].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA2 = arguments[0].data[i][86] + "#" + arguments[0].data[i][87].replace(/[:]/g,"") + "##" + arguments[0].data[i][88] + "###" + arguments[0].data[i][89].toUpperCase() + "####"; }
						}		
	
	
			
						if(Number(arguments[0].data[i][81]) > 2) {
	
							if(arguments[0].data[i][90] == '' || arguments[0].data[i][91] == '' || arguments[0].data[i][92] == '' || arguments[0].data[i][93] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft), 3) Duration in flight when detected (h:mm:ss), 3) Closet Proximity to UA (ft), and 3) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][90])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][91].length == 7 && Number.isInteger(Number(arguments[0].data[i][91].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][92])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '3) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][93].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '3) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][90]) && Number(arguments[0].data[i][92]) && (arguments[0].data[i][93].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][93].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA3 = arguments[0].data[i][90] + "#" + arguments[0].data[i][91].replace(/[:]/g,"") + "##" + arguments[0].data[i][92] + "###" + arguments[0].data[i][93].toUpperCase() + "####"; }
						}
			
						if(Number(arguments[0].data[i][81]) > 3) {
	///
							if(arguments[0].data[i][94] == '' || arguments[0].data[i][95] == '' || arguments[0].data[i][96] == '' || arguments[0].data[i][97] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft), 4) Duration in flight when detected (h:mm:ss), 4) Closet Proximity to UA (ft), and 4) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][94])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][95].length == 7 && Number.isInteger(Number(arguments[0].data[i][95].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][96])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '4) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][97].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '4) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][94]) && Number(arguments[0].data[i][96]) && (arguments[0].data[i][97].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][97].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA4 = arguments[0].data[i][94] + "#" + arguments[0].data[i][95].replace(/[:]/g,"") + "##" + arguments[0].data[i][96] + "###" + arguments[0].data[i][97].toUpperCase() + "####"; }
						}		
	
						if(Number(arguments[0].data[i][81]) > 4) {
			
							if(arguments[0].data[i][98] == '' || arguments[0].data[i][99] == '' || arguments[0].data[i][100] == '' || arguments[0].data[i][101] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft), 5) Duration in flight when detected (h:mm:ss), 5) Closet Proximity to UA (ft), and 5) Outcome?' are all required"; }
	
							if(Number(arguments[0].data[i][98])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Distance from UA when first detected (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][99].length == 7 && Number.isInteger(Number(arguments[0].data[i][99].replace(/[:]/g,"")))) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Duration in flight when detected (h:mm:ss)' is required and must be in the format provided"; } 
			
							if(Number(arguments[0].data[i][100])) {  }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The '5) Closet Proximity to UA (ft)' is required and must be a number"; }
			
							if(arguments[0].data[i][101].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'Other'.toUpperCase()) { }
							else { thestatus = thestatus + "\n\nRow " + therow + " : '5) Outcome?' is required and must contain an option from the select menu"; }
			
							if(Number(arguments[0].data[i][98]) && Number(arguments[0].data[i][100]) && (arguments[0].data[i][101].toUpperCase() == 'No Action Taken'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'Evasive Action Taken'.toUpperCase() || arguments[0].data[i][101].toUpperCase() == 'Other'.toUpperCase())) { theTEMP.DAA5 = arguments[0].data[i][98] + "#" + arguments[0].data[i][99].replace(/[:]/g,"") + "##" + arguments[0].data[i][100] + "###" + arguments[0].data[i][101].toUpperCase() + "####"; }
						}	
///
						}
						else { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' must be a whole number"; }
					}
//05/02
					else if(arguments[0].data[i][80].toUpperCase() == 'Yes'.toUpperCase() && arguments[0].data[i][81] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' is required and must be a whole number when 'Were there any aircraft detected that could potentially impede the UA's flight path?' is set to Yes"; }
					else if(arguments[0].data[i][80].toUpperCase() == 'No'.toUpperCase() && arguments[0].data[i][81] != '') { thestatus = thestatus + "\n\nRow " + therow + " : The '# of Aircraft Detected (Maximum 5)' should not contain a value when answering No to 'Were there any aircraft detected that could potentially impede the UA's flight path?'"; }

					if(arguments[0].data[i][102] != '' || arguments[0].data[i][103] != '' || arguments[0].data[i][104] != '') {
						if(arguments[0].data[i][102] == '' || arguments[0].data[i][103] == '' || arguments[0].data[i][104] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs), Does cargo contain hazardous material?, and Payload Description' are all required for Cargo Delivery"; }
	
						if(arguments[0].data[i][102] != '') {					
							if(Number(arguments[0].data[i][102]) || Number(arguments[0].data[i][102]) == 0) { theTEMP.PayloadWeight = arguments[0].data[i][102]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Payload Weight (lbs)' is required for Cargo Delivery and must be a number"; }	
						}
						if(arguments[0].data[i][103].toUpperCase() == 'Yes'.toUpperCase() || arguments[0].data[i][103].toUpperCase() == 'No'.toUpperCase()) { theTEMP.HazardousMaterial = arguments[0].data[i][103].toUpperCase(); }
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Does cargo contain hazardous material?' is required for Cargo Delivery and must contain a Yes or No"; }
		
						if(arguments[0].data[i][104] != '') { theTEMP.PayloadDescription = arguments[0].data[i][104];	}
						else { thestatus = thestatus + "\n\nRow " + therow + " : 'Payload Description' is required for Cargo Delivery"; }
					}

					if(arguments[0].data[i][105] != '') {
						if(Number(arguments[0].data[i][105])) { theTEMP.NightOperationsDistance = arguments[0].data[i][105]; }
						else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Maximum distance between the Observer and UA (NM)' is required for Night Operations and must be a number"; }
					}
	
					if(arguments[0].data[i][106] != '' || arguments[0].data[i][107] != '' || arguments[0].data[i][108] != '' || arguments[0].data[i][109] != '') {
	
						if(arguments[0].data[i][106] == '' || arguments[0].data[i][107] == '' || arguments[0].data[i][108] == '' || arguments[0].data[i][109] == '') { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned, Total Simultaneously Operating Uas - Actual, Minimum Distance Between UAs (ft) - Planned, and Minimum Distance Between UAs (ft) - Actual' are all required for One To Many (1:n)"; }
						
						if(arguments[0].data[i][106] != '') {
							if(Number.isInteger(Number(arguments[0].data[i][106]))) { theTEMP.UTMPlannedSimultaneously = arguments[0].data[i][106]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Planned' is required for One To Many (1:n) and must be a whole number"; }
						}
						if(arguments[0].data[i][107] != '') {	
							if(Number.isInteger(Number(arguments[0].data[i][107]))) { theTEMP.UTMActualSimultaneously = arguments[0].data[i][107]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Total Simultaneously Operating Uas - Actual' is required for One To Many (1:n) and must be a whole number"; }
						}	
						if(arguments[0].data[i][108] != '') {
							if(Number(arguments[0].data[i][108])) { theTEMP.UTMPlannedDistance = arguments[0].data[i][108]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Planned' is required for One To Many (1:n) and must be a number"; }
						}
						if(arguments[0].data[i][109] != '') {
							if(Number(arguments[0].data[i][109])) { theTEMP.UTMActualDistance = arguments[0].data[i][109]; }
							else { thestatus = thestatus + "\n\nRow " + therow + " : The 'Minimum Distance Between UAs (ft) - Actual' is required for One To Many (1:n) and must be a number"; }
						}
					}
	
	
					function guidGenerator() { var S4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }; return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }	 
	
					theTEMP.RegistrationNumber = guidGenerator() + Date.now();			
					theTEMP.AdditionalNotes = arguments[0].data[i][110]; //DONE TXT				
					theTEMP.ParticipantDesignator = theParticipantDesignator; //DONE
					theTEMP.Import = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.toLocaleTimeString(); //DONE	
					theCOMPLETE.push({ theTEMP });
					var theTEMP = 0;				
				}
				else { killloop = 1; }
				
				i++;
				therow++;
			}

			if(rows > thelimit) { thestatus = "\n\nThere is a " + thelimit + " flight maximum when importing!"; }

			if(thestatus == undefined || thestatus == "") {

				var ed = 0;
				while(ed < theCOMPLETE.length) {
					if(conopsprogtype == "IPP") { createListItemREST(theFlights, theCOMPLETE[ed].theTEMP); }
					if(conopsprogtype == "PSP") { createListItemREST(thePSPFlights, theCOMPLETE[ed].theTEMP); }
					ed = ed + 1;
					console.log("Row: " + ed + " processed sucessfully...");
				}
				ExpectedFlight = CountFlight + ed;

				if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
				if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }

				while(ExpectedFlight != NewFlight) {
					if(conopsprogtype == "IPP") { NewFlight = getTheFlightsCount(theFlights); }
					if(conopsprogtype == "PSP") { NewFlight = getTheFlightsCount(thePSPFlights); }
					console.log(NewFlight + " of " + ExpectedFlight + " inserted sucessfully...");
				}
				document.getElementById("thestatusmsg").value = "You have successfully imported " + ed + " flight(s)...";
			}
			else {
				document.getElementById("thestatusmsg").value = "Import canceled\n\nError(s) in import which need to be addressed:" + thestatus;			}
			stepped = 0;
			chunks = 0;
			rows = 0;
			pauseChecked = false;
			printStepChecked = false;
			theTEMP = {};
			theCOMPLETE = [];
			theLoggedType = "";
			killloop = 0;
}
