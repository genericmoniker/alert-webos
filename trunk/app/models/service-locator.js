
function ServiceLocator() {

	// Create services
	this.httpClient = new HTTPClient();
	this.authService = new AuthService();
	this.localStorage = new LocalStorage();
	this.siteService = new SiteService();
	this.videoService = new VideoService();
	this.prefsService = new PrefsService();

	// Resolve dependencies
	this.authService.httpClient = this.httpClient;
	this.authService.localStorage = this.localStorage;
	this.siteService.httpClient = this.httpClient;
	this.videoService.httpClient = this.httpClient;
	this.videoService.prefsService = this.prefsService;
	this.prefsService.localStorage = this.localStorage;
	this.httpClient.prefsService = this.prefsService;
	
	// Other setup
	this.prefsService.load();
}

