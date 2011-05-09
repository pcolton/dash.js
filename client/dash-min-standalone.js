// Dashnode.js v0.2.0
// (c) 2011 Paul Colton
// See LICENSE file for licensing information or
// visit http://githib.com/pcolton/dash.js
(function(){var b=this,c=function(a){var b=function(){};b.prototype=a;b=new b;b.__super__=a;return b},a=b.Dashnode=c(Backbone);a.VERSION="0.2.0";a.subclass=c;if(b.ich)a.template=c(b.ich);a.ready=function(b){a.ready.callback=b};var d=function(){console&&console.log("Dashnode.io created.");a.io=b.now;a.template&&!a.template.loaded?a.io._getTemplates(function(b){_.each(b,function(b,c){a.template.addTemplate(c,b)});a.template.loaded=!0;a.ready.callback&&a.ready.callback()}):a.ready.callback&&a.ready.callback()},
e=function(){if(b.now&&b.nowLib){var a=b.nowLib.nowJSReady;b.nowLib.nowJSReady=function(){a();d()};d()}};$.getScript("/nowjs/now.js",function(){console&&console.log("loaded nowjs");now.ready(function(){a.io||e()})})})();
