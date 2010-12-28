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

	this.handleLogin();
};

WelcomeAssistant.prototype.cleanup = function() {

};

WelcomeAssistant.prototype.handleLogin = function() {

	this.controller.stageController.swapScene("login");
/*
	serviceLocator.authService.authenticate("ericsmith@byu.net", "video.1",
		function() {
			this.controller.stageController.pushScene("main");
		}.bind(this),
		function() {
			// TODO: Report error
		}.bind(this));
*/
};