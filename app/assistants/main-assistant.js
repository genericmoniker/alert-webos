function MainAssistant(argFromPusher) {
	this.currentSite = null;
	this.busyRefCount = 0;
}

MainAssistant.prototype.setup = function() {

	this.controller.setupWidget("busy-spinner",
		this.busySpinnerAttributes = { 
			spinnerSize: "large" 
		},
		this.busySpinnerModel = { 
			spinning: true 
		}
	);

	this.controller.setupWidget("site-selector", 
		this.siteSelectorAttributes = {
			label: "Site"
		},
		this.siteSelectorModel = {
			choices: []
		}
	);
	this.siteSelector = this.controller.get("site-selector");
	this.siteSelectorHandler = this.handleSiteSelectorChange.bind(this);
	Mojo.Event.listen(this.siteSelector, Mojo.Event.propertyChange, this.siteSelectorHandler);

	this.controller.setupWidget("camera-list", 
		this.cameraListAttributes = {
			itemTemplate: "main/camera-item-template"
		},
		this.cameraListModel = {
			items: []
		}
	);
	this.cameraList = this.controller.get("camera-list");
	this.cameraListHandler = this.handleCameraListTap.bind(this);
	Mojo.Event.listen(this.cameraList, Mojo.Event.listTap, this.cameraListHandler);

	// Application menu (setup in each scene).
	this.controller.setupWidget(Mojo.Menu.appMenu, {}, this.controller.stageController.appMenuModel);

	this.busyBegin();
	this.loadSitesAndCameras();

	this.refreshHandler = this.handleRefreshTimer.bind(this);
};

MainAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.cameraList, Mojo.Event.listTap, this.cameraListHandler);
	Mojo.Event.stopListening(this.siteSelector, Mojo.Event.propertyChange, this.siteSelectorHandler);
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
		if (!this.busySpinnerModel.spinning) {
			this.busySpinnerModel.spinning = true;
			this.controller.modelChanged(this.busySpinnerModel);
		}
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
		showError(this.controller, 
			"There was a problem loading the list of sites and cameras. (" + transport.status + ")");
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
/* 
	// Using the video application: 
	this.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "launch",
		parameters: {
			id: "com.palm.app.videoplayer",
			params: {
				target: url
			}
		}
	});
*/

	// Using a custom HTML5 scene:
	this.controller.stageController.pushScene("media", url);

};

MainAssistant.prototype.requestVideo = function(camera) {
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
			showError(this.controller, 
				"Unable to start playing video (" + transport.status + ").");
		}.bind(this)
	);
};

MainAssistant.prototype.handleSiteSelectorChange = function(event) {
	this.updateCameraListModel();
};

MainAssistant.prototype.handleCameraListTap = function(event) {
	var camera = this.cameraListModel.items[event.index];

	if (event.originalEvent.target.id === "snapshot-img") {
		Mojo.Log.info("Tap on camera image");
		if (camera.isOnline) {
			this.requestVideo(camera);
		} else {
			showError(this.controller, 
				"This camera is currently offline. Try again later."); 
		}
	}
	else {
		Mojo.Log.info("Tap on camera item");
		this.controller.stageController.pushScene("camera", camera);
	}
};

/* 
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
*/

MainAssistant.prototype.handleRefreshTimer = function(event) {
	Mojo.Log.info("Refresh timer fired.");
	this.loadSitesAndCameras();
};