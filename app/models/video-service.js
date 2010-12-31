
function VideoService() {
	this.httpClient = null;
	this.liveVideoRequestData = "<LiveVideoInfo>" + 
		"<PlayerProtocol>RTSP</PlayerProtocol>" +
		"<Video><VideoFormat>H264</VideoFormat><Width>640</Width><Height>480</Height></Video>" +
		"<Audio><AudioFormat>aac</AudioFormat></Audio>" +
		"</LiveVideoInfo>";
}

VideoService.prototype.getLiveVideoURL = function(camera, onSuccess, onFailure) {
	try {
		this.httpClient.post("camera.svc/" + camera.mac + "/LiveVideo",
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
