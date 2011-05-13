
function VideoService() {
	this.httpClient = null;
	this.prefsService = null;
	this.netService = null;

	this.ipExternal = null;

	this.liveVideoRequestData = "<LiveVideoInfo>" + 
		"<PlayerProtocol>RTSP</PlayerProtocol>" +
		"<Video><VideoFormat>H264</VideoFormat><Width>640</Width><Height>480</Height></Video>" +
		"<Audio><AudioFormat>aac</AudioFormat></Audio>" +
		"</LiveVideoInfo>";
}

VideoService.prototype.getLiveVideoURL = function(camera, onSuccess, onFailure) {
	if (!this.netService.isInternetConnectionAvailable) {
		onFailure({ status: "Please connect to the Internet."});
		return;
	}

	this.selectVideoMode(camera,
		function() {
			this.requestRelayVideo(camera, onSuccess, onFailure);
		}.bind(this),
		function() {
			this.requestDirectVideo(camera, onSuccess, onFailure);
		}.bind(this),
		function(message) {
			onFailure({ status: message});
		} 
	);
};

VideoService.prototype.selectVideoMode = function(camera, onRelay, onDirect, onFailure) {
	var mode = this.prefsService.videoMode;
	switch (mode) {
		case this.prefsService.VIDEO_MODE_RELAY:
			onRelay();
			break;
		case this.prefsService.VIDEO_MODE_DIRECT:
			onDirect();
			break;
		case this.prefsService.VIDEO_MODE_AUTO:
			this.autoSelectVideoMode(camera, onRelay, onDirect, onFailure);
			break;
	}
};

VideoService.prototype.autoSelectVideoMode = function(camera, onRelay, onDirect, onFailure) {
	if (this.netService.ipExternal !== camera.ipExternal) {
		Mojo.Log.info("Auto video mode: relay (not same network)");
		onRelay();
	} else {
		Mojo.Log.info("Auto video mode: direct");
		onDirect();
	}
};

VideoService.prototype.requestDirectVideo = function(camera, onSuccess, onFailure) {
	Mojo.Log.info("Requesting live video directly from camera.");
	var url = "rtsp://" + camera.ip + "/LowResolutionVideo";
	onSuccess(url);
};

VideoService.prototype.requestRelayVideo = function(camera, onSuccess, onFailure) {
	Mojo.Log.info("Requesting live video via media server relay.");
	var url = this.getRelayVideoRequestURL(camera);

// TEMPORARY!
	Mojo.Log.warn("Relay video is disabled for now.");
	onFailure({ status: "Relay video is disabled for now"});

/*
	this.httpClient.post(url,
		null,
		this.liveVideoRequestData,
		false,
		// Success
		function(transport) {
			onSuccess(this.parseVideoURL(transport.responseText));
		}.bind(this),
		// Failure
		onFailure
	);
*/
};

VideoService.prototype.getRelayVideoRequestURL = function(camera) {
	var url = "camera.svc/" + camera.mac + "/LiveVideo";
	if (this.prefsService.useServerOverrides) {
		var mediaServer = this.prefsService.mediaServerOverride;
		if (mediaServer && mediaServer.length > 0) {
			url += "?server=" + mediaServer;
		}
	}
	return url;
};

VideoService.prototype.parseVideoURL = function(xml) {
	var xmlDoc = (new DOMParser()).parseFromString(xml, "application/xml");
	var url = xmlDoc.getElementsByTagName("StreamUri")[0].childNodes[0].nodeValue;
	Mojo.Log.info("Video URL: %s", url);
	return url;
};
