// Dash.js v0.3.0
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
	var Dash = root.Dash = subclass(Backbone);

	// Current version of the library. Keep in sync with `package.json`.
	Dash.VERSION = '0.3.0';

	// Attached the subclas function to the root object for future use
	Dash.subclass = subclass;
	
	// Create the 'template' property to hold the ICANHAZ.JS object entry-point object.
	if(root.ich) 
	{
		Dash.template = subclass(root.ich);
	}

	// TODO: support multiple callbacks :-)
	Dash.ready = function(callback)
	{
		// If Dash is already ready, no need to save the callback, just fire it now
		if(Dash.ready.fired) 
		{
			callback();
		}
		else
		{
			if(!Dash.ready.callbacks) Dash.ready.callbacks = [];
			Dash.ready.callbacks.push(callback);
		}
	}

	// Adapted from backbone-localstorage.js.
	// The data link is represented by a single JS object.
	// Create it with a meaningful name, like the name you'd give a table.
	Dash.dashlink = function(name)
	{
		var _this = this;
		this.name = name;

		// Delayed init 
		Dash.ready(function() 
		{
			var store = Dash.io._dashlinkLoad(_this.name);
			_this.data = (store && JSON.parse(store)) || {};
		});
	}

	// Adapted from backbone-localstorage.js.
	_.extend(Dash.dashlink.prototype,
	{
		save: function()
		{
			//console.log("DASHLINK/SAVE: " + this.name + " = " + JSON.stringify(this.data));
			Dash.io._dashlinkSave(this.name, JSON.stringify(this.data));
		},

		create: function(model)
		{
			if(!model.id) model.id = model.attributes.id = guid();
			this.data[model.id] = model;
			this.save();

			//console.log("DASHLINK/CREATE: " + this.name + " , model: " + model.id);

			return model;
		},
	
		update: function(model)
		{
			this.data[model.id] = model;
			this.save();

			// console.log("DASHLINK/UPDATE: " + this.name + " , model: " + model.id);

			return model;
		},

		find: function(model)
		{
			// console.log("DASHLINK/FIND: " + this.name + " , model: " + model.id);
			return this.data[model.id];
		},

		findAll: function()
		{
			// console.log("DASHLINK/FINDALL: " + this.name);
			return _.values(this.data);
		},

		destroy: function(model)
		{
			// console.log("DASHLINK/DELETE: " + this.name + " , model: " + model.id);
			delete this.data[model.id];
			this.save();
			return model;
		}
	});

	// Adapted from backbone-localstorage.js.
	// Override Backbone.sync to use delegate to the model or collection's 
	// dashlink property, which should be an instance of Dash.dashlink.
	Dash.__super__.sync = function(method, model, success, error)
	{
		var resp;
		var link = model.dashlink || model.collection.dashlink;

		switch (method)
		{
			case "read":    resp = model.id ? link.find(model) : link.findAll(); break;
			case "create":  resp = link.create(model);                            break;
			case "update":  resp = link.update(model);                            break;
			case "delete":  resp = link.destroy(model);                           break;
		}

		if (resp)
		{
			success(resp);
		}
		else
		{
			error("Record not found");
		}
	}

	// Setup the Dash.io object and load remote templates
	var createDashIO = function()
	{
		// Assign the nowjs object to the Dash.io property.
		Dash.io = root.now;

		if(console) console.log("Dash.js: Dash.io created.");
	
		// If templating is loaded, then load remote templates.
		if(Dash.template && !Dash.template.loaded)
		{
			// Get the remote templates, if any.
			Dash.io._getTemplates(function(data)
			{
				// Map each remote template
				_.each(data, function(template, name)
				{
					Dash.template.addTemplate(name, template);
				});
	
				Dash.template.loaded = true;
				
				// Fire callback that we're ready (all remote templates loaded).
				fireReadyCallbacks();
			});
		}
		else
		{
			fireReadyCallbacks();
		}
	}

	var fireReadyCallbacks = function()
	{
		if(Dash.ready.callbacks)
		{
			for(var i=0; i<Dash.ready.callbacks.length; i++)
			{
				var callback = Dash.ready.callbacks[i];
				callback();
			}
		}

		Dash.ready.fired = true;
	}

	// There are situations where the nowjs 'now' object may get
	// recreated, this function intercepts that call and rebinds Dash.io.
	var configureDashIO = function()
	{
		// Make sure NowJS is loaded.
		if(root.now && root.nowLib)
		{
			// Get a reference to the current version of oldNowJSReady.
			var oldNowJSReady = root.nowLib.nowJSReady;
	
			// Create a new version of oldNowJSReady that calls the old and then recreates
			// and relinks the Dash.io property.
			root.nowLib.nowJSReady = function()
			{
				// Call the current nowJSReady function in NowJS
				oldNowJSReady();
				
				// Create a new Dash.io property (bound to the new NowJS).
				createDashIO();
			}

			// The first time this function is called, go ahead and create Dash.io
			createDashIO();
		}
	}

	// From backbone-localstorage.js.
	// Generate four random hex digits.
	function S4()
	{
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};

	// From backbone-localstorage.js.
	// Generate a pseudo-GUID by concatenating random hexadecimal.
	function guid()
	{
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};

	// Dynamically load the NowjS script.
	$.getScript("/nowjs/now.js", function() 
	{ 	
		if(console) { console.log("Dash.js: nowjs loaded"); }

		now.ready(function()
		{
			if(!Dash.io) 
			{
				configureDashIO();
			}
		});
	});

})();

