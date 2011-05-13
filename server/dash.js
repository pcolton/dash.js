// Dash.js v0.3.2
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com

(function()
{
	var	fs			= require("fs"),
		connect		= require("connect"),
		nowjs		= require("now"),
		backbone	= require("backbone");

	var _templatesPath = "templates";
	var _httpServer;
	var _templates;
	var _templatesExtension = {};
	var _onDashlinkCallback = [];

	var root = module.exports = Dash = _subclass(backbone);

	//underscore.extend(Dash, backbone);

	// Version number.
	Dash.version = "0.3.2";

	Dash.name2 = 'colton';

	// Create a reference to the connect module.
	Dash.connect = connect;

	Dash.initialize = function(options)
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

		console.log(root.Model);
	}

	Dash.listen = function(port)
	{
		var _port = parseInt(port, 10);

		if(_httpServer) 
		{
			_httpServer.listen(_port);
			console.log("Dash.js v" + this.version + " listening on port " + _port);
		}
	}

	Dash.getServer = function()
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

		// Function to create a subclass from a base class and provide
	// access to that base class via a __super__ property
	function _subclass(base)
	{
		// Empty object for creating new class
		var ctor = function(){};
		
		// Attached the base class to the new object
		ctor.prototype = base;
		
		// Create the new child class
		var child = new ctor();
	
		// Save the base class so we can access it from the subclass
		child.__super__ = base;
		
		return child;
	}


})();


