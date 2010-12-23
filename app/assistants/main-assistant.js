function MainAssistant(argFromPusher) {}

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
		},
		this.cameraListModel = {
			items: []
	});
	this.cameraList = this.controller.get("camera-list");
	this.cameraListHandler = this.handleCameraListTap.bind(this);
	Mojo.Event.listen(this.cameraList, Mojo.Event.tap, this.cameraListHandler);

	this.loadSitesAndCameras();
};

MainAssistant.prototype.cleanup = function() {

};

MainAssistant.prototype.loadSitesAndCameras = function() {
	serviceLocator.siteService.loadSites(
		// Success
		function() {
			this.siteSelectorModel.choices = serviceLocator.siteService.sites;
			this.controller.modelChanged(this.siteSelectorModel);
		}.bind(this),
		// Failure
		function(response) {
		});
};

MainAssistant.prototype.handleSiteSelectorChange = function(event) {
};

MainAssistant.prototype.handleCameraListTap = function(event) {
};