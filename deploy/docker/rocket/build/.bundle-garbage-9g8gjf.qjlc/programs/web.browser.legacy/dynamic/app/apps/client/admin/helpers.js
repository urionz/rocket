function module(n,e,t){var r,a,c,i,u,o,s,p,l,f,d;t.link("@babel/runtime/helpers/toConsumableArray",{default:function(n){r=n}},0),t.link("@babel/runtime/regenerator",{default:function(n){a=n}},1),t.export({handleAPIError:function(){return m},warnStatusChange:function(){return _},checkCloudLogin:function(){return h},promptSubscription:function(){return w},triggerAppPopoverMenu:function(){return y},appButtonProps:function(){return D},appStatusSpanProps:function(){return I},formatPrice:function(){return S},formatPricingPlan:function(){return C}}),t.link("@rocket.chat/apps-engine/definition/AppStatus",{AppStatus:function(n){c=n}},0),t.link("meteor/kadira:flow-router",{FlowRouter:function(n){i=n}},1),t.link("semver",{default:function(n){u=n}},2),t.link("toastr",{default:function(n){o=n}},3),t.link("../../../ui-utils/client",{modal:function(n){s=n},popover:function(n){p=n},call:function(n){l=n}},4),t.link("../../../utils/client",{t:function(n){f=n}},5),t.link("../orchestrator",{Apps:function(n){d=n}},6);var b=[c.AUTO_ENABLED,c.MANUALLY_ENABLED],x=[c.COMPILER_ERROR_DISABLED,c.ERROR_DISABLED,c.INVALID_SETTINGS_DISABLED,c.INVALID_LICENSE_DISABLED],m=function(n){console.error(n);var e=n.xhr&&n.xhr.responseJSON&&n.xhr.responseJSON.error||n.message;o.error(e)},_=function(n,e){x.includes(e)?o.error(f("App_status_"+e),n):o.info(f("App_status_"+e),n)},v=function(){s.open({title:f("Apps_Marketplace_Login_Required_Title"),text:f("Apps_Marketplace_Login_Required_Description"),type:"info",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:f("Login"),cancelButtonText:f("Cancel"),closeOnConfirm:!0,html:!1},(function(n){n&&i.go("cloud-config")}))},h=function(){function n(){var n;return a.async(function(){function e(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,a.awrap(l("cloud:checkUserLoggedIn"));case 3:return(n=e.sent)||v(),e.abrupt("return",n);case 8:return e.prev=8,e.t0=e.catch(0),m(e.t0),e.abrupt("return",!1);case 12:case"end":return e.stop()}}return e}(),null,null,[[0,8]])}return n}(),w=function(){function n(n,e,t){var r;return a.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:return r=null,c.prev=1,c.next=4,a.awrap(d.buildExternalUrl(n.id,n.purchaseType,!1));case 4:r=c.sent,c.next=12;break;case 7:return c.prev=7,c.t0=c.catch(1),m(c.t0),t(),c.abrupt("return");case 12:s.open({allowOutsideClick:!1,data:r,template:"iframeModal"},e,t);case 13:case"end":return c.stop()}}return c}(),null,null,[[1,7]])}return n}(),A=function(){function n(n){var e,t,r;return a.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:return e=n.id,t=n.purchaseType,c.next=3,a.awrap(h());case 3:if(c.sent){c.next=5;break}return c.abrupt("return");case 5:return r=null,c.prev=6,c.next=9,a.awrap(d.buildExternalUrl(e,t,!0));case 9:r=c.sent,c.next=16;break;case 12:return c.prev=12,c.t0=c.catch(6),m(c.t0),c.abrupt("return");case 16:return c.next=18,a.awrap(new Promise((function(n){s.open({allowOutsideClick:!1,data:r,template:"iframeModal"},n)})));case 18:case"end":return c.stop()}}return c}(),null,null,[[6,12]])}return n}(),k=function(){return new Promise((function(n){s.open({text:f("Apps_Marketplace_Deactivate_App_Prompt"),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:f("Yes"),cancelButtonText:f("No"),closeOnConfirm:!0,html:!1},n,(function(){return n(!1)}))}))},g=function(){return new Promise((function(n){s.open({text:f("Apps_Marketplace_Uninstall_App_Prompt"),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:f("Yes"),cancelButtonText:f("No"),closeOnConfirm:!0,html:!1},n,(function(){return n(!1)}))}))},B=function(){return new Promise((function(n){s.open({text:f("Apps_Marketplace_Uninstall_Subscribed_App_Prompt"),type:"info",showCancelButton:!0,confirmButtonText:f("Apps_Marketplace_Modify_App_Subscription"),cancelButtonText:f("Apps_Marketplace_Uninstall_Subscribed_App_Anyway"),cancelButtonColor:"#DD6B55",closeOnConfirm:!0,html:!1},n,(function(){return n(!1)}))}))},y=function(n,e,t){if(n){var c="subscription"===n.purchaseType,u=n.subscriptionInfo&&["active","trialing"].includes(n.subscriptionInfo.status),o=b.includes(n.status),s=function(){function e(){return a.async(function(){function e(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a.awrap(A(n));case 2:return e.prev=2,e.next=5,a.awrap(d.syncApp(n.id));case 5:e.next=10;break;case 7:e.prev=7,e.t0=e.catch(2),m(e.t0);case 10:case"end":return e.stop()}}return e}(),null,null,[[2,7]])}return e}(),l=function(){i.go("app-logs",{appId:n.id},{version:n.version})},x=function(){function e(){var e;return a.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,a.awrap(k());case 2:if(t.sent){t.next=4;break}return t.abrupt("return");case 4:return t.prev=4,t.next=7,a.awrap(d.disableApp(n.id));case 7:e=t.sent,_(n.name,e),t.next=14;break;case 11:t.prev=11,t.t0=t.catch(4),m(t.t0);case 14:case"end":return t.stop()}}return t}(),null,null,[[4,11]])}return e}(),v=function(){function e(){var e;return a.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,t.next=3,a.awrap(d.enableApp(n.id));case 3:e=t.sent,_(n.name,e),t.next=10;break;case 7:t.prev=7,t.t0=t.catch(0),m(t.t0);case 10:case"end":return t.stop()}}return t}(),null,null,[[0,7]])}return e}(),h=function(){function e(){var e;return a.async(function(){function t(t){for(;;)switch(t.prev=t.next){case 0:if(!u){t.next=25;break}return t.next=3,a.awrap(B());case 3:if(!(e=t.sent)){t.next=16;break}return t.next=7,a.awrap(A(n));case 7:return t.prev=7,t.next=10,a.awrap(d.syncApp(n.id));case 10:t.next=15;break;case 12:t.prev=12,t.t0=t.catch(7),m(t.t0);case 15:return t.abrupt("return");case 16:return t.prev=16,t.next=19,a.awrap(d.uninstallApp(n.id));case 19:t.next=24;break;case 21:t.prev=21,t.t1=t.catch(16),m(t.t1);case 24:return t.abrupt("return");case 25:return t.next=27,a.awrap(g());case 27:if(t.sent){t.next=29;break}return t.abrupt("return");case 29:return t.prev=29,t.next=32,a.awrap(d.uninstallApp(n.id));case 32:t.next=37;break;case 34:t.prev=34,t.t2=t.catch(29),m(t.t2);case 37:case"end":return t.stop()}}return t}(),null,null,[[7,12],[16,21],[29,34]])}return e}();p.open({currentTarget:e,instance:t,columns:[{groups:[{items:[].concat(r(c?[{icon:"card",name:f("Subscription"),action:s}]:[]),[{icon:"list-alt",name:f("View_Logs"),action:l}])},{items:[o?{icon:"ban",name:f("Disable"),modifier:"alert",action:x}:{icon:"check",name:f("Enable"),action:v},{icon:"trash",name:f("Uninstall"),modifier:"alert",action:h}]}]}]})}},D=function(n){var e=n.installed,t=n.version,r=n.marketplaceVersion,a=n.isPurchased,c=n.price,i=n.purchaseType,o=n.subscriptionInfo,s,p,l,f;return e&&t&&r&&u.lt(t,r)?{action:"update",icon:"reload",label:"Update"}:e?void 0:a?{action:"install",label:"Install"}:"subscription"!==i||o.status?c>0?{action:"purchase",label:"Buy"}:{action:"purchase",label:"Install"}:{action:"purchase",label:"Trial"}},I=function(n){var e=n.installed,t=n.status,r=n.subscriptionInfo,a,i,u;if(e)return x.includes(t)?{type:"failed",icon:"warning",label:t===c.INVALID_SETTINGS_DISABLED?"Config Needed":"Failed"}:b.includes(t)?r&&"trialing"===r.status?{icon:"checkmark-circled",label:"Trial period"}:{icon:"checkmark-circled",label:"Enabled"}:{type:"warning",icon:"warning",label:"Disabled"}},S=function(n){return"$"+Number.parseFloat(n).toFixed(2)},C=function(n){var e=n.strategy,t=n.price,r=n.tiers,a,c=(Array.isArray(r)&&r.find((function(n){return n.price===t}))||{}).perUnit,i,u=["Apps_Marketplace_pricingPlan",e,void 0!==c&&c&&"perUser"].filter(Boolean).join("_");return f(u,{price:S(t)})}}

