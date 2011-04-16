function CameraAssistant(args) {
	this.camera = args;
}

CameraAssistant.prototype.setup = function() {
	$("title").innerText = this.camera.name;
	$("snapshot-img").src = this.camera.snapshotURL;

	this.controller.setupWidget("busy-spinner",
		this.busySpinnerAttributes = { 
			spinnerSize: "large" 
		},
		this.busySpinnerModel = { 
			spinning: false 
		}
	);

	// DOM only button (no widget here)
	this.playButton = this.controller.get("play-button");
	this.playButtonHandler = this.handlePlayTap.bind(this);
	Mojo.Event.listen(this.playButton, Mojo.Event.tap, this.playButtonHandler);

};

CameraAssistant.prototype.cleanup = function() {
	Mojo.Event.stopListening(this.playButton, Mojo.Event.tap, this.playButtonHandler);
};

CameraAssistant.prototype.busyBegin = function() {
	if (this.busyRefCount++ === 0) {
		$("busy-scrim").show();
		if (!this.busySpinnerModel.spinning) {
			this.busySpinnerModel.spinning = true;
			this.controller.modelChanged(this.busySpinnerModel);
		}
	}
};

CameraAssistant.prototype.busyEnd = function() {
	if (this.busyRefCount === 0) { return; }
	if (--this.busyRefCount === 0) {
		$("busy-scrim").hide();
		this.busySpinnerModel.spinning = false;
		this.controller.modelChanged(this.busySpinnerModel);
	}
};

CameraAssistant.prototype.handlePlayTap = function(event) {
	this.requestVideo();
};

CameraAssistant.prototype.requestVideo = function() {
	this.busyBegin();
	serviceLocator.videoService.getLiveVideoURL(this.camera,
		// Success
		function(url) {
			this.busyEnd();
			this.playVideo(url);
		}.bind(this),

		// Failure
		function(transport) {
			this.busyEnd();
			showError(this.controller, 
				"Unable to start playing video (" + transport.status + ")");
		}.bind(this)
	);
};

CameraAssistant.prototype.playVideo = function(url) {
	this.controller.stageController.pushScene("media", url);
};
