function PrefsAssistant(argFromPusher) {}

PrefsAssistant.prototype.setup = function() {
	this.controller.setupWidget("logout-button",
	this.logoutButtonAttributes = {
	},
	this.logoutButtonModel = {
		label: "Logout"
	});
	this.logoutButton = this.controller.get("logout-button");
	this.logoutHandler = this.handleLogout.bind(this);
	Mojo.Event.listen(this.logoutButton, Mojo.Event.tap, this.logoutHandler);

};

PrefsAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.logoutButton, Mojo.Event.tap, this.logoutHandler);
};

PrefsAssistant.prototype.handleLogout = function() {
	serviceLocator.authService.logout();
	this.controller.stageController.popScene();
	this.controller.stageController.swapScene("login");
};