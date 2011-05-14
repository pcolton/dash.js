(function()
{
    var path	= require('path'),
    	//dirty	= require('node-dirty')(path.join(settings.files, 'app.db')),
    	dirty	= require('dirty')('/Users/pcolton/Dropbox/Development/Consulting/Noosh/Dev/app/server/dirty.db'),
    	loaded	= false;

	module.exports = function(method, model, success, error)
	{
		var sync = function(method, model, success, error)
		{
			console.log('in dirty sync');

			switch (method) {
			case 'read':
				if (model.id) {
					var data = dirty.get(model.type + ':' + model.id);
					if (data) {
						success(data);
					} else {
						error('Model not found.');
					}
				} else {
					var data = [];
					var type = model.type;
					if (model.model) {
						type = model.model.prototype.type;
					}
					dirty.forEach(function(key, val) {
						if (type === key.split(':')[0] && val && data.indexOf(val) === -1) {
							data.push(val);
						}
					});
					success(data);
				}
				break;
			case 'create':
			case 'update':
				if(!model.id) model.id = model.attributes.id = guid();
				dirty.set(
					model.type + ':' + model.id,
					model.toJSON(),
					function(err, model) {
						return err ? error(err) : success(model);
					}
				);
				break;
			case 'delete':
				dirty.rm(
					model.type + ':' + model.id,
					function(err, model) {
						return err ? error(err) : success(model);
					}
				);
				break;
			}
		};

		// The inner `sync()` function allows the actual operation to be deferred
		// until the database has been fully loaded.
		if (loaded) {
			sync(method, model, success, error);
		} else {
			dirty.on('load', function() {
				sync(method, model, success, error);
			});
		}

		// guid generation functions, from backbone-localstorage.js.
		function S4() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};

		// guid generation functions, from backbone-localstorage.js.
		function guid() {
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		};

	}

	// Set a loaded flag to indicate whether `Backbone.sync()` can begin accessing
	// the db immediately or must wait until the `load` event is emitted.
	dirty.on('load', function()
	{
		loaded = true;
	});

})();

