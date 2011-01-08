
function AuthService() {
	this.httpClient = null;
	this.localStorage = null;
	this.userIsAuthenticated = false;
	this.username = "";
}

AuthService.prototype.authenticateFromStorage = function(onSuccess, onFailure, onCredentialsNeeded) {
	var authToken = this.localStorage.getValue("authToken");
	
	// Note: We don't check for null to handle undefined case too.
	if (authToken) {
		this.username = this.localStorage.getValue("username");
		this.httpClient.authToken = authToken;
		this.httpClient.get("membership.svc/validate", null, false, 
			// Success
			function(transport) {
				this.userIsAuthenticated = true;
				onSuccess(transport);
			}.bind(this),
			
			// Failure
			onFailure);
	}	else {
		if (onCredentialsNeeded) {
			onCredentialsNeeded();
		}
	}
};

AuthService.prototype.authenticate = function(username, password, onSuccess, onFailure) {

	var authInfo = "<AuthInfo><UserName>" +
		this.xmlEscape(username) + 
		"</UserName><Password>" +
		this.xmlEscape(password) +
		"</Password></AuthInfo>"; 
		
	this.httpClient.post("membership.svc/authenticate", null, authInfo, true,

		// Success
		function(transport) {
			var authToken = transport.getHeader("X-Authorization-Token");
			if (authToken) {
				Mojo.Log.info("Authenticate succeeded: %s", transport.status);
				this.httpClient.authToken = authToken;
				this.localStorage.setValue("authToken", authToken);
				this.localStorage.setValue("username", username);
				this.userIsAuthenticated = true;
				if (onSuccess) {
					onSuccess(transport);
				}
			} else {
				Mojo.Log.error("HTTPClient reports success, but no auth token.");
				onFailure(transport);
			}
		}.bind(this),

		// Failure
		onFailure);
};

AuthService.prototype.logout = function() {
	this.localStorage.remove("authToken");
	this.localStorage.remove("username");
	this.userIsAuthenticated = false;
	this.username = "";
};

AuthService.prototype.xmlEscape = function(string) {
	string.replace(/&/g, "&amp;");
	string.replace(/</g, "&lt;");
	return string;
};