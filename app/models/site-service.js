
function SiteService() {
	this.httpClient = null;
	this.sites = null;
}

SiteService.prototype.loadSites = function(onSuccess, onFailure) {
	this.httpClient.get("site.svc/?cameras=all&user=default", null, false,
		// Success
		function(response) {
			this.sites = this.parseSites(response.responseText);
			onSuccess(this.sites);
		}.bind(this),
		
		// Failure
		onFailure);
};

SiteService.prototype.parseSites = function(xml) {
	var xmlDoc = (new DOMParser()).parseFromString(xml, "application/xml");
	var result = [];
	var sites = xmlDoc.getElementsByTagName("SiteInfo");
	for (var s = 0; s < sites.length; ++s) {
		var site = {
			name: sites[s].getElementsByTagName("SiteName")[0].textContent.trim(),
			id: sites[s].getElementsByTagName("SiteId")[0].textContent.trim()
		};
		var cameras = sites[s].getElementsByTagName("CameraInfo");
		site.cameras = [];
		for (var c = 0; c < cameras.length; ++c) {
			site.cameras.push({
				mac: cameras[c].getElementsByTagName("Mac")[0].textContent.trim(),
				name: cameras[c].getElementsByTagName("Name")[0].textContent.trim(),
				isOnline: cameras[c].getElementsByTagName("IsOnline")[0].textContent.trim(),
				siteName: cameras[c].getElementsByTagName("SiteName")[0].textContent.trim()
			});
		}
		result.push(site);
	}
	return result;
};