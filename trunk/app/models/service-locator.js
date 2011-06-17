
function ServiceLocator() {

	// Create services
	this.httpClient = new HTTPClient();
	this.authService = new AuthService();
	this.localStorage = new LocalStorage();
	this.prefsService = new PrefsService();
	this.siteService = siteServiceCtor({ httpClient: this.httpClient, prefsService: this.prefsService });   //new SiteService();
	this.videoService = new VideoService();
	this.netService = new NetService();

	// Resolve dependencies
	this.authService.httpClient = this.httpClient;
	this.authService.localStorage = this.localStorage;
	this.siteService.httpClient = this.httpClient;
	this.siteService.prefsService = this.prefsService;
	this.videoService.httpClient = this.httpClient;
	this.videoService.prefsService = this.prefsService;
	this.videoService.netService = this.netService;
	this.prefsService.localStorage = this.localStorage;
	this.httpClient.prefsService = this.prefsService;
	this.netService.httpClient = this.httpClient;
	
	// Other setup
	this.prefsService.load();
}

