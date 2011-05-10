// Dash.js v0.3.0
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com

var	fs		= require("fs"),
	connect	= require("connect"),
	nowjs	= require("now");

module.exports = new function()
{
	var _templatesPath = "templates";
	var _httpServer;
	var _templates;
	var _templatesExtension = {};
	var _onUserConnectedCallback = undefined;
	var _onUserDisconnectedCallback = undefined;
	var _onDashlinkLoadCallback = undefined;
	var _onDashlinkSaveCallback = undefined;

	this.version = "0.3.0";

	// Create a reference to the connect module.
	this.connect = connect;

	var root = this;

	this.initialize = function(options)
	{
		if(options && options.templatesPath)
		{
			_templatesPath = options.templatesPath;
		}

		_httpServer = connect.createServer();
		_templates = _loadTemplates(_templatesPath);

		root.io = nowjs.initialize(_httpServer);
		root.io.connected(_onUserConnected);
		root.io.disconnected(_onUserDisconnected);

		root.io.now._getTemplates = _getTemplates;
		root.io.now._dashlinkLoad = _dashlinkLoad;
		root.io.now._dashlinkSave = _dashlinkSave;
	}

	this.listen = function(port)
	{
		var _port = parseInt(port, 10);

		if(_httpServer) 
		{
			_httpServer.listen(_port);
			console.log("Dash v" + this.version + " listening on port " + _port);
		}
	}

	this.getServer = function()
	{
		return _httpServer;
	}

	this.onUserConnected = function(callback)
	{
		_onUserConnectedCallback = callback;
	}

	this.onUserDisconnected = function(callback)
	{
		_onUserDisconnectedCallback = callback;
	}

	this.onDashlinkLoad = function(callback)
	{
		_onDashlinkLoadCallback = callback;	
	}

	this.onDashlinkSave = function(callback)
	{
		_onDashlinkSaveCallback = callback;	
	}

	// Private functions.

	var _dashlinkLoad = function(name, data)
	{
		if(_onDashlinkLoadCallback) _onDashlinkLoadCallback(name, data);
	}

	var _dashlinkSave = function(name, data)
	{
		if(_onDashlinkSaveCallback) _onDashlinkSaveCallback(name, data);
	}

	var _onUserConnected = function()
	{
		// TODO: allow multiple callbacks
		if(_onUserConnectedCallback) _onUserConnectedCallback(this.now);
	}

	var _onUserDisconnected = function()
	{
		// TODO: allow multiple callbacks
		if(_onUserDisconnectedCallback) _onUserDisconnectedCallback(this.now);
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
