// Dash.js v0.2.0
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com

(function()
{
	var root = this;

	// Function to create a subclass from a base class and provide
	// access to that base class via a __super__ property
	var subclass = function(base)
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
	
	// Init main object and inherit from Backbone
	var Dashnode = root.Dashnode = subclass(Backbone);

	// Current version of the library. Keep in sync with `package.json`.
	Dashnode.VERSION = '0.2.0';

	// Attached the subclas function to the root object for future use
	Dashnode.subclass = subclass;
	
	// Create the 'template' property to hold the ICANHAZ.JS object entry-point object.
	if(root.ich) 
	{
		Dashnode.template = subclass(root.ich);
	}

	// TODO: support multiple callbacks :-)
	Dashnode.ready = function(callback)
	{
		Dashnode.ready.callback = callback;
	}

	// Because NowJS essentially deletes and recreates the now object,
	// we need to re-subclass it and move over any properties and functions
	// whenever this happens. Hopefully this will change in the future in NowJS.
	var createDashnodeIO = function()
	{
		if(console) console.log("Dashnode.io created.");

		// Assign the nowjs object to the Dashnode.io property.
		Dashnode.io = root.now;
	
		// If templating is loaded, then load remote templates.
		if(Dashnode.template && !Dashnode.template.loaded)
		{
			// Get the remote templates, if any.
			Dashnode.io._getTemplates(function(data)
			{
				// Map each remote template
				_.each(data, function(template, name)
				{
					Dashnode.template.addTemplate(name, template);
				});
	
				Dashnode.template.loaded = true;
				
				// Fire callback that we're ready (all remote templates loaded).
				if(Dashnode.ready.callback) Dashnode.ready.callback();
			});
		}
		else
		{
			if(Dashnode.ready.callback) Dashnode.ready.callback();
		}
	}

	var configureDashnodeIO = function()
	{
		// Make sure NowJS is loaded.
		if(root.now && root.nowLib)
		{
			// Get a reference to the current version of oldNowJSReady.
			var oldNowJSReady = root.nowLib.nowJSReady;
	
			// Create a new version of oldNowJSReady that calls the old and then recreates
			// and relinks the Dashnode.io property.
			root.nowLib.nowJSReady = function()
			{
				// Call the current nowJSReady function in NowJS
				oldNowJSReady();
				
				// Create a new Dashnode.io property (bound to the new NowJS).
				createDashnodeIO();
			}

			// The first time this function is called, go ahead and create Dashnode.io
			createDashnodeIO();
		}
	}
	
	// Dynamically load the NowjS script if available
	$.getScript("/nowjs/now.js", function() 
	{ 	
		if(console) { console.log("loaded nowjs"); }

		now.ready(function()
		{
			if(!Dashnode.io) 
			{
				configureDashnodeIO();
			}
		});
	});

})();

