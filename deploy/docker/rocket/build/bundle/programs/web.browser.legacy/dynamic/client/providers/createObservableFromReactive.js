function module(r,n,e){var t,o;e.link("@babel/runtime/helpers/toConsumableArray",{default:function(r){t=r}},0),e.export({createObservableFromReactive:function(){return a}}),e.link("meteor/tracker",{Tracker:function(r){o=r}},0);var a=function(r){return function(){for(var n=arguments.length,e=new Array(n),a=0;a<n;a++)e[a]=arguments[a];var u=e.slice(0,-1),i=e.pop();if(!i)return o.nonreactive((function(){return r.apply(void 0,t(u))}));var c=o.autorun((function(){var n=r.apply(void 0,t(u));i(n)}));return function(){c.stop()}}}}
