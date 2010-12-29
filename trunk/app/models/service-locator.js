
function ServiceLocator() {

	// Create services
	this.httpClient = new HTTPClient();
	this.authService = new AuthService();
	this.localStorage = new LocalStorage();
	this.siteService = new SiteService();
	this.videoService = new VideoService();

	// Resolve dependencies
	this.authService.httpClient = this.httpClient;
	this.authService.localStorage = this.localStorage;
	this.siteService.httpClient = this.httpClient;
	this.videoService.httpClient = this.httpClient;
}

