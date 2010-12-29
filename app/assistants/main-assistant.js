function MainAssistant(argFromPusher) {
	this.currentSite = null;
}

MainAssistant.prototype.setup = function() {

	this.controller.setupWidget("site-selector", 
		this.siteSelectorAttributes = {
			label: "Site"
		},
		this.siteSelectorModel = {
			choices: []
	});
	this.siteSelector = this.controller.get("site-selector");
	this.siteSelectorHandler = this.handleSiteSelectorChange.bind(this);
	Mojo.Event.listen(this.siteSelector, Mojo.Event.propertyChange, this.siteSelectorHandler);

	this.controller.setupWidget("camera-list", 
		this.cameraListAttributes = {
			itemTemplate: "main/camera-item-template"
		},
		this.cameraListModel = {
			items: []// { name: "My cam" }, { name: "Your cam"}]
	});
	this.cameraList = this.controller.get("camera-list");
	this.cameraListHandler = this.handleCameraListTap.bind(this);
	Mojo.Event.listen(this.cameraList, Mojo.Event.listTap, this.cameraListHandler);

	// Application Menu
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttributes = {},
	this.appMenuModel = {
		visible: true
	});

	this.loadSitesAndCameras();
};

MainAssistant.prototype.cleanup = function() {
	// TODO: Clean up event handlers
};

MainAssistant.prototype.loadSitesAndCameras = function() {
	serviceLocator.siteService.loadSites(
	// Success
	function() {
		this.updateSiteSelectorModel();
		this.updateCameraListModel();
	}.bind(this),

	// Failure
	function(transport) {
		Mojo.Log.error("Failed loading sites and cameras - %s - %s", transport.status, transport.statusMessage);
		this.showError("There was a problem loading the list of sites and cameras. (" + transport.status + ")");
	}.bind(this));
};

MainAssistant.prototype.updateSiteSelectorModel = function() {
	var sites = serviceLocator.siteService.sites;
	var choices = [];
	for (var s = 0; s < sites.length; ++s) {
		var site = sites[s];
		choices.push({
			label: site.name,
			value: site.id
		});
	}
	this.siteSelectorModel.choices = choices;
	this.siteSelectorModel.value = choices[0].value;
	this.controller.modelChanged(this.siteSelectorModel);
};

MainAssistant.prototype.updateCameraListModel = function() {
	var sites = serviceLocator.siteService.sites;
	for (var s = 0; s < sites.length; ++s) {
		var site = sites[s];
		if (site.id == this.siteSelectorModel.value) {
			Mojo.Log.info("Selecting site: %s", site.name);
			this.currentSite = site;
			this.cameraListModel = {
				items: this.currentSite.cameras
			};
			this.controller.setWidgetModel("camera-list", this.cameraListModel);
			break;
		}
	}
};

MainAssistant.prototype.showError = function(errorMessage, retry) {
	// TODO: retry
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title: "Error",
		message: errorMessage,
		choices: [
			{ label: $L("OK"), value: "" }
			]
	});
};

MainAssistant.prototype.playVideo = function(url) {
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "launch",
		parameters: {
			id: "com.palm.app.videoplayer",
			params: {
				target: url
			}
		}
	});
};

MainAssistant.prototype.handleSiteSelectorChange = function(event) {
	this.updateCameraListModel();
};

MainAssistant.prototype.handleCameraListTap = function(event) {
	var camera = this.cameraListModel.items[event.index];
	if (camera.isOnline) {
		serviceLocator.videoService.getLiveVideoURL(camera,
			// Success
			function(url) {
				this.playVideo(url);
			}.bind(this),
			// Failure
			function(transport) {
				this.showError("Unable to start playing video (" + transport.status + ")");
			}.bind(this)
		);
	}
};

MainAssistant.prototype.handleCommand = function(event) {
	if (event.type == Mojo.Event.commandEnable) {
		if (event.command == Mojo.Menu.prefsCmd) {
			event.stopPropagation(); // Enable the Preferences menu.
		}
	}
	else if (event.type == Mojo.Event.command) {
		switch (event.command) {
		case Mojo.Menu.prefsCmd:
			this.controller.stageController.pushScene("prefs");
			break;
		case Mojo.Menu.helpCmd:
			// TODO
			break;
		}
	}
};