function LocalStorage() {
}

LocalStorage.prototype.getValue = function(name) {
	var cookie = new Mojo.Model.Cookie(name);
	return cookie.get();
};

LocalStorage.prototype.setValue = function(name, value) {
	var cookie = new Mojo.Model.Cookie(name);
	cookie.put(value);
};

LocalStorage.prototype.remove = function(name) {
	var cookie = new Mojo.Model.Cookie(name);
	cookie.remove();
}