function module(n,e,t){var i,r,u,o,a,c,s,l,f;t.link("@babel/runtime/regenerator",{default:function(n){i=n}},0),t.link("meteor/meteor",{Meteor:function(n){r=n}},0),t.link("meteor/templating",{Template:function(n){u=n}},1),t.link("meteor/reactive-var",{ReactiveVar:function(n){o=n}},2),t.link("meteor/kadira:flow-router",{FlowRouter:function(n){a=n}},3),t.link("../../../../models",{ChatRoom:function(n){c=n}},4),t.link("../../../../ui-utils/client",{call:function(n){s=n}},5),t.link("./livechatReadOnly.html"),t.link("../../../../utils/client",{APIClient:function(n){l=n}},6),t.link("../../lib/stream/inquiry",{inquiryDataStream:function(n){f=n}},7),u.livechatReadOnly.helpers({inquiryOpen:function(){var n=u.instance().inquiry.get();return n&&"queued"===n.status||a.go("/home")},roomOpen:function(){var n=u.instance().room.get();return n&&!0===n.open},showPreview:function(){var n;return u.instance().routingConfig.get().previewRoom},isPreparing:function(){return u.instance().preparing.get()}}),u.livechatReadOnly.events({"click .js-take-it":function(){function n(n,e){var t,r;return i.async(function(){function u(u){for(;;)switch(u.prev=u.next){case 0:return n.preventDefault(),n.stopPropagation(),t=e.inquiry.get(),r=t._id,u.next=6,i.awrap(s("livechat:takeInquiry",r));case 6:e.loadInquiry(t.rid);case 7:case"end":return u.stop()}}return u}())}return n}()}),u.livechatReadOnly.onCreated((function(){var n=this;this.rid=u.currentData().rid,this.room=new o,this.inquiry=new o,this.routingConfig=new o({}),this.preparing=new o(!0),this.updateInquiry=function(e){n.inquiry.set(e)},r.call("livechat:getRoutingConfig",(function(e,t){t&&n.routingConfig.set(t)})),this.loadInquiry=function(){function e(e){var t,r;return i.async(function(){function u(u){for(;;)switch(u.prev=u.next){case 0:return n.preparing.set(!0),u.next=3,i.awrap(l.v1.get("livechat/inquiries.getOne?roomId="+e));case 3:t=u.sent,r=t.inquiry,n.inquiry.set(r),r&&r._id&&f.on(r._id,n.updateInquiry),n.preparing.set(!1);case 8:case"end":return u.stop()}}return u}())}return e}(),this.autorun((function(){return n.loadInquiry(n.rid)})),this.autorun((function(){n.room.set(c.findOne({_id:u.currentData().rid},{fields:{open:1}}))}))})),u.livechatReadOnly.onDestroyed((function(){var n=this.inquiry.get();n&&n._id&&f.removeListener(n._id,this.updateInquiry)}))}
