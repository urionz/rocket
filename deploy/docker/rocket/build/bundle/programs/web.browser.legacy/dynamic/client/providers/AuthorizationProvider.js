function module(n,e,i){var t,o,r,a,s,u,c,l;i.export({AuthorizationProvider:function(){return f}}),i.link("react",{default:function(n){t=n}},0),i.link("meteor/meteor",{Meteor:function(n){o=n}},1),i.link("../../app/authorization/client/hasPermission",{hasPermission:function(n){r=n},hasAtLeastOnePermission:function(n){a=n},hasAllPermission:function(n){s=n}},2),i.link("../contexts/AuthorizationContext",{AuthorizationContext:function(n){u=n}},3),i.link("../../app/authorization/client",{hasRole:function(n){c=n}},4),i.link("./createObservableFromReactive",{createObservableFromReactive:function(n){l=n}},5);var h={hasPermission:l(r),hasAtLeastOnePermission:l(a),hasAllPermission:l(s),hasRole:l((function(n){return c(o.userId(),n)}))};function f(n){var e=n.children;return t.createElement(u.Provider,{children:e,value:h})}}

