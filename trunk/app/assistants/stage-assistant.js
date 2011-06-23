function StageAssistant() {
}

var serviceLocator = null;

StageAssistant.prototype.setup = function() {
	
	// Global service locator
	serviceLocator = new ServiceLocator();

	this.controller.swapScene({name: "welcome", disableSceneScroller: true});
	this.controller.setWindowOrientation("free");
	
	// Application menu model
	this.appMenuModel = {
		visible: true
	};
};

StageAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.commandEnable) {
		if (event.command == Mojo.Menu.helpCmd) {
			event.stopPropagation(); // Enable the Help menu.
		} else if (event.command == Mojo.Menu.prefsCmd) {
			event.stopPropagation(); // Enable the Preferences menu.
		}
	}
	else if (event.type === Mojo.Event.command) {
		switch (event.command) {
		case Mojo.Menu.prefsCmd:
			this.controller.pushScene("prefs");
			break;
		case Mojo.Menu.helpCmd:
			this.controller.pushAppSupportInfoScene();
			break;
		}
	}
};