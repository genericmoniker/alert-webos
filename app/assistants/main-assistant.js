function MainAssistant(argFromPusher) {
	this.currentSite = null;
	this.busyRefCount = 0;
}

// Inherit from AssistantBase
MainAssistant.prototype = new AssistantBase();

MainAssistant.prototype.setup = function() {

	this.controller.setupWidget("busy-scrim",
		this.busySpinnerAttributes = {
			spinnerSize: "large"
		},
		this.busySpinnerModel = {
			spinning: false
		}
	);

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

	this.busyBegin();
	this.loadSitesAndCameras();

	this.refreshHandler = this.handleRefreshTimer.bind(this);
};

MainAssistant.prototype.cleanup = function() {
	// TODO: Clean up event handlers
};

MainAssistant.prototype.activate = function(event) {
	this.refreshId = setInterval(this.refreshHandler, 60000);
};

MainAssistant.prototype.deactivate = function(event) {
	clearInterval(this.refreshId);
};

MainAssistant.prototype.busyBegin = function() {
	if (this.busyRefCount++ === 0) {
		$("busy-scrim").show();
		this.busySpinnerModel.spinning = true;
		this.controller.modelChanged(this.busySpinnerModel);
	}
};

MainAssistant.prototype.busyEnd = function() {
	if (this.busyRefCount === 0) { return; }
	if (--this.busyRefCount === 0) {
		$("busy-scrim").hide();
		this.busySpinnerModel.spinning = false;
		this.controller.modelChanged(this.busySpinnerModel);
	}
};

MainAssistant.prototype.loadSitesAndCameras = function() {
	serviceLocator.siteService.loadSites(
	// Success
	function() {
		this.busyEnd();
		this.updateSiteSelectorModel();
		this.updateCameraListModel();
	}.bind(this),

	// Failure
	function(transport) {
		this.busyEnd();
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

MainAssistant.prototype.playVideo = function(url) {
/* Using the video application: */
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "launch",
		parameters: {
			id: "com.palm.app.videoplayer",
			params: {
				target: url
			}
		}
	});
/*
	this.controller.stageController.pushScene("media", url);
*/
};

MainAssistant.prototype.relayVideo = function(camera) {
	this.busyBegin();
	serviceLocator.videoService.getLiveVideoURL(camera,
		// Success
		function(url) {
			this.busyEnd();
			this.playVideo(url);
		}.bind(this),
		// Failure
		function(transport) {
			this.busyEnd();
			this.showError("Unable to start playing video (" + transport.status + ")");
		}.bind(this)
	);
};

MainAssistant.prototype.handleSiteSelectorChange = function(event) {
	this.updateCameraListModel();
};

MainAssistant.prototype.handleCameraListTap = function(event) {
	var camera = this.cameraListModel.items[event.index];
	if (camera.isOnline) {
		if (true /* is local */) {
			this.playVideo("rtsp://" + camera.ip + "/LowResolutionVideo");
		} else {
			// this.relayVideo(camera);
		}
	} else {
		this.showError("This camera is currently offline. Try again later."); 
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

MainAssistant.prototype.handleRefreshTimer = function(event) {
	Mojo.Log.info("Refresh timer fired.");
	this.loadSitesAndCameras();
};