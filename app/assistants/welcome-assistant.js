function WelcomeAssistant(argFromPusher) {}

WelcomeAssistant.prototype.setup = function() {

	this.controller.setupWidget("spinner",
		this.attributes = {
			spinnerSize: "large"
		},
		this.model = {
			spinning: true 
		}
	); 

	this.doLogin();
};

WelcomeAssistant.prototype.cleanup = function() {

};

WelcomeAssistant.prototype.doLogin = function() {
	serviceLocator.authService.authenticateFromStorage(
		// Success
		function() {
			Mojo.Log.info("Login success with stored auth token");
			this.controller.stageController.swapScene("main");
		}.bind(this),
		// Failure
		function(response) {
			Mojo.Log.warn("Login failure (%s)", response.status);
			this.controller.stageController.swapScene("login");
		}.bind(this),
		// Credentials needed
		function() {
			Mojo.Log.info("Login credentials needed");
			this.controller.stageController.swapScene("login");
		}.bind(this));
};