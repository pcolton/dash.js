(function()
{
	var data = {};

	module.exports = function(method, model, success, error)
	{
		switch(method)
		{
			case 'read':
				if(model && model.id)
				{
					success(data[model.type + ':' + model.id]);
				}
				else
				{
					var type = model.type;
					if(model.model) type = model.model.prototype.type;

					var result = [];

					for(i in data)
					{
						if(i.indexOf(type) === 0) result.push(data[i]);
					}
					success(result);
				}
				break;

			case 'create':
				if(!model.id) model.id = model.attributes.id = guid();
				data[model.type + ":" + model.id] = model;
				success(model);
				break;

			default:
				console.log("Method " + method + " NOT implemented.");
				break;
		}
	}

	// guid generation functions, from backbone-localstorage.js.
	function S4() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};

	// guid generation functions, from backbone-localstorage.js.
	function guid() {
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};

})();

