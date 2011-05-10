// Dash.js v0.3.0
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com
(function(){function c(){return((1+Math.random())*65536|0).toString(16).substring(1)}var d=this,g=function(b){var a=function(){};a.prototype=b;a=new a;a.__super__=b;return a},a=d.Dash=g(Backbone);a.VERSION="0.3.0";a.subclass=g;if(d.ich)a.template=g(d.ich);a.ready=function(b){a.ready.callback=b};a.dashlink=function(b){this.name=b;this.ready=!1};_.extend(a.dashlink.prototype,{init:function(){var b=a.io._dashlinkLoad(this.name);this.data=b&&JSON.parse(b)||{};this.ready=!0;console.log("init ready")},
save:function(){a.io._dashlinkSave(this.name,JSON.stringify(this.data))},create:function(b){if(!b.id)b.id=b.attributes.id=c()+c()+"-"+c()+"-"+c()+"-"+c()+"-"+c()+c()+c();this.data[b.id]=b;this.save();return b},update:function(b){this.data[b.id]=b;this.save();return b},find:function(b){return this.data[b.id]},findAll:function(){return _.values(this.data)},destroy:function(b){delete this.data[b.id];this.save();return b}});a.__super__.sync=function(b,a,c,d){var f,e=a.dashlink||a.collection.dashlink;
e&&!e.ready&&e.init();switch(b){case "read":f=a.id?e.find(a):e.findAll();break;case "create":f=e.create(a);break;case "update":f=e.update(a);break;case "delete":f=e.destroy(a)}f?c(f):d("Record not found")};var h=function(){console&&console.log("Dash.io created.");a.io=d.now;a.template&&!a.template.loaded?a.io._getTemplates(function(b){_.each(b,function(b,c){a.template.addTemplate(c,b)});a.template.loaded=!0;a.ready.callback&&a.ready.callback()}):a.ready.callback&&a.ready.callback()},i=function(){if(d.now&&
d.nowLib){var a=d.nowLib.nowJSReady;d.nowLib.nowJSReady=function(){a();h()};h()}};$.getScript("/nowjs/now.js",function(){console&&console.log("loaded nowjs");now.ready(function(){a.io||i()})})})();
