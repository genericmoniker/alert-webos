function PrefsService() {

	this.VIDEO_MODE_AUTO = 0;
	this.VIDEO_MODE_DIRECT = 1;
	this.VIDEO_MODE_RELAY = 2;

	this.localStorage = null;
	this.resetToDefaults();
}

PrefsService.prototype.resetToDefaults = function() {
	this.videoMode = this.VIDEO_MODE_AUTO;
	this.useServerOverrides = false;
	this.webServerOverride = "";
	this.mediaServerOverride = "";
	this.selectedSite = "";
};

PrefsService.prototype.loadPref = function (name, defaultValue) {
	var value = this.localStorage.getValue(name);
	if (value) {
		return value;
	} else {
		return defaultValue;
	}
};

PrefsService.prototype.load = function() {
	Mojo.Log.info("Loading preferences");
	this.videoMode = parseInt(this.loadPref("videoMode", this.videoMode));
	this.useServerOverrides = this.loadPref("useServerOverrides", this.useServerOverrides);
	this.webServerOverride = this.loadPref("webServerOverride", this.webServerOverride);
	this.mediaServerOverride = this.loadPref("mediaServerOverride", this.mediaServerOverride);
	this.selectedSite = this.loadPref("selectedSite", this.selectedSite);
};

PrefsService.prototype.save = function() {
	Mojo.Log.info("Saving preferences");
	this.localStorage.setValue("videoMode", this.videoMode);
	this.localStorage.setValue("useServerOverrides", this.useServerOverrides);
	this.localStorage.setValue("webServerOverride", this.webServerOverride);
	this.localStorage.setValue("mediaServerOverride", this.mediaServerOverride);
	this.localStorage.setValue("selectedSite", this.selectedSite);
};

