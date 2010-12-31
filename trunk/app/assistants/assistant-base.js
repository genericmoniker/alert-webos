function AssistantBase() {
}

AssistantBase.prototype.showError = function(errorMessage, retry) {
	// TODO: retry
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title: "Error",
		message: errorMessage,
		choices: [
			{ label: $L("OK"), value: "" }
			]
	});
};
