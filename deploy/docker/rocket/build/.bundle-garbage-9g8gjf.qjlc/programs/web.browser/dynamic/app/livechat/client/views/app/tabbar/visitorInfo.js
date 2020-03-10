function module(t,e,n){let o,i,s,r,a,c,l,u,d,m,h,g,f,v,p,_,w,k,I,y,C,D;n.link("meteor/meteor",{Meteor(t){o=t}},0),n.link("meteor/reactive-var",{ReactiveVar(t){i=t}},1),n.link("meteor/kadira:flow-router",{FlowRouter(t){s=t}},2),n.link("meteor/session",{Session(t){r=t}},3),n.link("meteor/templating",{Template(t){a=t}},4),n.link("meteor/rocketchat:tap-i18n",{TAPi18n(t){c=t}},5),n.link("underscore",{default(t){l=t}},6),n.link("underscore.string",{default(t){u=t}},7),n.link("moment",{default(t){d=t}},8),n.link("ua-parser-js",{default(t){m=t}},9),n.link("../../../../../ui-utils",{modal(t){h=t}},10),n.link("../../../../../models",{Subscriptions(t){g=t}},11),n.link("../../../../../settings",{settings(t){f=t}},12),n.link("../../../../../utils",{t(t){v=t},handleError(t){p=t},roomTypes(t){_=t}},13),n.link("../../../../../authorization",{hasRole(t){w=t},hasPermission(t){k=t},hasAtLeastOnePermission(t){I=t}},14),n.link("./visitorInfo.html"),n.link("../../../../../utils/client",{APIClient(t){y=t}},15),n.link("../../../../../ui-utils/client",{RoomManager(t){C=t}},16),n.link("../../../../../lib/client",{DateFormat(t){D=t}},17);const B=()=>{const t=a.currentData();if(!t||!t.rid)return!1;const e=g.findOne({rid:t.rid});return void 0!==e};a.visitorInfo.helpers({user(){const t=a.instance().user.get();if(t&&t.userAgent){const e=new m;e.setUA(t.userAgent),t.os="".concat(e.getOS().name," ").concat(e.getOS().version),-1!==["Mac OS","iOS"].indexOf(e.getOS().name)?t.osIcon="icon-apple":t.osIcon="icon-".concat(e.getOS().name.toLowerCase()),t.browser="".concat(e.getBrowser().name," ").concat(e.getBrowser().version),t.browserIcon="icon-".concat(e.getBrowser().name.toLowerCase()),t.status=_.getUserStatus("l",this.rid)||"offline"}return t},room:()=>a.instance().room.get(),department:()=>a.instance().department.get(),joinTags(){const t=a.instance().tags.get();return t&&t.join(", ")},customRoomFields(){const t=a.instance().customFields.get();if(!t||0===t.length)return[];const e=[],n=a.instance().room.get(),{livechatData:o={}}=n||{};return Object.keys(o).forEach(n=>{const i=l.findWhere(t,{_id:n});i&&"hidden"!==i.visibility&&"room"===i.scope&&e.push({label:i.label,value:o[n]})}),e},customVisitorFields(){const t=a.instance().customFields.get();if(!t||0===t.length)return[];const e=[],n=a.instance().user.get(),{livechatData:o={}}=n||{};return Object.keys(o).forEach(n=>{const i=l.findWhere(t,{_id:n});i&&"hidden"!==i.visibility&&"visitor"===i.scope&&e.push({label:i.label,value:o[n]})}),e},createdAt(){return this.createdAt?d(this.createdAt).format("L LTS"):""},lastLogin(){return this.lastLogin?d(this.lastLogin).format("L LTS"):""},editing:()=>"edit"===a.instance().action.get(),forwarding:()=>"forward"===a.instance().action.get(),editDetails(){const t=a.instance(),e=t.user.get();return{visitorId:e?e._id:null,roomId:this.rid,save(){t.action.set()},cancel(){t.action.set()}}},forwardDetails(){const t=a.instance(),e=t.user.get();return{visitorId:e?e._id:null,roomId:this.rid,save(){t.action.set()},cancel(){t.action.set()}}},roomOpen(){const t=a.instance().room.get(),e=o.userId();return t&&t.open&&(t.servedBy&&t.servedBy._id===e||w(e,"livechat-manager"))},canReturnQueue(){const t=a.instance().routingConfig.get();return t.returnQueue},showDetail(){if(a.instance().action.get())return"hidden"},canSeeButtons:()=>!!I(["close-others-livechat-room","transfer-livechat-guest"])||B(),canEditRoom:()=>!!k("save-others-livechat-room-info")||B(),canCloseRoom:()=>!!k("close-others-livechat-room")||B(),canForwardGuest:()=>k("transfer-livechat-guest"),roomClosedDateTime(){const{closedAt:t}=this;return D.formatDateAndTime(t)},roomClosedBy(){const{closedBy:t={},servedBy:e={}}=this;let{closer:n}=this;if("user"===n){if(e._id!==t._id)return t.username;n="agent"}const o=n.charAt(0).toUpperCase()+n.slice(1);return v("".concat(o))}}),a.visitorInfo.events({"click .edit-livechat"(t,e){t.preventDefault(),e.action.set("edit")},"click .close-livechat"(t){t.preventDefault();const e=t=>o.call("livechat:closeRoom",this.rid,t,(function(t){if(t)return p(t);h.open({title:v("Chat_closed"),text:v("Chat_closed_successfully"),type:"success",timer:1e3,showConfirmButton:!1})}));if(!f.get("Livechat_request_comment_when_closing_conversation")){const t=c.__("Chat_closed_by_agent");return e(t)}h.open({title:v("Closing_chat"),type:"input",inputPlaceholder:v("Please_add_a_comment"),showCancelButton:!0,closeOnConfirm:!1},t=>t?""===u.trim(t)?(h.showInputError(v("Please_add_a_comment_to_close_the_room")),!1):e(t):(h.showInputError(v("Please_add_a_comment_to_close_the_room")),!1))},"click .return-inquiry"(t){t.preventDefault(),h.open({title:v("Would_you_like_to_return_the_inquiry"),type:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:v("Yes")},()=>{o.call("livechat:returnAsInquiry",this.rid,(function(t){t?p(t):(r.set("openedRoom"),s.go("/home"))}))})},"click .forward-livechat"(t,e){t.preventDefault(),e.action.set("forward")}}),a.visitorInfo.onCreated((function(){this.visitorId=new i(null),this.customFields=new i([]),this.action=new i,this.user=new i,this.departmentId=new i(null),this.tags=new i(null),this.routingConfig=new i({}),this.department=new i({}),this.room=new i({}),this.updateRoom=t=>{this.room.set(t)},o.call("livechat:getCustomFields",(t,e)=>{e&&this.customFields.set(e)});const{rid:t}=a.currentData();o.call("livechat:getRoutingConfig",(t,e)=>{e&&this.routingConfig.set(e)});const e=async t=>{const{room:e}=await y.v1.get("rooms.info?roomId=".concat(t));this.visitorId.set(e&&e.v&&e.v._id),this.departmentId.set(e&&e.departmentId),this.tags.set(e&&e.tags),this.room.set(e)};t&&(e(t),C.roomStream.on(t,this.updateRoom)),this.autorun(async()=>{if(this.departmentId.get()){const{department:t}=await y.v1.get("livechat/department/".concat(this.departmentId.get(),"?includeAgents=false"));this.department.set(t)}}),this.autorun(async()=>{const t=this.visitorId.get();if(t){const{visitor:e}=await y.v1.get("livechat/visitors.info?visitorId=".concat(t));this.user.set(e)}})})),a.visitorInfo.onDestroyed((function(){const{rid:t}=a.currentData();C.roomStream.removeListener(t,this.updateRoom)}))}
