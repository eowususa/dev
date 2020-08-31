(function() {
	var theController = function($scope, $uibModal, $http, $q, $log, theService, $routeParams, $sce, $compile, FileUploader) {
		var INTAKEID = (!angular.isDefined($routeParams.INTAKEID)) ? '' : $routeParams.INTAKEID;
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

		$scope.theurl = "/sites/M-PRI/Internal/Innovation/";
		$scope.urlnow = window.location.href;
		$scope.itemsPerPageFilter = 20;
		$scope.currentPageFilter = 1;
		$scope.theWait = "";
		$scope.INTAKEID = INTAKEID;
		$scope.theWaitDoc = "";
		$scope.datenow = new Date();
		$scope.dataintake = [];
		$scope.dataintakeuser = [];
		$scope.dataintakeusercompleted = [];
		$scope.dataintakedocs = [];		
		$scope.datacalendar = [];
		$scope.tempIntake = {};
		$scope.tempIntakex = {};
		$scope.tempIntakeDes = {};
		$scope.theAdministrator = 0;
		$scope.isDone = 0;
		$scope.dataintakedocs = [];
		$scope.dataintakereqmts = [];
		$scope.theUser = 0;
		$scope.theAdmin = 0;
		$scope.theLead = 0;
		$scope.dataintakeer = [];
		$scope.datatplan = [];
		$scope.datatplanreview = [];
		$scope.theintakeers = 0;
		$scope.tempUser = [];
		$scope.VerifyNameLabel = "";
		
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
		        if($(xData.responseXML).find("Group[Name='Backlog - Solution Management']").length == 1) { $scope.theAdmin = 1; }		        
		        if($(xData.responseXML).find("Group[Name='Innovation Members']").length == 1) { $scope.theUser = 1; }
		        if($(xData.responseXML).find("Group[Name='CAPToolLeads']").length == 1) { $scope.theLead = 1; }		        
				$scope.thisUserAccount = $().SPServices.SPGetCurrentUser({ fieldName: "Title", debug: false });
				$scope.thisUserAccountEmail = $().SPServices.SPGetCurrentUser({ fieldName: "Email", debug: false });
			  }
		});

		$scope.AllLeads = [];
		$().SPServices({
			operation: "GetUserCollectionFromGroup",
			groupName: "CAPToolLeads",
			async: false,
			completefunc: function (xDataUser, Status) {
				$(xDataUser.responseXML).find("User").each(function() {
					$scope.AllLeads.push({
						Name: $(this).attr("Name").trim()
					});
				});
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


		$scope.VerifyName = function(the) {
			$().SPServices({
			    operation: "GetUserInfo",
			    async: false,
			    userLoginName: the,
			    completefunc: function (xData, Status) { $(xData.responseXML).find("User").each(function () { $scope.VerifyNameLabel = $(this).attr("Name") + " (" + $(this).attr("Email") + ")"; }); }
			});
		};

		$scope.QuickRule = function() { 
			if($scope.tempIntake.IsFulfillmentRequest == "Yes") { $scope.tempIntake.ProcessStage = "Quick Fulfillment"; $scope.tempIntake.IsScope = ""; $scope.tempIntake.CAPInvolvement = "";
				$scope.tempIntake.SFFrontOffice = ""; 
				$scope.tempIntake.SFCAP = ""; 
				$scope.tempIntake.SFWindowsofOpportunity = ""; 
	
				$scope.tempIntake.ImpactDeptLevel = ""; 
				$scope.tempIntake.ImpactLocalLevel = ""; 
				$scope.tempIntake.ImpactProjectTeam = ""; 
	
				$scope.tempIntake.EffortTime = ""; 
				$scope.tempIntake.EffortRisk = ""; 
				$scope.tempIntake.EffortResources = ""; 
			}
			else { $scope.tempIntake.ProcessStage = "Central Intake"; }
		}

		$scope.ScopeRule = function() { if($scope.tempIntake.IsScope == "No") { $scope.tempIntake.CAPInvolvement = ""; 
				$scope.tempIntake.SFFrontOffice = ""; 
				$scope.tempIntake.SFCAP = ""; 
				$scope.tempIntake.SFWindowsofOpportunity = ""; 
		
				$scope.tempIntake.ImpactDeptLevel = ""; 
				$scope.tempIntake.ImpactLocalLevel = ""; 
				$scope.tempIntake.ImpactProjectTeam = ""; 
		
				$scope.tempIntake.EffortTime = ""; 
				$scope.tempIntake.EffortRisk = ""; 
				$scope.tempIntake.EffortResources = ""; 
				$scope.tempIntake.ProcessStage = "Decline - Out of Scope";		
		} };

		$scope.RequestReview = function(the) { location.href = "Index.aspx#!/Update/" + the; };

		$scope.FilterHomeRule = function() { location.href = "Index.aspx#!/Home"; }

		$scope.PrintRequest = function(the) { location.href = "Print.aspx#!/Print/" + the; }

		
		$scope.ViewRequest = function(the,the2) {
			if(the == "View Project Request" || the == "Request Project Request") { location.href = "Print.aspx#!/Print/" + the2.Id; }

			if(the == "Update/Submit Project Request") { location.href = "Index.aspx#!/Draft/" + the2.Id; }

			if(the == "Complete Project Request") { location.href = "Index.aspx#!/Complete/" + the2.Id; }

			if(the == "Delete Intake") {
				var theconf = confirm("Are you sure you would like to delete the Draft Request?\n" + the2.Project);
	
				if (theconf == true) {
				    $scope.dataintake.splice($scope.dataintake.indexOf(the2),1);

					return getFormDigest().then(function (data) {

						$.ajax({  
	            					url: $scope.theurl + "_api/web/lists/GetByTitle('ProjectSolution')/items('"+ the2.Id + "')",
							type: "DELETE",  
				            		headers:  
				            		{  
								"contentType": "application/json;odata=verbose",
								"Accept": "application/json;odata=verbose",
								"X-RequestDigest": data.d.GetContextWebInformation.FormDigestValue,
					            		"X-HTTP-Method": "DELETE",
					            		"IF-MATCH": "*"
				            		},
							success: function(data) {



								var thecount = 0;
			
								while(thecount < theService.getTheIntakeDocsDelete(the2.Id).length) {
			
													var theurl = "https://usdos.sharepoint.com/sites/M-PRI/Internal/Innovation/_api/web/GetFileByServerRelativeUrl('/sites/M-PRI/Internal/Innovation/ProjectSolutionDocs/" + theService.getTheIntakeDocsDelete(the2.Id)[thecount].Name + "')";
													temp(theurl);
													
												function temp (theurl) {
													return getFormDigest().then(function (data) {
				
													    $.ajax({
													        url: theurl,
													        type: "POST",					
															headers: {
																"contentType": "application/json;odata=verbose",
																"Accept": "application/json;odata=verbose",
																"X-RequestDigest": data.d.GetContextWebInformation.FormDigestValue,
													            "X-HTTP-Method": "DELETE",
													            "IF-MATCH": "*"
													        },												        		
												            success: function(data) { return data; } 
													    });
														
													 });
												}
									thecount = thecount + 1;
								}
								alert("Your Draft Project Request Request was deleted successfully!"); 
							}
				        }); 
					});
				} 
				else { location.reload(); }										
			}
		};

		
		

		$scope.SavePlan = function() {
					$scope.theWait = "Project Request Saved Successfully!";
					$scope.tempIntake.GENID = $scope.tempGENID;
					$scope.tempIntake.ProcessStage = "Draft";
					$scope.tempIntake.Requestor = $scope.thisUserAccount;

					console.log($scope.tempIntakex);

					$scope.CollaboratingTeams = "";					
					if($scope.tempIntakex.ENR  == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + "ENR"; }
					if($scope.tempIntakex.OCE == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", OCE"; }
					if($scope.tempIntakex.OES == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", OES"; }
					if($scope.tempIntakex.STAS == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", STAS"; }					
					if($scope.CollaboratingTeams.substring(0, 2) == ", ") { $scope.CollaboratingTeams = $scope.CollaboratingTeams.slice(2, $scope.CollaboratingTeams.length); }					
					$scope.tempIntake.CollaboratingTeams = $scope.CollaboratingTeams;


					if(INTAKEID == '') { 
						createListItemREST("ProjectSolution", $scope.tempIntake).then(function(d) { }); 
					}
					else {
						$scope.tempIntake.Id = String(INTAKEID);
						updateListItemREST("ProjectSolution", $scope.tempIntake).then(function(d) { });
					}
					setTimeout(function(){ location.href = "Index.aspx#!/Home" }, 4000);
		};
		
		

		$scope.SubmitPlan = function() {
				if($scope.tempIntake.ProcessStage == "Initial Discovery") { $scope.tempIntake.IDDate = $scope.thedate; }
				if($scope.tempIntake.ProcessStage == "Active") { $scope.tempIntake.ActiveDate = $scope.thedate; }
				if($scope.tempIntake.ProcessStage == "Team Backlog") { $scope.tempIntake.BacklogDate = $scope.thedate; }
				if($scope.tempIntake.ProcessStage == "Completed") { $scope.tempIntake.CompletedDate = $scope.thedate; }
				if($scope.tempIntake.ProcessStage == "Decline - Other" || $scope.tempIntake.ProcessStage == "Decline - Out of Scope" || $scope.tempIntake.ProcessStage == "Decline - Unfavorable") { $scope.tempIntake.DeclineDate = $scope.thedate; }

				if(INTAKEID != '') {
						$scope.CollaboratingTeams = "";
						if($scope.tempIntakex.ENR  == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + "ENR"; }
						if($scope.tempIntakex.OCE == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", OCE"; }
						if($scope.tempIntakex.OES == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", OES"; }
						if($scope.tempIntakex.STAS == true) { $scope.CollaboratingTeams = $scope.CollaboratingTeams + ", STAS"; }					
						if($scope.CollaboratingTeams.substring(0, 2) == ", ") { $scope.CollaboratingTeams = $scope.CollaboratingTeams.slice(2, $scope.CollaboratingTeams.length); }					
						$scope.tempIntake.CollaboratingTeams = $scope.CollaboratingTeams;

						$scope.theWait = "Project Request Submitted Successfully!";
						$scope.tempIntake.GENID = $scope.tempGENID;

						$scope.tempIntake.Request = $scope.tempIntake.ProcessStage;
						$scope.tempIntake.Id = String(INTAKEID);
						$scope.tempIntake.Requestor = $scope.thisUserAccount;
						updateListItemREST("ProjectSolution", $scope.tempIntake).then(function(d) { });
						setTimeout(function(){ location.href = "Index.aspx#!/Home" }, 4000);
				}
				else {
						$scope.theWait = "Project Request Submitted Successfully!";
						$scope.tempIntake.GENID = $scope.tempGENID;
						$scope.tempIntake.Request = $scope.tempIntake.ProcessStage;
						$scope.tempIntake.Requestor = $scope.thisUserAccount;
						createListItemREST("ProjectSolution", $scope.tempIntake).then(function(d) { });
						setTimeout(function(){ location.href = "Index.aspx#!/Home" }, 4000);
				}
		};
		
	
		var getIntakebyIDData = function(thegetData) {
			angular.forEach(thegetData, function(thedata){
				$scope.tempIntake.Id = thedata.Id;
				$scope.tempIntake.Requestor = thedata.Requestor;
				$scope.tempIntake.Request = thedata.Request;
				$scope.tempIntake.Project = thedata.Project;			
				$scope.tempIntake.Details = thedata.Details;			
				$scope.tempIntake.Bureau = thedata.Bureau;			
				$scope.tempIntake.BureauFamily = thedata.BureauFamily;			
				$scope.tempIntake.OfficePost = thedata.OfficePost;			
				$scope.tempIntake.RequestType = thedata.RequestType;			
				$scope.tempIntake.AlternatePOC = thedata.AlternatePOC;			
				$scope.tempIntake.WorkstreamLead = thedata.WorkstreamLead;			
				$scope.tempIntake.CollaboratingTeams = thedata.CollaboratingTeams;			
				$scope.tempIntake.Origin = thedata.Origin;			
				$scope.tempIntake.IsFulfillmentRequest = thedata.IsFulfillmentRequest;			
				$scope.tempIntake.IsScope = thedata.IsScope;
				$scope.tempIntake.CAPInvolvement = thedata.CAPInvolvement;
				$scope.tempIntake.CAPComments = thedata.CAPComments;
				$scope.tempIntake.GENID = thedata.GENID;			
				$scope.tempIntake.ProcessStage = thedata.ProcessStage;
				$scope.tempIntake.CreatedBy = thedata.CreatedBy.Name;
				$scope.tempIntake.Created = parseJsonDate(thedata.Created);
				$scope.tempIntake.DeliveryLevel = thedata.DeliveryLevel;
				$scope.tempIntake.Engagement = thedata.Engagement;
				$scope.tempIntake.Response = thedata.Response;
				$scope.tempIntake.SFFrontOffice = thedata.SFFrontOffice;
				$scope.tempIntake.SFCAP = thedata.SFCAP;
				$scope.tempIntake.SFWindowsofOpportunity = thedata.SFWindowsofOpportunity;
				$scope.tempIntake.ImpactDeptLevel = thedata.ImpactDeptLevel;
				$scope.tempIntake.ImpactLocalLevel = thedata.ImpactLocalLevel;
				$scope.tempIntake.ImpactProjectTeam = thedata.ImpactProjectTeam;
				$scope.tempIntake.EffortTime = thedata.EffortTime;
				$scope.tempIntake.EffortRisk = thedata.EffortRisk;
				$scope.tempIntake.EffortResources = thedata.EffortResources;
				$scope.tempIntake.IDDate = thedata.IDDate;
				$scope.tempIntake.IDCurrentStatus = thedata.IDCurrentStatus;
				$scope.tempIntake.IDUpdates = thedata.IDUpdates;
				$scope.tempIntake.IDTasks = thedata.IDTasks;
				$scope.tempIntake.IDRoadBlocks = thedata.IDRoadBlocks;
				$scope.tempIntake.ActiveDate = thedata.ActiveDate;
				$scope.tempIntake.ActiveCurrentStatus = thedata.ActiveCurrentStatus;
				$scope.tempIntake.ActiveUpdates = thedata.ActiveUpdates;
				$scope.tempIntake.ActiveTasks = thedata.ActiveTasks;
				$scope.tempIntake.ActiveRoadBlocks = thedata.ActiveRoadBlocks;
				$scope.tempIntake.CompletedDate = thedata.CompletedDate;
				$scope.tempIntake.CompletedImpact = thedata.CompletedImpact;
				$scope.tempIntake.CompletedCurrentStatus = thedata.CompletedCurrentStatus;
				$scope.tempIntake.CompletedComments = thedata.CompletedComments;
				$scope.tempIntake.BacklogDate = thedata.BacklogDate;
				$scope.tempIntake.BacklogJustification = thedata.BacklogJustification;
				$scope.tempIntake.BacklogComments = thedata.BacklogComments;
				$scope.tempIntake.DeclineDate = thedata.DeclineDate;
				$scope.tempIntake.DeclineJustification = thedata.DeclineJustification;
				$scope.tempIntake.DeclineComments = thedata.DeclineComments;
				$scope.tempIntake.CompletedAccepted = thedata.CompletedAccepted;
				$scope.tempIntake.CompletedMECheckIn = thedata.CompletedMECheckIn;
				$scope.theProcessStage = thedata.ProcessStage;
				$scope.theCompletedAccepted = thedata.CompletedAccepted;

				if(thedata.CollaboratingTeams != null) {
					if(thedata.CollaboratingTeams.indexOf("ENR") != -1) { $scope.tempIntakex.ENR = true; }
					if(thedata.CollaboratingTeams.indexOf("OCE") != -1) { $scope.tempIntakex.OCE = true; }
					if(thedata.CollaboratingTeams.indexOf("OES") != -1) { $scope.tempIntakex.OES = true; }
					if(thedata.CollaboratingTeams.indexOf("STAS") != -1) { $scope.tempIntakex.STAS = true; }
				}		

			});
			$scope.isDone = 1;
		};



///////////////////////////////32
		var getIntakeData = function(thegetData) {	
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.Requestor = thedata.Requestor;
				$scope.Request = thedata.Request;
				$scope.Project = thedata.Project;			
				$scope.Details = thedata.Details;			
				$scope.Bureau = thedata.Bureau;			
				$scope.BureauFamily = thedata.BureauFamily;			
				$scope.OfficePost = thedata.OfficePost;			
				$scope.RequestType = thedata.RequestType;			
				$scope.AlternatePOC = thedata.AlternatePOC;			
				$scope.WorkstreamLead = thedata.WorkstreamLead;			
				$scope.CollaboratingTeams = thedata.CollaboratingTeams;			
				$scope.Origin = thedata.Origin;			
				$scope.IsFulfillmentRequest = thedata.IsFulfillmentRequest;			
				$scope.IsScope = thedata.IsScope;
				$scope.CAPInvolvement = thedata.CAPInvolvement;
				$scope.CAPComments = thedata.CAPComments;
				$scope.GENID = thedata.GENID;			
				$scope.ProcessStage = thedata.ProcessStage;
				$scope.CreatedBy = thedata.CreatedBy.Name;
				$scope.Created = parseJsonDate(thedata.Created);				
				$scope.DeliveryLevel = thedata.DeliveryLevel;
				$scope.Engagement = thedata.Engagement;
				$scope.Response = thedata.Response;				
				$scope.SFFrontOffice = thedata.SFFrontOffice;
				$scope.SFCAP = thedata.SFCAP;
				$scope.SFWindowsofOpportunity = thedata.SFWindowsofOpportunity;
				$scope.ImpactDeptLevel = thedata.ImpactDeptLevel;
				$scope.ImpactLocalLevel = thedata.ImpactLocalLevel;
				$scope.ImpactProjectTeam = thedata.ImpactProjectTeam;
				$scope.EffortTime = thedata.EffortTime;
				$scope.EffortRisk = thedata.EffortRisk;
				$scope.EffortResources = thedata.EffortResources;
				$scope.IDDate = thedata.IDDate;
				$scope.IDCurrentStatus = thedata.IDCurrentStatus;
				$scope.IDUpdates = thedata.IDUpdates;
				$scope.IDTasks = thedata.IDTasks;
				$scope.IDRoadBlocks = thedata.IDRoadBlocks;
				$scope.ActiveDate = thedata.ActiveDate;
				$scope.ActiveCurrentStatus = thedata.ActiveCurrentStatus;
				$scope.ActiveUpdates = thedata.ActiveUpdates;
				$scope.ActiveTasks = thedata.ActiveTasks;
				$scope.ActiveRoadBlocks = thedata.ActiveRoadBlocks;
				$scope.CompletedDate = thedata.CompletedDate;
				$scope.CompletedImpact = thedata.CompletedImpact;
				$scope.CompletedCurrentStatus = thedata.CompletedCurrentStatus;
				$scope.CompletedComments = thedata.CompletedComments;
				$scope.BacklogDate = thedata.BacklogDate;
				$scope.BacklogJustification = thedata.BacklogJustification;
				$scope.BacklogComments = thedata.BacklogComments;
				$scope.DeclineDate = thedata.DeclineDate;
				$scope.DeclineJustification = thedata.DeclineJustification;
				$scope.DeclineComments = thedata.DeclineComments;
				$scope.CompletedAccepted = thedata.CompletedAccepted;
				$scope.CompletedMECheckIn = thedata.CompletedMECheckIn;

				if(thedata.CollaboratingTeams != null) {
					if(thedata.CollaboratingTeams.indexOf("ENR") != -1) { $scope.tempIntakex.ENR = true; }
					if(thedata.CollaboratingTeams.indexOf("OCE") != -1) { $scope.tempIntakex.OCE = true; }
					if(thedata.CollaboratingTeams.indexOf("OES") != -1) { $scope.tempIntakex.OES = true; }
					if(thedata.CollaboratingTeams.indexOf("STAS") != -1) { $scope.tempIntakex.STAS = true; }
				}							

				if(thedata.ProcessStage == "Central Intake") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.Created + ")&nbsp;" + "</a>",
						color: {primary: '#FF0000'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.Created,
						endsAt: $scope.Created
					});
				}
				
				if(thedata.ProcessStage == "Initial Discovery") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.IDDate + ")&nbsp;" + "</a>",
						color: {primary: '#FFFF00'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.IDDate,
						endsAt: $scope.IDDate
					});
				}
				if(thedata.ProcessStage == "Completed") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.CompletedDate + ")&nbsp;" + "</a>",
						color: {primary: '#000080'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.CompletedDate,
						endsAt: $scope.CompletedDate
					});
				}

				if(thedata.ProcessStage == "Active") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.ActiveDate + ")&nbsp;" + "</a>",
						color: {primary: '#000000'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.ActiveDate,
						endsAt: $scope.ActiveDate
					});
				}
				if(thedata.ProcessStage == "Team Backlog") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.BacklogDate + ")&nbsp;" + "</a>",
						color: {primary: '#556B2F'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.BacklogDate,
						endsAt: $scope.BacklogDate
					});
				}
				if(thedata.ProcessStage == "Quick Fulfillment") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.CompletedDate + ")&nbsp;" + "</a>",
						color: {primary: '#556B2F'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.Created,
						endsAt: $scope.Created
					});
				}
				if(thedata.ProcessStage == "Decline - Other" || thedata.ProcessStage == "Decline - Out of Scope" || thedata.ProcessStage == "Decline - Unfavorable") {
					$scope.datacalendar.push({
						title: "<a href='Print.aspx#!/Print/" + thedata.Id + "'>" + $scope.Bureau + " - " + $scope.Project + "&nbsp;(" + $scope.ProcessStage + ")&nbsp;(" + $scope.DeclineDate + ")&nbsp;" + "</a>",
						color: {primary: '#CCCCCC'},
						actions: [{ // an array of actions that will be displayed next to the event title
							//label: '<i class=\'glyphicon glyphicon-globe\'></i>', // the label of the action
							cssClass: 'edit-action', // a CSS class that will be added to the action element so you can implement custom styling
							onClick: function(args) { window.open("Print.aspx#!/Print/" + thedata.Id); }
						}],
 						incrementsBadgeTotal: false,
						startsAt: $scope.DeclineDate,
						endsAt: $scope.DeclineDate
					});
				}

				
				$scope.dataintake.push({
					Id: $scope.Id,
					Requestor: $scope.Requestor,
					Request: $scope.Request,
					Project: $scope.Project,
					Details: $scope.Details,	
					Bureau: $scope.Bureau,
					BureauFamily: $scope.BureauFamily,
					ActiveCurrentStatus: $scope.ActiveCurrentStatus,
					CompletedCurrentStatus: $scope.CompletedCurrentStatus,
					BacklogJustification: $scope.BacklogJustification,
					DeclineJustification: $scope.DeclineJustification,	 			
					IDCurrentStatus: $scope.IDCurrentStatus,	 			
					OfficePost: $scope.OfficePost,			
					RequestType: $scope.RequestType,			
					AlternatePOC: $scope.AlternatePOC,			
					WorkstreamLead: $scope.WorkstreamLead,			
					CollaboratingTeams: $scope.CollaboratingTeams,			
					Origin: $scope.Origin,			
					IsFulfillmentRequest: $scope.IsFulfillmentRequest,			
					IsScope: $scope.IsScope,
					CAPInvolvement: $scope.CAPInvolvement,
					CAPComments: $scope.CAPComments,
					GENID: $scope.GENID,			
					ProcessStage: $scope.ProcessStage,
					CreatedBy: $scope.CreatedBy,
					Created: $scope.Created
				});					
			});
			$scope.isDone = 1;
		};
///////////////////////////////32

		var getTheIntakeDocsData = function(thegetData){
			angular.forEach(thegetData, function(thedata){
				$scope.Id = thedata.Id;
				$scope.Name = thedata.Name;
				$scope.Title = thedata.Title;			

				$scope.dataintakedocs.push({
					Name: $scope.Name,
					Id: $scope.Id,
					Title: $scope.Title
				});
			});
			$scope.isDone = 1;
		};


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

		$scope.IntakeDelete = function(the) {
				var theconf = confirm("Are you sure you would like to delete the following Project Request ?\n" + the.Purpose);
				if (theconf == true) {
					$scope.dataintakereqmts.splice($scope.dataintakereqmts.indexOf(the),1);
				
					return getFormDigest().then(function (data) {
						$.ajax({  
	            			url: "https://ksn2.faa.gov/faa/uasipp/_api/web/lists/GetByTitle('ProjectSolution')/items('"+ the.Id + "')",
							type: "DELETE",  
				            headers:  
				            {  
								"contentType": "application/json;odata=verbose",
								"Accept": "application/json;odata=verbose",
								"X-RequestDigest": data.d.GetContextWebInformation.FormDigestValue,
					            "X-HTTP-Method": "DELETE",
					            "IF-MATCH": "*"
				            },
							success: function(data) { 							
																
							}
				        }); 
					});
				} 
		};
		
		$scope.IntakeDocumentDelete = function(the) {
			var theconf = confirm("Are you sure you would like to delete the following document?\n" + the.Name);
			if (theconf == true) {
				$scope.dataintakedocs.splice($scope.dataintakedocs.indexOf(the),1);
				var theurl = "";
				
				theurl = "https://usdos.sharepoint.com/sites/M-PRI/Internal/Innovation/_api/web/GetFileByServerRelativeUrl('/avs/afs80/AUS-400/dev/ProjectSolutionDocs/" + the.Name + "')";
	
				return getFormDigest().then(function (data) {
				    $.ajax({
				        url: theurl,
				        type: "POST",					
						headers: {
							"contentType": "application/json;odata=verbose",
							"Accept": "application/json;odata=verbose",
							"X-RequestDigest": data.d.GetContextWebInformation.FormDigestValue,
				            "X-HTTP-Method": "DELETE",
				            "IF-MATCH": "*"
				        },
				        success: onQuerySucceeded,
				        error: onQueryFailed		
				    });
					function onQuerySucceeded() { alert("Successfully deleted!"); }
					function onQueryFailed(sender, args) { console.log('Error!'); }
				});
			} 			
		};


///////////////////
///////////////////

		$scope.intakeuploader = new FileUploader();

		function GetItemTypeForListName(name) { return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "Item"; }

		$scope.intakeuploader.onAfterAddingFile = function(item) {
			$scope.theWait = "";
			var getCount = function(thegetData) {
				if(thegetData.length > 0) {
					alert("The following document exists in the system and will be removed from the queue. Please rename your document before uploading.\n\nDocument Name: " + thegetData[0].Name);
					$scope.intakeuploader.removeFromQueue(item);
				} 					
			}
			theService.getIntakeDoc(item._file.name).then(getCount);
		}		
		$scope.intakeuploader.onCompleteItem = function (item, response, status, headers) {
			uploadFileLocalIntake(item._file, item._file.name);
		}

		var uploadFileLocalIntake = function (file, thename) {
			$scope.intakeID = $scope.INTAKEID;
		
			$scope.theWait = "Document(s) currently uploading!";
	
		    var libraryName = "ProjectSolutionDocs";
			var webUrl = "https://usdos.sharepoint.com/sites/M-PRI/Internal/Innovation/_api/web/lists/getByTitle('ProjectSolutionDocs')/RootFolder/files/add(url=@TargetFileName,overwrite='true')?" + "@TargetLibrary='" + libraryName + "'" + "&@TargetFileName='" + thename + "'&$expand=ListItemAllFields";				
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

							var getIntakeDocData = function(thegetData) {
								angular.forEach(thegetData, function(thedata){
									$scope.tempDOCUMENT = {};
									angular.extend(file, $scope.tempDOCUMENT);
									$scope.tempDOCUMENT.Name = thedata.Id + "-" + thedata.Name;
									$scope.tempDOCUMENT.Id = thedata.Id;
									if($scope.intakeID != '' && $scope.intakeID != null) { $scope.tempDOCUMENT.ReqmtID = $scope.intakeID; $scope.dataintakedocs.push($scope.tempDOCUMENT); }
									else {
									
								$scope.tempDOCUMENT.ReqmtID = JSON.stringify(theService.getIntakeID($scope.tempGENID)); }
									updateListItemREST("ProjectSolutionDocs", JSON.parse(angular.toJson($scope.tempDOCUMENT))).then(function(d) { });
									$scope.theWait = "Document(s) uploaded successfully!";
								}); 
							};
							theService.getIntakeDoc(thename).then(getIntakeDocData);
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

			if(window.location.href.indexOf("Index.aspx#!/Home") != -1 || window.location.href.indexOf("Index.aspx#!/Calendar") != -1 || window.location.href.indexOf("Index.aspx#!/Active") != -1 || window.location.href.indexOf("Index.aspx#!/CIntake") != -1 || window.location.href.indexOf("Index.aspx#!/TIntake") != -1 || window.location.href.indexOf("Index.aspx#!/Complete") != -1 || window.location.href.indexOf("Index.aspx#!/Declined") != -1 || window.location.href.indexOf("Index.aspx#!/IDiscovery") != -1 || window.location.href.indexOf("Index.aspx#!/TBacklog") != -1 || window.location.href.indexOf("Index.aspx#!/QFulfillment") != -1) { theService.getIntake().then(getIntakeData); }			



			if(window.location.href.indexOf("Index.aspx#!/Update") != -1 || window.location.href.indexOf("Print.aspx#!/Print") != -1 || window.location.href.indexOf("Index.aspx#!/Draft") != -1 || window.location.href.indexOf("Index.aspx#!/Print") != -1) { 
				theService.getIntakebyID(INTAKEID).then(getIntakebyIDData);
				theService.getTheIntakeDocs(INTAKEID).then(getTheIntakeDocsData);
			}

			if(window.location.href.indexOf("Index.aspx#!/ManageTeam") != -1) {
				$scope.tempUser = [];
				var peoplePickerUsers =[];  
				var AllpeoplePickerUsers =[];  
				var CurPersonId;
		
				$.ajax({
					url: "https://usdos.sharepoint.com/sites/M-PRI/Internal/Innovation/_api/web/siteusers",
					type: "GET",
					headers: { "ACCEPT": "application/json;odata=verbose" },
					async: false,
					success: function (data) { 		        
						AllpeoplePickerUsers = data.d.results;
			        	for (var i = 0; i < AllpeoplePickerUsers.length; i++) {    
		                	var property = AllpeoplePickerUsers[i].LoginName;
		                    peoplePickerUsers.push(property);  
		                }
				    }
				});
				$( function() { $("#Persons").autocomplete({ source: peoplePickerUsers }); });			
			}
		});		
};

//development Notes
//After closing Status or Documents window user must click or they get blank page
//Google Charts had to switch https to http to make work in Mozilla

var MSSApp = angular.module("MSSApp");
MSSApp.controller("theController", theController);

}());