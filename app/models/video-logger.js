function VideoLogger() {
	this.video = null;
	this.events = [ 
		"loadstart", "progress", "suspend", "abort", "error", "emptied",
		"stalled", "play", "pause", "loadedmetadata", "loadeddata",
		"waiting", "playing", "canplay", "canplaythrough", "seeking",
		"seeked", /*"timeupdate"*/, "ended", "ratechange", "durationchange",
		"volumechange"
		];
}

VideoLogger.prototype.start = function(videoElement) {
	this.video = videoElement;

	this.eventHandler = this.handleEvent.bind(this);
	for (var i = 0; i < this.events.length; ++i) {
		this.video.addEventListener(this.events[i], this.eventHandler, true);
	}
};

VideoLogger.prototype.stop = function() {
	for (var i = 0; i < this.events.length; ++i) {
		this.video.removeEventListener(this.events[i], this.eventHandler);
	}
};

VideoLogger.prototype.handleEvent = function(ev) {
	// We need to use error for the log statement to show from a device.
	Mojo.Log.error("[Video] " + ev.type);
};