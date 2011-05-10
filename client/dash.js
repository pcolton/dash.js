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
		Dash.ready.callback = callback;
	}

	// Dashlink ties the client models to server calls
	Dash.dashlink = function(name)
	{
		this.name = name;
		this.ready = false;
	}

	_.extend(Dash.dashlink.prototype,
	{
		init: function()
		{
			var store = Dash.io._dashlinkLoad(this.name);
			this.data = (store && JSON.parse(store)) || {};
			this.ready = true;
		},

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

	// Bind our sync to the Backboke.sync function.
	Dash.__super__.sync = function(method, model, success, error)
	{
		var resp;
		var link = model.dashlink || model.collection.dashlink;

		// Support delayed initing
		if(link && !link.ready) link.init();

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

	// Because NowJS essentially deletes and recreates the now object,
	// we need to re-subclass it and move over any properties and functions
	// whenever this happens. Hopefully this will change in the future in NowJS.
	var createDashIO = function()
	{
		if(console) console.log("Dash.io created.");

		// Assign the nowjs object to the Dash.io property.
		Dash.io = root.now;
	
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
				if(Dash.ready.callback) Dash.ready.callback();
			});
		}
		else
		{
			if(Dash.ready.callback) Dash.ready.callback();
		}
	}

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

	function S4()
	{
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};

	function guid()
	{
	   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};

	// Dynamically load the NowjS script if available
	$.getScript("/nowjs/now.js", function() 
	{ 	
		if(console) { console.log("loaded nowjs"); }

		now.ready(function()
		{
			if(!Dash.io) 
			{
				configureDashIO();
			}
		});
	});

})();

