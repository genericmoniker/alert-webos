
function VideoService() {
	this.httpClient = null;
	this.prefsService = null;
	this.liveVideoRequestData = "<LiveVideoInfo>" + 
		"<PlayerProtocol>RTSP</PlayerProtocol>" +
		"<Video><VideoFormat>H264</VideoFormat><Width>640</Width><Height>480</Height></Video>" +
		"<Audio><AudioFormat>aac</AudioFormat></Audio>" +
		"</LiveVideoInfo>";
}

VideoService.prototype.getLiveVideoURL = function(camera, onSuccess, onFailure) {
	if (this.shouldRelayVideo()) {
		this.requestRelayVideo(camera, onSuccess, onFailure);
	} else {
		this.requestDirectVideo(camera, onSuccess, onFailure);
	}
};

VideoService.prototype.shouldRelayVideo = function() {
	var mode = this.prefsService.videoMode;
	if (mode === this.prefsService.VIDEO_MODE_RELAY) {
		return true;
	}
	// TODO: Handle 'Auto' mode.
	return false;
};

VideoService.prototype.requestDirectVideo = function(camera, onSuccess, onFailure) {
	Mojo.Log.info("Requesting live video directly from camera.");
	var url = "rtsp://" + camera.ip + "/LowResolutionVideo";
	onSuccess(url);
};

VideoService.prototype.requestRelayVideo = function(camera, onSuccess, onFailure) {
	Mojo.Log.info("Requesting live video via media server relay.");
	var url = this.getRelayVideoRequestURL();
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
};

VideoService.prototype.getRelayVideoRequestURL = function() {
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
