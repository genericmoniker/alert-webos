
function VideoService() {
	this.httpClient = null;
}

VideoService.prototype.getLiveVideoURL = function(camera, onSuccess, onFailure) {
/*
	var url = this.httpClient.baseURL + "livestream.svc/sources/" +
		camera.mac + "?user=default&vformat=h264&pformat=rtsp&" +
		"vwidth=640&vheight=480&aformat=aac&_auth=" +
		this.httpClient.authToken;
	Mojo.Log.info("Live video URL: " + url);
	onSuccess(url);
*/
	try {
		this.httpClient.post("camera.svc/" + camera.mac + "/LiveVideo",
			null,
			"<LiveVideoInfo><PlayerProtocol>RTSP</PlayerProtocol><Video><VideoFormat>H264</VideoFormat></Video></LiveVideoInfo>",
			false,
			// Success
			function(transport) {
				onSuccess(this.parseVideoURL(transport.responseText));
			}.bind(this),
			// Failure
			onFailure
		);
	} catch (ex) {
		Mojo.Log.logException(ex);
	}

};

VideoService.prototype.parseVideoURL = function(xml) {
	var xmlDoc = (new DOMParser()).parseFromString(xml, "application/xml");
	var url = xmlDoc.getElementsByTagName("StreamUri")[0].childNodes[0].nodeValue;
	Mojo.Log.info("Video URL: %s", url);
	return url;
};
