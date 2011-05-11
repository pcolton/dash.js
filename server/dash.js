// Dash.js v0.3.1
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com

var	fs	= require("fs"),
	connect	= require("connect"),
	nowjs	= require("now");

module.exports = new function()
{
	var root = this;

	var _templatesPath = "templates";
	var _httpServer;
	var _templates;
	var _templatesExtension = {};
	var _onDashlinkCallback = [];

	// Version number.
	this.version = "0.3.1";

	// Create a reference to the connect module.
	this.connect = connect;

	this.initialize = function(options)
	{
		if(options && options.templatesPath)
		{
			_templatesPath = options.templatesPath;
		}

		_httpServer = connect.createServer();
		_templates = _loadTemplates(_templatesPath);

		root.io = nowjs.initialize(_httpServer);

		root.io.dashlink = _onDashlink;

		root.io.now._getTemplates = _getTemplates;
		root.io.now._dashlink = _dashlink;
	}

	this.listen = function(port)
	{
		var _port = parseInt(port, 10);

		if(_httpServer) 
		{
			_httpServer.listen(_port);
			console.log("Dash.js v" + this.version + " listening on port " + _port);
		}
	}

	this.getServer = function()
	{
		return _httpServer;
	}

	// Private functions.

	var _onDashlink = function(callback)
	{
		_onDashlinkCallback.push(callback);	
	}

	var _dashlink = function(method, data, callback)
	{
		for(var i=0; i<_onDashlinkCallback.length; i++)
		{
			var eventCallback = _onDashlinkCallback[i];
			eventCallback(method, data, callback);
		}
	}

	var _onUserConnected = function()
	{
		for(var i=0; i<_onUserConnectedCallback.length; i++)
		{
			var callback = _onUserConnectedCallback[i];
			callback(this.now);
		}
	}

	var _onUserDisconnected = function()
	{
		for(var i=0; i<_onUserDisconnectedCallback.length; i++)
		{
			var callback = _onUserDisconnectedCallback[i];
			callback(this.now);
		}
	}

	var _getTemplates = function(callback)
	{
		callback(_templates);
	}

	var _loadTemplates = function(path)
	{
		var _templatesExtension = _makeSuffixRegExp(".html");
		var results = {};
		var files = fs.readdirSync(path);
	
		for(f in files)
		{
			var filename = files[f];

			if(_templatesExtension.test(filename))
			{
				var data = fs.readFileSync(path + '/' + filename, "utf8");
				var templateName = filename.substring(0, filename.indexOf('.'));
				results[templateName] = data;
				console.log("Loaded template: '" + templateName + 
					"' from '" + path + '/' + filename + "'");
			}
		}
	
		return results;
	}

	var _makeSuffixRegExp = function(suffix, caseInsensitive)
	{
	  return new RegExp(
		  String(suffix).replace(/[$%()*+.?\[\\\]{|}]/g, "\\$&") + "$",
		  caseInsensitive ? "i" : "");
	}
}
