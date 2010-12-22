
function AuthService() {
	this.httpClient = null;
	this.localStorage = null;
}

AuthService.prototype.authenticate = function(onSuccess, onFailure, onCredentialsNeeded) {
	var authToken = this.localStorage.getValue("authToken");
	if (authToken) {
		this.httpClient.authToken = authToken;
		this.httpClient.get("membership.svc", null, false, onSuccess, onFailure);
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
		function(response) {
			Mojo.Log.info("Authenticate succeeded");
			var authToken = response.getHeader("X-Authorization-Token");
			this.httpClient.authToken = authToken;
			this.localStorage.setValue("authToken", authToken);
			if (onSuccess) {
				onSuccess(response);
			}
		}.bind(this),

		// Failure
		onFailure);
};

AuthService.prototype.logout = function() {
	this.localStorage.remove("authToken");
};

AuthService.prototype.xmlEscape = function(string) {
	string.replace(/&/g, "&amp;");
	string.replace(/</g, "&lt;");
	return string;
};