
function ServiceLocator() {

	// Create services
	this.httpClient = new HTTPClient();
	this.authService = new AuthService();
	this.localStorage = new LocalStorage();
	this.siteService = new SiteService();

	// Resolve dependencies
	this.authService.httpClient = this.httpClient;
	this.authService.localStorage = this.localStorage;
	this.siteService.httpClient = this.httpClient;
}

