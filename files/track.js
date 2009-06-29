// See bug 392342 first.

// Set up trackers on the download links.
// See bug 391347 for more information.

function installDownloadTrackers (regexp, trackingFunction) {

	var browser = function() {
		var n = navigator.userAgent;
		if (n.indexOf("Opera") != -1) return "opera";
		else if (n.indexOf("MSIE 6.") != -1) return "ie6";
		else if (n.indexOf("MSIE 7.") != -1) return "ie7";
		else if (n.indexOf("Safari") != -1)	return "safari";
		else if (n.indexOf("Firefox/3") != -1) return "firefox3";
		else if (n.indexOf("Firefox/2") != -1) return "firefox2";
		else if (n.indexOf("Firefox/1.5") != -1) return "firefox15";
		else if (n.indexOf("Firefox/1") != -1) return "firefox1";
		else if (n.indexOf("Gecko") != -1) return "gecko-other";
		else return "other";
	}();

	var downloadLinks = function() { //  returns an array of all "A" objects whose href attributes satisfy the regexp
		var re = new RegExp(regexp);
		var returnedLinks = new Array();
		var link;
		for (var i = 0; link = document.getElementsByTagName('a')[i]; i++) {
			if (re.test(link.href)) 
				returnedLinks.push(link); 
		}
		return returnedLinks; 
	}();
		
	function setTracker() {
		if (window.event && window.event.srcElement) {
			var a = window.event.srcElement;
			while (a.tagName != "A") { // in IE, iterate throught event catcher's parents untill a first A object is found
				a = a.parentNode;
			}
		} else
			var a = this;
		
		trackingFunction('/download-tracking/' + a.dlParams.lang + '/' + a.dlParams.product + '/' + a.dlParams.os + '/using:' + browser);
	}
	
	var dl;
	for (var i = 0; dl = downloadLinks[i]; i++) {
		
		// create download information parameters inside each A object
		dl.dlParams = new Array();
		var allParams = dl.search.substring(1).split("&");
		var parameter;
		for (var j = 0; parameter = allParams[j]; j++) {
			var parameterDetails = parameter.split("=");
			dl.dlParams[parameterDetails[0]] = parameterDetails[1];
		}
		
		if(window.addEventListener)
			dl.addEventListener("click", setTracker, false);
		else
			dl.attachEvent("onclick", setTracker);
	}
}

// Set up trackers on chosen links.
// See bug 393056 for more information.

var htmllang = document.getElementsByTagName("HTML")[0].lang;
var localedir = (htmllang) ? htmllang + '/' : 'unspecified-locale/';

function installClickTrackers (included, excluded, trackingFunction, fakeroot) {

	function setTracker() {
		if (window.event && window.event.srcElement) {
			var a = window.event.srcElement;
			while (a.tagName != "A") { // in IE, iterate throught event catcher's parents untill a first A object is found
				a = a.parentNode;
			}
		} else
			var a = this;
			
		var target = a.hostname + ((a.pathname.charAt(0) == '/') ? a.pathname : '/' + a.pathname) + a.search;
		if (!target) target = a.href;
		trackingFunction(fakeroot + localedir + target);
	}
	

 	var re_include = new RegExp(included);
 	var re_exclude = new RegExp(excluded);
	var link;
	for (var i = 0; link = document.getElementsByTagName('a')[i]; i++) {
 		if (!re_exclude.test(link.href)) {
 			if (re_include.test(link.href)) {
				addListener(link, "click", setTracker);
			}
		}
	}
}

function onLoad() { 
 	installClickTrackers(window.location.hostname + "/.+/support/", "en-US", urchinTracker, "/outbound/");
	installClickTrackers(window.location.hostname + "/.+/releasenotes/", "en-US", urchinTracker, "/outbound/");
 	installClickTrackers(".?", window.location.hostname + "|download.*?mozilla.org|download.html", urchinTracker, "/outbound/");
	
	installDownloadTrackers("download.*?mozilla.org|download.html", urchinTracker);
}

function addListener(object, type, pointer) {
	if(object.addEventListener)
		object.addEventListener(type, pointer, false);
	else
		object.attachEvent("on"+type, pointer);
}

addListener(window, "load", onLoad);
