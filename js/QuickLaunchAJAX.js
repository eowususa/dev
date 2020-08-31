$(document).ready(function() {
$("tr.ms-sbrow").append("<td class='ms-sbcell' style='white-space: nowrap; padding-left: 10px'><a href='/SearchCenter/pages/advanced.aspx' title='Advanced Search'>Advanced Search</a></td>");
hijacklinks();
});
function openEditDialog(editFormURL) {
			var options = {
                title: "Generate Correspondence Serial Number",
				url:  editFormURL,
				dialogReturnValueCallback: serialCloseCallBack,
				};
			SP.UI.ModalDialog.showModalDialog(options);
}
function receiptCloseCallBack (dialogResult, data) {
        if (dialogResult === SP.UI.DialogResult.OK){
			if (data){
			 openEditDialog(data);
				}
			else {
			 window.location.href = '/Lists/HRPP%20Correspondence%20Tracking';
			 
			};
		};
	}

function serialCloseCallBack (dialogResult, data) {
    if (dialogResult === SP.UI.DialogResult.OK){
     	var options = {
                title: "HRPP Serial Receipt",
				url:  "/Pages/HRPPSerialReceipt.aspx",
				dialogReturnValueCallback: receiptCloseCallBack
				};
			SP.UI.ModalDialog.showModalDialog(options);
			};
	 }

	 
function hijacklinks() {
$('a.static[href*="NewForm"]').each(function() {
    var newFormURL = $(this).attr("href");
	if ($(this).attr("title") != "Create HRPP Correspondence Serial#") {
	var newFormURL = $(this).attr("href"); 
		$(this).click(function(event) {
			event.preventDefault();
			var options = {
                title: "Add New Item",
				url:  newFormURL,
				};
			SP.UI.ModalDialog.showModalDialog(options);
		});
		}
	else {
		$(this).click(function(event) {
			event.preventDefault();
			var options = {
                title: "Generate Correspondence Serial Number",
				url:  newFormURL,
				dialogReturnValueCallback: serialCloseCallBack,
				};
			SP.UI.ModalDialog.showModalDialog(options);
	});
	};
});

$('a.static[href*="Upload.aspx"]').each(function (){
	var link = $(this).attr("href");
    var libraryName = $(this).attr("title");
		$(this).click(function (event) {
			event.preventDefault();
			library = libraryName;
			//library = link.substr(link.indexOf("List=")+5,36);
				var options = {
                title: "Upload Documents",
				url:  link,
				dialogReturnValueCallback: documentMgmt,
				};
			SP.UI.ModalDialog.showModalDialog(options);
			});
			});
$('a[href*="DispForm"],[href*="EditForm"]').each(function () {
		$(this).attr('onclick','').unbind('click');
		
		$(this).click(function (event) {
			event.preventDefault();
			var formTitle  = $(this).text();
			var formURL = $(this).attr("href");
			var options = {
				title: formTitle,
				url: formURL,
				};
			SP.UI.ModalDialog.showModalDialog(options);
			});
			});
			
$('a[onclick*="GoToDiscussion"]').each(function() {
	$(this).attr('onclick','').unbind('click');
	$(this).click(function(event) {
			event.preventDefault();
			var formTitle = $(this).text();
			var formURL = $(this).attr("href");
			var options = {
				title: formTitle,
				url: formURL,
				};
				SP.UI.ModalDialog.showModalDialog(options);
		});
});
}
function documentMgmt (result) { 
	if(result === SP.UI.DialogResult.OK) {
       var options = {
			url : _spPageContextInfo.webServerRelativeUrl + "Pages/DONHRPP.aspx?IsDlg=1#/"+ library +"/",
			showMaximized: true,
			};
			SP.UI.ModalDialog.showModalDialog(options);
			};
			}
