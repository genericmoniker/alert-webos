function StageAssistant() {
}

var serviceLocator = null;

StageAssistant.prototype.setup = function() {
	
	// Global service locator
	serviceLocator = new ServiceLocator();
	
	this.controller.pushScene({name: "welcome", disableSceneScroller: true});
	this.controller.setWindowOrientation("free");
};