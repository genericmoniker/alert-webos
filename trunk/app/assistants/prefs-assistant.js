function PrefsAssistant(argFromPusher) {}

PrefsAssistant.prototype.setup = function() {

	var auth = serviceLocator.authService;

	this.controller.setupWidget("logout-button",
	this.logoutButtonAttributes = {
	},
	this.logoutButtonModel = {
		label: "Logout",
		disabled: !auth.userIsAuthenticated
	});
	this.logoutButton = this.controller.get("logout-button");
	this.logoutHandler = this.handleLogout.bind(this);
	Mojo.Event.listen(this.logoutButton, Mojo.Event.tap, this.logoutHandler);

	if (auth.userIsAuthenticated) {
		$("username").innerHTML = auth.username;
	} else {
		$("username").innerHTML = "Not logged in";
	}
};

PrefsAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.logoutButton, Mojo.Event.tap, this.logoutHandler);
};

PrefsAssistant.prototype.handleLogout = function() {
	serviceLocator.authService.logout();
	this.controller.stageController.popScene();
	this.controller.stageController.swapScene("login");
};