function module(t,e,i){var n,r,o,s,a,u;i.link("@babel/runtime/regenerator",{default:function(t){n=t}},0),i.link("meteor/reactive-var",{ReactiveVar:function(t){r=t}},0),i.link("meteor/templating",{Template:function(t){o=t}},1),i.link("moment",{default:function(t){s=t}},2),i.link("underscore",{default:function(t){a=t}},3),i.link("./visitorHistory.html"),i.link("../../../../../utils/client",{APIClient:function(t){u=t}},4);var c=50;o.visitorHistory.helpers({isLoading:function(){return o.instance().isLoading.get()},previousChats:function(){return o.instance().history.get()},title:function(){var t=s(this.ts).format("L LTS");return this.label&&(t+=" - "+this.label),t}}),o.visitorHistory.onCreated((function(){var t=this,e=o.currentData();this.visitorId=new r,this.isLoading=new r(!1),this.history=new r([]),this.offset=new r(0),this.total=new r(0),this.autorun(function(){function i(){var i,r;return n.async(function(){function o(o){for(;;)switch(o.prev=o.next){case 0:return o.next=2,n.awrap(u.v1.get("rooms.info?roomId="+e.rid));case 2:i=o.sent,(r=i.room)&&r.v&&t.visitorId.set(r.v._id);case 5:case"end":return o.stop()}}return o}())}return i}()),this.autorun(function(){function i(){var i,r,o,s;return n.async(function(){function a(a){for(;;)switch(a.prev=a.next){case 0:if(t.visitorId.get()&&e&&e.rid){a.next=2;break}return a.abrupt("return");case 2:return i=t.offset.get(),t.isLoading.set(!0),a.next=6,n.awrap(u.v1.get("livechat/visitors.chatHistory/room/"+e.rid+"/visitor/"+t.visitorId.get()+"?count="+c+"&offset="+i));case 6:r=a.sent,o=r.history,s=r.total,t.isLoading.set(!1),t.total.set(s),t.history.set(t.history.get().concat(o));case 12:case"end":return a.stop()}}return a}())}return i}())})),o.visitorHistory.events({"scroll .visitor-scroll":a.throttle((function(t,e){if(t.target.scrollTop>=t.target.scrollHeight-t.target.clientHeight){var i=e.history.get();if(e.total.get()<=i.length)return;return e.offset.set(e.offset.get()+c)}}),200)})}
