
function LoginAssistant(args) {
}

LoginAssistant.prototype.setup = function() {
	this.controller.setupWidget("username-field",
		this.usernameAttributes = {
			textCase: Mojo.Widget.steModeLowerCase,
			changeOnKeyPress: true
		},
		this.usernameModel = {
			value: ""
	});
	this.usernameField = this.controller.get("username-field");
	this.usernameChangeHandler = this.handleUsernameChange.bind(this);
	Mojo.Event.listen(this.usernameField, Mojo.Event.propertyChange, this.usernameChangeHandler);

	this.controller.setupWidget("password-field",
		this.passwordAttributes = {
			changeOnKeyPress: true
		},
		this.passwordModel = {
			value: ""
	});
	this.passwordField = this.controller.get("password-field");
	this.passwordChangeHandler = this.handlePasswordChange.bind(this);
	Mojo.Event.listen(this.passwordField, Mojo.Event.propertyChange, this.passwordChangeHandler);

	this.controller.setupWidget("login-button",
		this.loginButtonAttributes = {
			type: Mojo.Widget.activityButton
		},
		this.loginButtonModel = {
			label: "Login",
			disabled: true
	});
	this.loginButton = this.controller.get("login-button");
	this.loginHandler = this.handleLogin.bind(this);
	Mojo.Event.listen(this.loginButton, Mojo.Event.tap, this.loginHandler);
};

LoginAssistant.prototype.cleanup = function() {
};

LoginAssistant.prototype.handleUsernameChange = function(event) {
	this.enableLogin();
};

LoginAssistant.prototype.handlePasswordChange = function(event) {
	this.enableLogin();
};

LoginAssistant.prototype.handleLogin = function() {
	this.hideError();
	this.loginButton.mojo.activate();
	this.loginButtonModel.label = "Logging In...";
	this.loginButtonModel.disabled = true;
	this.controller.modelChanged(this.loginButtonModel);

	serviceLocator.authService.authenticate(this.usernameModel.value, this.passwordModel.value,
		function() {
			this.loginButton.mojo.deactivate();
			this.controller.stageController.pushScene("main");
		}.bind(this),

		function(response) {
			this.loginButton.mojo.deactivate();
			this.loginButtonModel.label = "Login";
			this.loginButtonModel.disabled = false;
			this.controller.modelChanged(this.loginButtonModel);
			if (response.status === 401) {
				this.showError("E-mail Address or Password invalid. Try again.");
			} else {
				this.showError("Error while attempting login. (" + response.status + ") " + 
					response.statusText);
			}
		}.bind(this));
};

LoginAssistant.prototype.enableLogin = function() {
	var enabled = (this.usernameModel.value.length > 0 && this.passwordModel.value.length > 0);
	this.loginButtonModel.disabled = !enabled;
	this.controller.modelChanged(this.loginButtonModel);
	return enabled;
};

LoginAssistant.prototype.showError = function(message) {
	this.controller.get('error-message-block').show();
	this.controller.get('error-message-block').setStyle({visibility:'visible'});
	this.controller.get('error-message').innerText = message;
};

LoginAssistant.prototype.hideError = function() {
	this.controller.get('error-message-block').setStyle({visibility:'hidden'});
};
