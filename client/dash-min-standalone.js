// Dash.js v0.3.1
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or 
// visit http://dashjs.com
(function(){function f(a){var b=function(){};b.prototype=a;b=new b;b.__super__=a;return b}var d=this,a=d.Dash=f(Backbone);a.subclass=f;a.VERSION="0.3.1";if(d.ich)a.template=f(d.ich);a.ready=function(c){if(a.ready.fired)c();else{if(!a.ready.callbacks)a.ready.callbacks=[];a.ready.callbacks.push(c)}};a.__super__.sync=function(c,b,d,f){var e;switch(c){case "read":case "delete":e=b.type;if(b.model)e=b.model.prototype.type;e=e+":"+(b.id?b.id:"*");break;case "create":case "update":e=JSON.stringify(b.toJSON())}a.io._dashlink(c,
e,function(a){a?d(a):f("Record not found")})};var h=function(){a.io=d.now;console&&console.log("Dash.js: Dash.io system created.");a.template&&!a.template.loaded?a.io._getTemplates(function(c){_.each(c,function(b,c){a.template.addTemplate(c,b)});a.template.loaded=!0;console&&console.log("Dash.js: template system created.");g()}):g()},g=function(){if(a.ready.callbacks)for(var c=0;c<a.ready.callbacks.length;c++)(0,a.ready.callbacks[c])();a.ready.fired=!0},i=function(){if(d.now&&d.nowLib){var a=d.nowLib.nowJSReady;
d.nowLib.nowJSReady=function(){a();h()};h()}};$.getScript("/nowjs/now.js",function(){console&&console.log("Dash.js: nowjs system created.");now.ready(function(){a.io||i()})})})();
