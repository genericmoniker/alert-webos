function HTTPClient() {
	this.prefsService = null;
	this.authToken = "";
	this.host = "alert.logitech.com";
	this.baseURL = "http://alert.logitech.com/Services/";
	this.baseURLSecure = "https://alert.logitech.com/Services/";
}

HTTPClient.prototype.getHost = function() {
	if (this.prefsService.useServerOverrides) {
		var host = this.prefsService.webServerOverride;
		if (host && host.length > 0) {
			return host;
		} 
	}
	return this.host;
};

HTTPClient.prototype.getBaseURL = function(secure) {
	var host = this.getHost();
	var baseURL = null;
	
	// Disable HTTPS if we've got server overrides so that
	// we can also use self-signed certs.
	if (this.prefsService.useServerOverrides) {
		secure = false;
	}
	
	if (secure) {
		baseURL = "https://" + host + "/Services/";
	} else {
		baseURL = "http://" + host + "/Services/";
	}
	return baseURL;
};

HTTPClient.prototype.resolveURL = function(relativeURL, secure, addAuth) {
	var url = this.getBaseURL(secure) + relativeURL;
	if (addAuth) {
		url += "?_auth=" + this.authToken;
	}
	return url;
};

HTTPClient.prototype.post = function(relativeURL, headers, data, secure, onSuccess, onFailure) {
	var url = this.resolveURL(relativeURL, secure);
	if (headers === null) { headers = {}; }
	this.addAuthorization(headers);
	Mojo.Log.info("HTTP POST %s", url);
	var request = new Ajax.Request(url, 
		{
			method: "post",
			contentType: "application/xml",
			postBody: data,
			requestHeaders: headers,
			onSuccess: onSuccess,
			onFailure: onFailure,
			onException: this.handleException,
			onComplete: this.handleComplete
		});
};

HTTPClient.prototype.get = function(relativeURL, headers, secure, onSuccess, onFailure) {
	var url = this.resolveURL(relativeURL, secure);
	if (headers === null) { headers = {}; }
	this.addAuthorization(headers);
	Mojo.Log.info("HTTP GET %s", url);
	var request = new Ajax.Request(url, 
		{
			method: "get",
			requestHeaders: headers,
			onSuccess: onSuccess,
			onFailure: onFailure,
			onException: this.handleException,
			onComplete: this.handleComplete
		});
};

HTTPClient.prototype.addAuthorization = function(headers) {
	if (this.authToken !== null && this.authToken.length > 0) {
		headers.Authorization = this.authToken;
	}
};

HTTPClient.prototype.handleException = function(response, e) {
	Mojo.Log.error("HTTP request exception: %s", e.message);
};

HTTPClient.prototype.handleComplete = function(response) {
	Mojo.Log.info("HTTP request complete: %j", response);
};