(function() {
	var theController = function($scope, $uibModal, $http, $q, $log, theService, $routeParams, $sce, $compile, FileUploader) {
		$scope.onCreditCardTypeChanged = function(type) { $scope.model.creditCardType = type; };
	    $scope.model = { rawValue: '' };

	    $scope.options = {
	        thedate: {
	            hms: true,
			    delimiter: '/',
			    blocks: [2, 2, 4],
			    uppercase: true
			},
	        tphone: {
	            tphone: true,
			    delimiter: '-',
			    blocks: [3, 3, 4],
			    uppercase: true
			}
	    };

		function guidGenerator() { var S4 = function() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }; return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }

		$scope.tempGENID = guidGenerator() + Date.now();

		$scope.theurl = "/sites/M_GreenTeams/";
		$scope.urlnow = window.location.href;
		$scope.itemsPerPageFilter = 20;
		$scope.currentPageFilter = 1;
		$scope.theWait = "";
		$scope.theWaitDoc = "";
		$scope.datenow = new Date();
		$scope.theAdministrator = 0;
		$scope.isDone = 0;
		$scope.theUser = 0;
		$scope.theAdmin = 0;
		$scope.theLead = 0;
		$scope.tempUser = [];
		$scope.datamission = [];
		$scope.datarpaid = [];
		$scope.datarpaid2 = [];
		$scope.datameter = [];
		$scope.dataacct = [];
		$scope.VerifyNameLabel = "";
		$scope.tempCAP = {};
		$scope.tempCAPx = {};
		$scope.theWait = "";
		$scope.tempCAPx.SelectRPAID = "";
		$scope.thePage = 1;
		$scope.loader = 0;
		$scope.ConfirmLot = 0;
		$scope.theSubmit = 1;
		$scope.theBy = "RPA ID";


/*		$scope.thePage = 2;


		$scope.tempCAP.LastName = "Owusu-Sakyi";
		$scope.tempCAP.FirstName = "Edward";
		$scope.tempCAP.Email = "Owusu-SakyiE@state.gov";
		$scope.tempCAP.Title = "Mr";
*/

//CALENDAR//
//CALENDAR//
		$scope.calendarView = 'month';
		$scope.viewDate = new Date();		
//CALENDAR//
//CALENDAR//


		var d = new Date();
		$scope.thedate = d.getMonth()+1 + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.toLocaleTimeString();

		function getFormDigest() {
		    return $.ajax({
		        url: "https://usdos.sharepoint.com/sites/M-PRI/Internal/Innovation/_api/contextinfo",
		        method: "POST",
		        headers: { "Accept": "application/json; odata=verbose" }
		    });
		}
		
		$().SPServices({
		      operation: "GetGroupCollectionFromUser",
		      userLoginName: $().SPServices.SPGetCurrentUser(),
		      async: false,
		      completefunc: function(xData, Status) {
				$scope.thisUserAccount = $().SPServices.SPGetCurrentUser({ fieldName: "Title", debug: false });
				$scope.thisUserAccountEmail = $().SPServices.SPGetCurrentUser({ fieldName: "Email", debug: false });
			  }
		});

		function getFormDigest() {
		    return $.ajax({
		        url: location.protocol + "//" + location.host + $scope.theurl + "_api/contextinfo",
		        method: "POST",
		        headers: { "Accept": "application/json; odata=verbose" }
		    });
		}

		
		function formatNumber (num) { return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") }

		var parseDateISO = function(date) {
		if(date) {
			var dt = new Date(parseInt(date.replace(/[^0-9]/g, "")));
			return dt;
			}
			return;
		};

		function parseJsonDate(jsonDateString){
			var thedate = new Date(parseInt(jsonDateString.replace('/Date(', '')));
			var convertdate = new Date(thedate.valueOf() + thedate.getTimezoneOffset() * 60 * 1000);	
			return convertdate.getMonth()+1 + "/" + convertdate.getDate() + "/" + convertdate.getFullYear();
		}		
		
		var parseXml = function (xml) {
			var data = [];
			$(xml).SPFilterNode("z:row").each(function(i,row) {
				var ic = ['string;#',$(row).attr('ows_ID')+';#'];
				var json = {};
				$(row.attributes).each(function(j,nvp) {
					var name = nvp.name.replace('ows_','');
					var value = nvp.value;
					angular.forEach(ic, function(illegal){
						var splitVal = value.split(illegal);
						value = splitVal.join('');
					});
					if (isNaN(value)){ json[name] = value; }
					else if(value == " "){ json[name] = ''; }
					else{ json[name] = parseFloat(value); }
				});
				data.push(json);
			});
			return data;
		};

		var getListItem = function(url, listname, id, complete, failure) {
			$.ajax({
				cache: false,
				url: location.protocol + "//" + location.host + $scope.theurl + "_vti_bin/listdata.svc/" + listname + "(" + id + ")",
				method: "GET",
				headers: { "Accept": "application/json; odata=verbose" },
				success: function (data) { complete(data); },				
				error: function (data) { failure(data); }
			});
		};
		
		var updateListItem = function(listName, data, id){
			$().SPServices({
				operation: "UpdateListItems",
				async: false,
				listName: listName,
				batchCmd: "Update",
				ID: id,
				valuepairs: data,
				completefunc: function(xData, Status) { }
			});
		};

		var createListItemREST = function (listName, metadata) {
			var deferred = $q.defer();
				$.ajax({
					url: location.protocol + "//" + location.host + $scope.theurl + '_vti_bin/listdata.svc/' + listName,
					type: "POST",
					processData: false,
					contentType: "application/json;odata=verbose",
					data: JSON.stringify(metadata),
					headers: { "Accept": "application/json;odata=verbose" },
					success: function (data) { deferred.resolve (data.d); },
					error: function (data) { $log.error('fail: '+JSON.stringify(data)); }
				});
			return deferred.promise;
		};

		var updateListItemREST = function (listName, metadata) {
			if(angular.isString(metadata.Modified)){ metadata.Modified = parseDateISO(metadata.Modified); }
			if(angular.isString(metadata.Created)){ metadata.Created = parseDateISO(metadata.Created); }	
			var deferred = $q.defer();
			
			getListItem(location.protocol + "//" + location.host + $scope.theurl + "_vti_bin/listdata.svc/", listName, metadata.Id, function(data) {
				$.ajax({
					url: data.d.__metadata.uri,
					type: "POST",
					contentType: "application/json;odata=verbose",
					data: JSON.stringify(metadata),
					headers: {
						"Accept": "appliation/json;odata=verbose",
						"X-HTTP-Method": "MERGE",
						"If-Match": data.d.__metadata.etag
					},
					success: function (data) {
						getListItem(location.protocol + "//" + location.host + $scope.theurl + "_vti_bin/listdata.svc/", listName, metadata.Id,
							function(newData) { deferred.resolve(newData.d); }, 
							function (newData) { failure(data); }
						);
					},
					error: function (data) { $log.error('fail: '+JSON.stringify(data)); }
				});
			}, function (data) { failure(data); });
			return deferred.promise;
		};
		//Pagination Handler
		$scope.pageChangeHandler = function(num) { };
		function onFilterChanged(value) { gridOptions.api.setQuickFilter(value); }

		
		$scope.validateEmail = function(email) {
			if(email != '' && email != 'undefined' && email != null) {
			    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			    if(re.test(email.toLowerCase())) {  }
			    else { alert("Please enter a valid email address."); $scope.tempCAP.Email = undefined; }
			}
		};
		$scope.onRadioOptVAT = function(the) {
			if($('#optVATYes')[0].checked == true) { $scope.tempCAP.VAT = "Yes"; $scope.tempCAP.VATOther = undefined; }
			if($('#optVATNo')[0].checked == true) { $scope.tempCAP.VAT = "No"; $scope.tempCAP.VATOther = undefined; }
			if($('#optVATOther')[0].checked == true) { $scope.tempCAP.VAT = "Other"; }

		};
		$scope.onRadioOptAnotherBill = function(the) {
			if($('#optAnotherBillYes')[0].checked == true) { $scope.tempCAP.AnotherBill = "Yes"; }
			if($('#optAnotherBillNo')[0].checked == true) { $scope.tempCAP.AnotherBill = "No"; }
		};

		$scope.onBy = function(the) {
			if($('#optByLot')[0].checked == true) { $scope.theBy = "Lot"; }
			if($('#optByRPAID')[0].checked == true) { $scope.theBy = "RPA ID"; }
		};

		$scope.onRadioOptSubmittedAccountInfo = function(the) {
			if($('#optSubmittedAccountInfoYes')[0].checked == true) { $scope.tempCAP.SubmittedAccountInfo = "Yes"; }
			if($('#optSubmittedAccountInfoNo')[0].checked == true) { $scope.tempCAP.SubmittedAccountInfo = "No"; }
		};
		$scope.onRadioOptSubmittedUtilityBills = function(the) {
			if($('#optSubmittedUtilityBillsYes')[0].checked == true) { $scope.tempCAP.SubmittedUtilityBills = "Yes"; }
			if($('#optSubmittedUtilityBillsNo')[0].checked == true) { $scope.tempCAP.SubmittedUtilityBills = "No"; }
		};
		$scope.onRadioOptCertify = function(the) {
			if($('#optCertifyYes')[0].checked == true) { $scope.tempCAP.Certify = "Yes"; }
			if($('#optCertifyNo')[0].checked == true) { $scope.tempCAP.Certify = "No"; }
		};

		$scope.UpdateLot = function(the, the2) {		
			if(the2 == "Confirm") {
				$scope.thetemp = {};
				$scope.thetemp.Id = the.Id;
				$scope.thetemp.AssociatedLot = document.getElementById(the.RealPropertyUniqueID).value;
				$scope.thetemp.Report = "Yes";
				updateListItemREST("RPAID", JSON.parse(angular.toJson($scope.thetemp))).then(function(d) { });	
				$scope.datarpaid.splice($scope.datarpaid.indexOf(the),1);
			}
			else if(the2 == "Remove") {	
				$scope.thetemp = {};
				$scope.thetemp.Id = the.Id;
				$scope.thetemp.Report = "No";
				updateListItemREST("RPAID", JSON.parse(angular.toJson($scope.thetemp))).then(function(d) { });	
				$scope.datarpaid.splice($scope.datarpaid.indexOf(the),1);
			}	
		};

		$scope.PageRule = function(the) {
			if(the == 1) { $scope.thePage = 1; window.scrollTo(0,0); }
			else if(the == 2)  { $scope.thePage = 2; window.scrollTo(0,0); }
			else if(the == 3)  { 				
				$scope.datarpaid = [];
				theService.getRPAID($scope.tempCAP.Post).then(getRPAIDData);
				$scope.ConfirmLot = 1;
				$scope.thePage = 3; 
				window.scrollTo(0,0);
			}
			else { 	
					$scope.thePage = "Submit";
					var thecc = 0;
					$scope.thepasscount = 0;
					$scope.thepass = 0;

					while(thecc < $scope.dataacct.length) {
						var thecc2 = 0;
						while(thecc2 < $scope.datameter.length) {
							if($scope.datameter[thecc2].AccountNumber == $scope.dataacct[thecc].eAccountNumber) { $scope.thepass = $scope.thepass + 1; }
							thecc2=thecc2+1;
						}
						thecc=thecc+1;
					}

					var thecc2 = 0;
					while(thecc2 < $scope.datameter.length) {
						if($scope.datameter[thecc2].AccountNumber == $scope.tempCAP.AccountNumber) { $scope.thepass = $scope.thepass + 1; }
						thecc2=thecc2+1;
					}

					if($scope.thepass != $scope.dataacct.length+1) { $scope.theWait = "\nYou have an Account Number without an associated Meter Number, please correct."; }
					else if(($scope.tempCAP.Bureau == null || $scope.tempCAP.Bureau == 'undefined' || $scope.tempCAP.Bureau == '') || 
						($scope.dataacct.length+1 != $scope.capuploader.queue.length) ||
						($scope.tempCAP.Mission == null || $scope.tempCAP.Mission == 'undefined' || $scope.tempCAP.Mission == '') || 
						($scope.tempCAP.Post == null || $scope.tempCAP.Post == 'undefined' || $scope.tempCAP.Post == '') || 
						($scope.tempCAP.LastName == null || $scope.tempCAP.LastName == 'undefined' || $scope.tempCAP.LastName == '') || 
						($scope.tempCAP.FirstName == null || $scope.tempCAP.FirstName == 'undefined' || $scope.tempCAP.FirstName == '') || 
						($scope.tempCAP.Title == null || $scope.tempCAP.Title == 'undefined' || $scope.tempCAP.Title == '') || 
						($scope.tempCAP.Email == null || $scope.tempCAP.Email == 'undefined' || $scope.tempCAP.Email == '') || 
						($scope.tempCAP.VAT == null || $scope.tempCAP.VAT == 'undefined' || $scope.tempCAP.VAT == '') || 
						($scope.tempCAP.VAT == 'Other' && ($scope.tempCAP.VATOther == null || $scope.tempCAP.VATOther == 'undefined' || $scope.tempCAP.VATOther == '')) || 
						($scope.tempCAP.AccountNumber == null || $scope.tempCAP.AccountNumber == 'undefined' || $scope.tempCAP.AccountNumber == '') || 
						($scope.tempCAP.VendorName == null || $scope.tempCAP.VendorName == 'undefined' || $scope.tempCAP.VendorName == '') || 
						($scope.tempCAP.AnotherBill == null || $scope.tempCAP.AnotherBill == 'undefined' || $scope.tempCAP.AnotherBill == '') || 
						($scope.tempCAP.SubmittedAccountInfo  == null || $scope.tempCAP.SubmittedAccountInfo  == 'undefined' || $scope.tempCAP.SubmittedAccountInfo  == '') || 
						($scope.tempCAP.SubmittedUtilityBills  == null || $scope.tempCAP.SubmittedUtilityBills  == 'undefined' || $scope.tempCAP.SubmittedUtilityBills  == '') || 
						($scope.tempCAP.Certify  == null || $scope.tempCAP.Certify  == 'undefined' || $scope.tempCAP.Certify  == '') || 
						($scope.tempCAP.Issues == null || $scope.tempCAP.Issues == 'undefined' || $scope.tempCAP.Issues == '')) { if($scope.dataacct.length+1 != $scope.capuploader.queue.length && $scope.theWait == "") { $scope.theWait = "\nPlease upload 1 PDF per Account Number"; } else { $scope.theWait = "Please fill all required fields and upload a (PDF) document!"; } }
					else { $scope.capuploader.uploadAll(); 
					
					}
			}
		};

		var getMeterData = function(thegetData){
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.Country = thedata.Country;			

				$scope.datameter.push({
					AccountNumber: $scope.AccountNumber,
					MeterNumber: $scope.MeterNumber,
					SelectRPAID: $scope.SelectRPAID,
					UtilityType: $scope.UtilityType,
					UnitofMeasure: $scope.UnitofMeasure,
					TariffRateSchedule: $scope.TariffRateSchedule,
					UtilityTypeOther: $scope.UtilityTypeOther,
					UnitofMeasureOther: $scope.UnitofMeasureOther,
					TariffRateScheduleOther: $scope.TariffRateScheduleOther

				});
			});
		};

		var getMissionData = function(thegetData){
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.Country = thedata.Country;			

				$scope.datamission.push({
					Country: $scope.Country,
					Id: $scope.Id
				});
			});
		};

		var getPostData = function(thegetData){
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.Post = thedata.Post;			

				$scope.datapost.push({
					Post: $scope.Post,
					Id: $scope.Id
				});
			});
		};

		var getRPAIDData = function(thegetData){
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.RealPropertyUniqueID = thedata.RealPropertyUniqueID;	
				$scope.PropertyName = thedata.PropertyName;
				$scope.AssociatedLot = thedata.AssociatedLot;
				$scope.StreetAddress1 = thedata.StreetAddress1;
				$scope.StreetAddress2 = thedata.StreetAddress2;
				$scope.StreetAddress3 = thedata.StreetAddress3;
				$scope.Report = thedata.Report;
						
				$scope.datarpaid.push({
					RealPropertyUniqueID: $scope.RealPropertyUniqueID,
					PropertyName: $scope.PropertyName,
					AssociatedLot: $scope.AssociatedLot,
					StreetAddress1: $scope.StreetAddress1,
					StreetAddress2: $scope.StreetAddress2,
					StreetAddress3: $scope.StreetAddress3,
					Report: $scope.Report,
					Id: $scope.Id
				});
				$scope.datarpaid2.push({
					RealPropertyUniqueID: $scope.RealPropertyUniqueID,
					PropertyName: $scope.PropertyName,
					AssociatedLot: $scope.AssociatedLot,
					StreetAddress1: $scope.StreetAddress1,
					StreetAddress2: $scope.StreetAddress2,
					StreetAddress3: $scope.StreetAddress3,
					Report: $scope.Report,
					Id: $scope.Id
				});

			});
			$scope.isDone = 1;			
		};


		$scope.RemoveMeter = function(the) { 
			var theup = 0;			
			while(theup < $scope.datarpaid2.length) {																					
				if(the.SelectRPAID.indexOf($scope.datarpaid2[theup].RealPropertyUniqueID) != -1) { $scope.datarpaid2[theup].Report = "Yes"; }
				theup = theup+1;
			}
			$scope.datameter.splice($scope.datameter.indexOf(the),1);
		};
		
		$scope.AddRPAIDLOT = function(the) {
			thedat = $scope.tempCAPx.SelectRPAID;						
			theval = "";

			var getRPAIDByLotData = function(thegetData){
				angular.forEach(thegetData, function(thedata){											
					theval = thedata.RealPropertyUniqueID;

					if($scope.tempCAPx.SelectRPAID == ",") { $scope.tempCAPx.SelectRPAID = ""; }
					if(thedat.indexOf(theval) != -1) { $scope.tempCAPx.SelectRPAID = thedat.replace(theval, ''); thedat = $scope.tempCAPx.SelectRPAID; $scope.tempCAPx.SelectRPAID = thedat.replace(',,', ','); }
					else if($scope.tempCAPx.SelectRPAID != null && $scope.tempCAPx.SelectRPAID != undefined && $scope.tempCAPx.SelectRPAID != '' && thedat.indexOf(theval) == -1) { $scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID + ", " + theval; }
					else { $scope.tempCAPx.SelectRPAID = theval; }
				});
				$scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID.replace(',,', ',');
				if($scope.tempCAPx.SelectRPAID[$scope.tempCAPx.SelectRPAID.length-1] == ",") { $scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID.substr(0 ,$scope.tempCAPx.SelectRPAID.length-1);   }
			};
			theService.getRPAIDByLot($scope.tempCAP.Post, the.row.AssociatedLot).then(getRPAIDByLotData);
		};

		$scope.AddRPAID = function(the) {
			thedat = $scope.tempCAPx.SelectRPAID;			
			theval = the.row.RealPropertyUniqueID;	

			if($scope.tempCAPx.SelectRPAID == ",") { $scope.tempCAPx.SelectRPAID = ""; }					
			if(thedat.indexOf(theval) != -1) { $scope.tempCAPx.SelectRPAID = thedat.replace(theval, ''); thedat = $scope.tempCAPx.SelectRPAID; $scope.tempCAPx.SelectRPAID = thedat.replace(',,', ','); }
			else if($scope.tempCAPx.SelectRPAID != null && $scope.tempCAPx.SelectRPAID != undefined && $scope.tempCAPx.SelectRPAID != '' && thedat.indexOf(theval) == -1) { $scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID + ", " + theval; }
			else { $scope.tempCAPx.SelectRPAID = theval; }				
			$scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID.replace(',,', ',');
			if($scope.tempCAPx.SelectRPAID[$scope.tempCAPx.SelectRPAID.length-1] == ",") { $scope.tempCAPx.SelectRPAID = $scope.tempCAPx.SelectRPAID.substr(0 ,$scope.tempCAPx.SelectRPAID.length-1);   }
		};

		$scope.AddMeter = function(the, the2) {
				var theup = 0;			
				while(theup < $scope.datarpaid2.length) {																					
					if(the.SelectRPAID.indexOf($scope.datarpaid2[theup].RealPropertyUniqueID) != -1) { $scope.datarpaid2[theup].Report = "Reported"; }					
					theup = theup+1;
				}
				
				$scope.datameter.push({
					AccountNumber: $scope.tempCAP.AccountNumber,				
					MeterNumber: the.MeterNumber,
					SelectRPAID: the.SelectRPAID,
					UtilityType: the.UtilityType,
					UnitofMeasure: the.UnitofMeasure,
					TariffRateSchedule: the.TariffRateSchedule,					
					UtilityTypeOther: the.UtilityTypeOther,
					UnitofMeasureOther: the.UnitofMeasureOther,
					TariffRateScheduleOther: the.TariffRateScheduleOther					
				});

				$scope.tempCAPx.MeterNumber = "";
				$scope.tempCAPx.UtilityType = "";
				$scope.tempCAPx.UnitofMeasure = "";
				$scope.tempCAPx.TariffRateSchedule = "";
				$scope.tempCAPx.UtilityTypeOther = "";
				$scope.tempCAPx.UnitofMeasureOther = "";
				$scope.tempCAPx.TariffRateScheduleOther = "";
				$scope.tempCAPx.SelectRPAID = "";
				$('input[type=checkbox]').prop('checked',false);
		};

		$scope.UpdateCheckboxes = function() {
			$('#optAnotherBillYes')[0].checked = false;
			$('#optAnotherBillNo')[0].checked = false;
		};

		$scope.AddAcct = function(the) {
			if(($scope.tempCAP.AccountNumber != "" && $scope.tempCAP.AccountNumber != null && $scope.tempCAP.AccountNumber != undefined) && ($scope.tempCAP.VendorName != "" && $scope.tempCAP.VendorName != null && $scope.tempCAP.VendorName != undefined) && ($scope.tempCAP.Issues != "" && $scope.tempCAP.Issues != null && $scope.tempCAP.Issues != undefined) && ($scope.datarpaid.length != 0)) {

				$scope.thepass = 0;
				var thecc2 = 0;
				while(thecc2 < $scope.datameter.length) {
					if($scope.datameter[thecc2].AccountNumber == $scope.tempCAP.AccountNumber) { $scope.thepass = $scope.thepass + 1; }
					thecc2=thecc2+1;
				}

				if($scope.thepass == 0) { alert("You must enter Meter Number(s) to the Account Number " + $scope.tempCAP.AccountNumber + " before you add another account."); }
				else {
					$scope.dataacct.push({
						eAccountNumber: the.AccountNumber,
						eVendorName: the.VendorName,
						eIssues: the.Issues
					});
					$scope.UpdateCount("Add");				
	
					$scope.tempCAP.AccountNumber = "";
					$scope.tempCAP.VendorName = "";
					$scope.tempCAP.AnotherBill = "";
					$scope.tempCAP.Issues = "";
	
					document.getElementById("tempCAPAccountNumber").focus(); 
					$scope.tempCAP.SubmittedAccountInfo = "";
					$('#optSubmittedAccountInfoYes')[0].checked = false;
					$('#optSubmittedAccountInfoNo')[0].checked = false;
					$scope.tempCAP.SubmittedUtilityBills = "";
					$('#optSubmittedUtilityBillsYes')[0].checked = false;
					$('#optSubmittedUtilityBillsNo')[0].checked = false;
					$scope.tempCAP.Certify = "";
					$('#optCertifyYes')[0].checked = false;
					$('#optCertifyNo')[0].checked = false;
				}
			}


			else { alert("Please answer Questions 3-7 before adding another account number."); }	
		};

		$scope.RemoveAcct = function(the) { 
			$scope.meterremove = 0;
			var thecc = 0;
			
			while(thecc < $scope.datameter.length) {
				if($scope.datameter[thecc].AccountNumber == the.eAccountNumber) { $scope.meterremove = $scope.meterremove+1; }
				thecc=thecc+1;
			}
			if($scope.meterremove > 0) { alert("Please remove the " + $scope.meterremove + " Meter Number(s) associated before removing the Account Number."); }
			if($scope.meterremove == 0) {
				var thecc = 0;
				
				while(thecc < $scope.capuploader.queue.length) {
					if($scope.capuploader.queue[thecc].file.acct == the.eAccountNumber) { $scope.meterremove = $scope.meterremove+1; }
					thecc=thecc+1;
				}
				if($scope.meterremove > 0) { alert("Please remove the " + $scope.meterremove + " Document(s) associated before removing the Account Number."); }
			}
			if($scope.meterremove == 0) { $scope.dataacct.splice($scope.dataacct.indexOf(the),1); 
				$scope.UpdateCount("Remove");			
			}

		};


		$scope.MissionDrop = function(the) {
			$scope.datamission = [];
			theService.getMission(the).then(getMissionData); 
		};
		$scope.PostDrop = function(the) {
			$scope.datapost = [];
			theService.getPost(the).then(getPostData); 		
		};
		$scope.RPAIDDrop = function(the) {
			$scope.datarpaid = [];
			theService.getRPAID(the).then(getRPAIDData); 		
		};
		$scope.VerifyName = function(the) {
			$().SPServices({
			    operation: "GetUserInfo",
			    async: false,
			    userLoginName: the,
			    completefunc: function (xData, Status) { $(xData.responseXML).find("User").each(function () { $scope.VerifyNameLabel = $(this).attr("Name") + " (" + $(this).attr("Email") + ")"; }); }
			});
		};




////////////////////////////

		
		$scope.capuploader = new FileUploader();

		$scope.capuploader.queueLimit = 1;
			
		$scope.UpdateCount = function(the) { 
			if(the == "Add") { $scope.capuploader.queueLimit = $scope.capuploader.queueLimit+1; }
			else { $scope.capuploader.queueLimit = $scope.capuploader.queueLimit-1; } 		
		}

		function GetItemTypeForListName(name) { return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "Item"; }

		$scope.capuploader.onAfterAddingFile = function(item) {

			item.file.acct = $scope.tempCAP.AccountNumber;
			$scope.theWait = "";

				var getCount = function(thegetData) {
					if(thegetData.length > 0) {
						alert("The following document exists in the system and will be removed from the queue. Please rename your document before uploading.\n\nDocument Name: " + thegetData[0].Name);
						$scope.capuploader.removeFromQueue(item);
					} 					
				}
				theService.getCAPDoc(item._file.name).then(getCount);
		}		
		
		$scope.capuploader.onCompleteItem = function (item, response, status, headers) {
			if(item.file.type != "application/pdf") {
				alert("You can only upload a PDF document");				
				$scope.capuploader.removeFromQueue(item);				
				item.cancel = true;
				$scope.thePage = 2;
			}	
			else { uploadFileLocalCAP(item._file, item._file.name, item.file.acct); }
		}

		var uploadFileLocalCAP = function (file, thename, theacct) {		
			$scope.theWait = "Thank you for submitting successfully!\nPlease wait while the system is processing...";
		    var libraryName = "EnergyCAP";
			var webUrl = "https://usdos.sharepoint.com/sites/M_GreenTeams/_api/web/lists/getByTitle('EnergyCAP')/RootFolder/files/add(url=@TargetFileName,overwrite='true')?" + "@TargetLibrary='" + libraryName + "'" + "&@TargetFileName='" + thename + "'&$expand=ListItemAllFields";				
			var deferred = jQuery.Deferred();
		    var reader = new FileReader();
		    var arrayBuffer;
			    reader.onload = function (e) {
					arrayBuffer = reader.result;
					return getFormDigest().then(function (data) {
						jQuery.ajax({
						url: webUrl,
						type: "POST",
						data: arrayBuffer,
						headers: { "Accept": "application/json;odata=verbose", "X-RequestDigest": data.d.GetContextWebInformation.FormDigestValue },
						processData: false,
						success: function () {

							var getCAPDocData = function(thegetData) {
								angular.forEach(thegetData, function(thedata){
									$scope.tempDOCUMENT = {};
									angular.extend(file, $scope.tempDOCUMENT);
									$scope.tempDOCUMENT.Name = thedata.Id + "-" + thedata.Name;
									$scope.tempDOCUMENT.Id = thedata.Id;
									$scope.tempDOCUMENT.Title  = $scope.tempCAP.Title;
									$scope.tempDOCUMENT.Bureau = $scope.tempCAP.Bureau;									
									$scope.tempDOCUMENT.Mission = $scope.tempCAP.Mission;
									$scope.tempDOCUMENT.Post = $scope.tempCAP.Post;
									$scope.tempDOCUMENT.LastName = $scope.tempCAP.LastName;
									$scope.tempDOCUMENT.FirstName = $scope.tempCAP.FirstName;
									$scope.tempDOCUMENT.Email = $scope.tempCAP.Email;
									$scope.tempDOCUMENT.VAT = $scope.tempCAP.VAT;
									$scope.tempDOCUMENT.VATOther = $scope.tempCAP.VATOther;
									$scope.tempDOCUMENT.SubmittedAccountInfo = $scope.tempCAP.SubmittedAccountInfo;
									$scope.tempDOCUMENT.SubmittedUtilityBills = $scope.tempCAP.SubmittedUtilityBills;
									$scope.tempDOCUMENT.Certify = $scope.tempCAP.Certify;
									$scope.tempDOCUMENT.AccountNumber = theacct;
									$scope.tempDOCUMENT.Issues = $scope.tempCAP.Issues;
									$scope.tempDOCUMENT.VendorName = $scope.tempCAP.VendorName;

									if($scope.dataacct.length > 0) {									
										var thecc = 0;
										
										while(thecc < $scope.dataacct.length) {
											if($scope.dataacct[thecc].eAccountNumber == theacct) {											
												$scope.tempDOCUMENT.AccountNumber = $scope.dataacct[thecc].eAccountNumber;
												$scope.tempDOCUMENT.Issues = $scope.dataacct[thecc].eIssues;
												$scope.tempDOCUMENT.VendorName = $scope.dataacct[thecc].eVendorName;
											}
											thecc=thecc+1;
										}
									}

									if($scope.datameter.length == 1) {
										var frac = $scope.datameter[0].SelectRPAID;

										$scope.theup = {};			
										var getUpdateData = function(thegetData){
											angular.forEach(thegetData, function(thedata){						
												if(frac.indexOf(thedata.RealPropertyUniqueID) != -1) { 
													$scope.theup.Id = thedata.Id;
													$scope.theup.Report = "Reported";
													updateListItemREST("RPAID", JSON.parse(angular.toJson($scope.theup))).then(function(d) { });
												}
											});
										};
										theService.getUpdate("Yes", $scope.tempCAP.Post).then(getUpdateData);

										$scope.theMM = {};									
										$scope.theMM.MeterNumber = $scope.datameter[0].MeterNumber;
										$scope.theMM.SelectRPAID = $scope.datameter[0].SelectRPAID;
										$scope.theMM.UtilityType = $scope.datameter[0].UtilityType;
										$scope.theMM.UnitofMeasure = $scope.datameter[0].UnitofMeasure;
										$scope.theMM.TariffRateSchedule = $scope.datameter[0].TariffRateSchedule;
										if($scope.theMM.UtilityType == "Other") { $scope.theMM.UtilityTypeOther = $scope.datameter[0].UtilityTypeOther; }
										if($scope.theMM.UnitofMeasure == "Other") { $scope.theMM.UnitofMeasureOther = $scope.datameter[0].UnitofMeasureOther; }
										if($scope.theMM.TariffRateSchedule == "Other") { $scope.theMM.TariffRateScheduleOther = $scope.datameter[0].TariffRateScheduleOther; }
										updateListItemREST("EnergyCAP", JSON.parse(angular.toJson($scope.tempDOCUMENT))).then(function(d) { });
										createListItemREST("EnergyCAPMeters", JSON.parse(angular.toJson($scope.theMM))).then(function(d) { });

									}
									else {

										$scope.tempDOCUMENT.AccountNumber = theacct;
									
										var thecc = 0;
										
										while(thecc < $scope.datameter.length) {
											if($scope.datameter[thecc].AccountNumber == theacct) {											
												
												var frac = $scope.datameter[thecc].SelectRPAID;

												$scope.theup = {};			
												var getUpdateData = function(thegetData){
													angular.forEach(thegetData, function(thedata){						
														if(frac.indexOf(thedata.RealPropertyUniqueID) != -1) { 
															$scope.theup.Id = thedata.Id;
															$scope.theup.Report = "Reported";
															updateListItemREST("RPAID", JSON.parse(angular.toJson($scope.theup))).then(function(d) { });
														}
													});
												};
												theService.getUpdate("Yes", $scope.tempCAP.Post).then(getUpdateData);

												$scope.theMM = {};									
												$scope.theMM.AccountNumber = $scope.datameter[thecc].AccountNumber;
												$scope.theMM.MeterNumber = $scope.datameter[thecc].MeterNumber;
												$scope.theMM.SelectRPAID = $scope.datameter[thecc].SelectRPAID;
												$scope.theMM.UtilityType = $scope.datameter[thecc].UtilityType;
												$scope.theMM.UnitofMeasure = $scope.datameter[thecc].UnitofMeasure;
												$scope.theMM.TariffRateSchedule = $scope.datameter[thecc].TariffRateSchedule;
												if($scope.theMM.UtilityType == "Other") { $scope.theMM.UtilityTypeOther = $scope.datameter[thecc].UtilityTypeOther; }
												if($scope.theMM.UnitofMeasure == "Other") { $scope.theMM.UnitofMeasureOther = $scope.datameter[thecc].UnitofMeasureOther; }
												if($scope.theMM.TariffRateSchedule == "Other") { $scope.theMM.TariffRateScheduleOther = $scope.datameter[thecc].TariffRateScheduleOther; }
												createListItemREST("EnergyCAPMeters", JSON.parse(angular.toJson($scope.theMM))).then(function(d) { });
											}
											thecc=thecc+1;
										}
										updateListItemREST("EnergyCAP", JSON.parse(angular.toJson($scope.tempDOCUMENT))).then(function(d) { });

									}

									$scope.loader = 1;
									setTimeout(function(){ location.reload() }, 5000);
									
								}); 
							};
							theService.getCAPDoc(thename).then(getCAPDocData);
						},
						error: function (arr, error) { console.log("Error uploading file locally."); }
					}); 
				});
		    };
		    reader.readAsArrayBuffer(file);


		};
				
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

		$(document).ready(function() { $.ajaxSetup({ cache: false });
						
		});		
};

//development Notes
//After closing Status or Documents window user must click or they get blank page
//Google Charts had to switch https to http to make work in Mozilla

var ENERGYCAPApp = angular.module("ENERGYCAPApp");
ENERGYCAPApp.controller("theController", theController);

}());