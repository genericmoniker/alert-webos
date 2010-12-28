function MainAssistant(argFromPusher) {
	this.currentSite = null;
}

MainAssistant.prototype.setup = function() {

	this.controller.setupWidget("site-selector", this.siteSelectorAttributes = {
		label: "Site"
	},
	this.siteSelectorModel = {
		choices: []
	});
	this.siteSelector = this.controller.get("site-selector");
	this.siteSelectorHandler = this.handleSiteSelectorChange.bind(this);
	Mojo.Event.listen(this.siteSelector, Mojo.Event.propertyChange, this.siteSelectorHandler);

	this.controller.setupWidget("camera-list", this.cameraListAttributes = {
		itemTemplate: "views/main/camera-item-template.html",
		itemsCallback: this.cameraItemsCallback.bind(this)
	},
	this.cameraListModel = {});
	this.cameraList = this.controller.get("camera-list");
	this.cameraListHandler = this.handleCameraListTap.bind(this);
	Mojo.Event.listen(this.cameraList, Mojo.Event.tap, this.cameraListHandler);

	// Application Menu
	this.controller.setupWidget(Mojo.Menu.appMenu, this.appMenuAttributes = {},
	this.appMenuModel = {
		visible: true
	});

	this.loadSitesAndCameras();
};

MainAssistant.prototype.cleanup = function() {

};

MainAssistant.prototype.loadSitesAndCameras = function() {
	serviceLocator.siteService.loadSites(
	// Success
	function() {
		this.updateSiteSelectorModel();
		this.updateCameraListModel();
	}.bind(this),

	// Failure
	function(response) {
		Mojo.Log.error("Failed loading sites and cameras - %s - %s", response.status, response.statusMessage);
		// TODO: showError (below)
	});
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
			Mojo.Log.info("Selecting site: %s", site);
			this.currentSite = site;
			this.cameraList.mojo.noticeUpdatedItems(0, site.cameras);
			break;
		}
	}
};

MainAssistant.prototype.showError = function() {
	// TODO...
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title: $L("My App ? v1.0"),
		message: $L("Copyright 2008-2009, My Company Inc."),
		choices: [
			{ label: $L("OK"), value: "" }
			]
	});
};

MainAssistant.prototype.cameraItemsCallback = function(listWidget, offset, limit) {
	if (this.currentSite !== null) {
		return this.currentSite.cameras.slice(offset);
	}
	return [];
};

MainAssistant.prototype.handleSiteSelectorChange = function(event) {
	this.updateCameraListModel();
};

MainAssistant.prototype.handleCameraListTap = function(event) {};


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