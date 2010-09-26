http = {}

http.createClient = function(port, hostname){
	return new http.Client(port, hostname)
}


http.Client = function(port, hostname){

	this.port = port;
	this.hostname = hostname;
	
}

http.Client.prototype.request = function(method, path, headers){	
	return new http.clientRequest(this.port, this.hostname, method, path, headers)
}


http.clientRequest = function(port, hostname, method, path, headers){
	this.xhr = new XMLHttpRequest();
	this.postdata = '';
	this.xhr.open(method, hostname + ':' + port + path, true);
	for(var i in headers){ //Object.keys later?
		this.xhr.setRequestHeader(i, headers[i])
	}
	var t = this;
  this.xhr.onreadystatechange = function(){
		if(t.response && t.xhr.readyState >= 3){
			t.response = null;
			t.response(new http.clientResponse(t.xhr))
		}
	}
	this.response = function(){}
}

http.clientRequest.prototype.on = function(event, callback){
	if(event == 'response'){
		this.response = callback;
	}
}

http.clientRequest.prototype.write = function(data){
	this.postdata += data;
}

http.clientRequest.prototype.end = function(data){
	this.write(data);
	this.xhr.send(this.postdata);
}

http.clientResponse = function(xhr){
	this.xhr = xhr;
	this.statusCode = xhr.status;
	this._end = function(){};
	this._data = function(){};
	//this.headers = xhr.headers;
	var headers = {};
	xhr.getAllResponseHeaders().split('\r\n').forEach(function(item){
		var hlen = item.split(':')[0].length;
		headers[item.substr(0,hlen).toLowerCase()] = item.substr(hlen+1);
	});
	this.headers = headers; //todo: test this
	var t = this;
	var len = 0;
	var interval = setInterval(function(){
		t.statusCode = xhr.status;
		if(xhr.readyState == 4)
			t._end();
		var xrl = xhr.responseText.length;
		if(xrl > len){
			t._data(xhr.responseText.substr(len));
			len = xrl;
		}
	},42);
}

http.clientResponse.prototype.on = function(event, callback){
	if(event == 'data'){
		this._data = callback;
	}else if(event == 'end'){
		this._end = callback;
	}
}