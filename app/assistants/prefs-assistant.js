function PrefsAssistant(argFromPusher) {}

PrefsAssistant.prototype.setup = function() {

	var auth = serviceLocator.authService;
	var prefs = serviceLocator.prefsService;

	if (auth.getUserIsAuthenticated()) {
		$("username").innerHTML = auth.getUsername();
	} else {
		$("username").innerHTML = "Not logged in";
	}

	this.controller.setupWidget("logout-button", this.logoutButtonAttributes = {},
	this.logoutButtonModel = {
		label: "Logout",
		disabled: !auth.getUserIsAuthenticated()
	});
	this.logoutButton = this.controller.get("logout-button");
	this.logoutHandler = this.handleLogout.bind(this);
	Mojo.Event.listen(this.logoutButton, Mojo.Event.tap, this.logoutHandler);

	// Advanced settings
	
	this.controller.setupWidget("mode-selector", 
		this.modeSelectorAttributes = {
			label: "Video Mode"
		},
		this.modeSelectorModel = {
			choices: [
				{ label: "Auto", value: prefs.VIDEO_MODE_AUTO },
				{ label: "Direct", value: prefs.VIDEO_MODE_DIRECT },
				{ label: "Relay", value: prefs.VIDEO_MODE_RELAY }
			],
			value: prefs.videoMode
	});

	this.controller.setupWidget("override-toggle", 
		this.overrideToggleAttributes = {
		},
		this.overrideToggleModel = {
			value: prefs.useServerOverrides,
			disabled: false
	});
	this.overrideToggle = this.controller.get("override-toggle");

	this.controller.setupWidget("web-textfield",
		this.webTextFieldAttributes = {
			textCase: Mojo.Widget.steModeLowerCase 
		},
		this.webTextFieldModel = {
			value: prefs.webServerOverride
	});
	this.webTextField = this.controller.get("web-textfield");

	this.controller.setupWidget("media-textfield",
		this.mediaTextFieldAttributes = {
			textCase: Mojo.Widget.steModeLowerCase 
		},
		this.mediaTextFieldModel = {
			value: prefs.mediaServerOverride
	});
	this.mediaTextField = this.controller.get("media-textfield");
	
};

PrefsAssistant.prototype.cleanup = function() {
	var prefs = serviceLocator.prefsService;
	prefs.videoMode = parseInt(this.modeSelectorModel.value);
	prefs.useServerOverrides = this.overrideToggleModel.value;
	prefs.webServerOverride = this.webTextFieldModel.value;
	prefs.mediaServerOverride = this.mediaTextFieldModel.value;
	prefs.save();

	Mojo.Event.stopListening(this.logoutButton, Mojo.Event.tap, this.logoutHandler);
};

PrefsAssistant.prototype.handleLogout = function() {
	serviceLocator.authService.logout();
	this.controller.stageController.popScene();
	this.controller.stageController.swapScene("login");
};

