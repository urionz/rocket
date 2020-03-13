function module(t,e,n){var r,o,i,s,a,c,u,l,f,m,d,g,h,v,p,k,C,w,A;n.link("@babel/runtime/regenerator",{default:function(t){r=t}},0),n.link("moment-timezone"),n.link("underscore",{default:function(t){o=t}},0),n.link("moment",{default:function(t){i=t}},1),n.link("meteor/reactive-var",{ReactiveVar:function(t){s=t}},2),n.link("meteor/kadira:flow-router",{FlowRouter:function(t){a=t}},3),n.link("meteor/templating",{Template:function(t){c=t}},4),n.link("meteor/meteor",{Meteor:function(t){u=t}},5),n.link("meteor/random",{Random:function(t){l=t}},6),n.link("toastr",{default:function(t){f=t}},7),n.link("meteor/rocketchat:tap-i18n",{TAPi18n:function(t){m=t}},8),n.link("../../../../ui-utils",{modal:function(t){d=t},call:function(t){g=t},popover:function(t){h=t}},9),n.link("../../../../utils/client",{t:function(t){v=t},handleError:function(t){p=t},APIClient:function(t){k=t}},10),n.link("../../../../authorization",{hasRole:function(t){C=t},hasPermission:function(t){w=t},hasAtLeastOnePermission:function(t){A=t}},11),n.link("./livechatCurrentChats.html");var F=50;c.livechatCurrentChats.helpers({hasMore:function(){var t=c.instance();return t.total.get()>t.livechatRooms.get().length},isLoading:function(){return c.instance().isLoading.get()},livechatRoom:function(){return c.instance().livechatRooms.get()},startedAt:function(){return i(this.ts).format("L LTS")},lastMessage:function(){return i(this.lm).format("L LTS")},servedBy:function(){return this.servedBy&&this.servedBy.username},status:function(){return this.open?v("Opened"):v("Closed")},isClosed:function(){return!this.open},onSelectAgents:function(){return c.instance().onSelectAgents},agentModifier:function(){return function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=t.get();return"@"+(0===n.length?e:e.replace(new RegExp(t.get()),(function(t){return"<strong>"+t+"</strong>"})))}},selectedAgents:function(){return c.instance().selectedAgents.get()},onClickTagAgent:function(){return c.instance().onClickTagAgent},customFilters:function(){return c.instance().customFilters.get()},tagFilters:function(){return c.instance().tagFilters.get()},departments:function(){return c.instance().departments.get()},tagId:function(){return this},hasPopoverPermissions:function(){return A(["remove-closed-livechat-rooms"])}}),c.livechatCurrentChats.events({"click .row-link":function(){a.go("live",{id:this._id})},"click .js-load-more":function(t,e){e.offset.set(e.offset.get()+F)},"click .add-filter-button":function(t,e){t.preventDefault();var n=e.customFields.get(),r=e.customFilters.get(),o=e.tagFilters.get(),i=[];i.push({name:v("Tags"),action:function(){o.push(l.id()),e.tagFilters.set(o)}});for(var s=function(t){return"visible"!==t.visibility?"continue":"room"!==t.scope?"continue":r.find((function(e){return e.name===t._id}))?"continue":void i.push({name:t.label,action:function(){r.push({_id:t._id,name:t._id,label:t.label}),e.customFilters.set(r)}})},a=n,c=Array.isArray(a),u=0,a=c?a:a[Symbol.iterator]();;){var f;if(c){if(u>=a.length)break;f=a[u++]}else{if((u=a.next()).done)break;f=u.value}var m,d=s(f)}var g={popoverClass:"livechat-current-chats-add-filter",columns:[{groups:[{items:i}]}],currentTarget:t.currentTarget,offsetVertical:t.currentTarget.clientHeight};h.open(g)},"click .livechat-current-chats-extra-actions":function(t,e){t.preventDefault(),t.stopPropagation();var n=t.currentTarget,r=w("remove-closed-livechat-rooms"),o=function(){if(!C(u.userId(),["admin","livechat-manager"])){var t=e.departments.get();return t&&t.map((function(t){return t._id}))}},i={popoverClass:"livechat-current-chats-add-filter",columns:[{groups:[{items:[r&&{icon:"trash",name:v("Delete_all_closed_chats"),modifier:"alert",action:function(){d.open({title:v("Are_you_sure"),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:v("Yes"),cancelButtonText:v("Cancel"),closeOnConfirm:!0,html:!1},(function(){u.call("livechat:removeAllClosedRooms",o(),(function(t,n){if(t)return p(t);n&&(e.loadRooms(e.filter.get(),e.offset.get()),f.success(m.__("All_closed_chats_have_been_removed")))}))}))}}]}]}],currentTarget:n,offsetVertical:n.clientHeight};h.open(i)},"click .remove-livechat-tags-filter":function(t,e){t.preventDefault();var n=t.currentTarget.dataset.id,r=e.tagFilters.get(),o=r.indexOf(n);o>=0&&r.splice(o,1),e.tagFilters.set(r)},"click .remove-livechat-custom-filter":function(t,e){t.preventDefault();var n=t.currentTarget.dataset.name,r=e.customFilters.get(),o=r.findIndex((function(t){return t.name===n}));o>=0&&r.splice(o,1),e.customFilters.set(r)},"submit form":function(t,e){t.preventDefault();var n={};$(":input",t.currentTarget).each((function(){if(this.name){var t=$(this).val();if(t)return this.name.startsWith("custom-field-")?(n.customFields||(n.customFields={}),void(n.customFields[this.name.replace("custom-field-","")]=t)):"tags"===this.name?(n.tags||(n.tags=[]),void(t&&n.tags.push(t))):void(n[this.name]=t)}})),o.isEmpty(n.from)?delete n.from:n.from=i(n.from,i.localeData().longDateFormat("L")).toDate(),o.isEmpty(n.to)?delete n.to:n.to=i(n.to,i.localeData().longDateFormat("L")).toDate();var r=e.selectedAgents.get();r&&r.length>0&&(n.agents=[r[0]._id]),e.filter.set(n),e.offset.set(0)},"click .remove-livechat-room":function(t,e){var n=this;t.preventDefault(),t.stopPropagation(),d.open({title:v("Are_you_sure"),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:v("Yes"),cancelButtonText:v("Cancel"),closeOnConfirm:!1,html:!1},function(){function t(t){return r.async(function(){function o(o){for(;;)switch(o.prev=o.next){case 0:if(t){o.next=2;break}return o.abrupt("return");case 2:return o.next=4,r.awrap(g("livechat:removeRoom",n._id));case 4:e.loadRooms(e.filter.get(),e.offset.get()),d.open({title:v("Deleted"),text:v("Room_has_been_deleted"),type:"success",timer:1e3,showConfirmButton:!1});case 6:case"end":return o.stop()}}return o}())}return t}())},"input [id=agent]":function(t,e){var n;""===t.currentTarget.value&&e.selectedAgents.set([])}}),c.livechatCurrentChats.onCreated(function(){function t(){var t=this,e,n,o,a;return r.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:return this.isLoading=new s(!1),this.offset=new s(0),this.total=new s(0),this.filter=new s({}),this.livechatRooms=new s([]),this.selectedAgents=new s([]),this.customFilters=new s([]),this.customFields=new s([]),this.tagFilters=new s([]),this.departments=new s([]),e=function(t,e,n){return e.reduce((function(r,o){var i=n===e.length-1;return r+=t+"[]="+o+(i?"":"&")}),"")},n=function(t,n){var r=t.status,o=t.agents,s=t.department,a=t.from,c=t.to,u=t.tags,l=t.customFields,f=t.name,m="livechat/rooms?count="+F+"&offset="+n+'&sort={"ts": -1}',d={};return r&&(m+="&open="+("opened"===r)),s&&(m+="&departmentId="+s),a&&(d.start=i(new Date(a)).utc().format("YYYY-MM-DDTHH:mm:ss")+"Z"),c&&(d.end=i(new Date(c).setHours(23,59,59)).utc().format("YYYY-MM-DDTHH:mm:ss")+"Z"),u&&(m+="&"+e("tags",u)),o&&Array.isArray(o)&&o.length&&(m+="&"+e("agents",o)),l&&(m+="&customFields="+JSON.stringify(l)),Object.keys(d).length&&(m+="&createdAt="+JSON.stringify(d)),f&&(m+="&roomName="+f),m},this.loadRooms=function(){function e(e,o){var i,s,a;return r.async(function(){function c(c){for(;;)switch(c.prev=c.next){case 0:return t.isLoading.set(!0),c.next=3,r.awrap(k.v1.get(n(e,o)));case 3:i=c.sent,s=i.rooms,a=i.total,t.total.set(a),0===o?t.livechatRooms.set(s):t.livechatRooms.set(t.livechatRooms.get().concat(s)),t.isLoading.set(!1);case 9:case"end":return c.stop()}}return c}())}return e}(),this.onSelectAgents=function(e){var n=e.item;t.selectedAgents.set([n])},this.onClickTagAgent=function(e){var n=e.username;t.selectedAgents.set(t.selectedAgents.get().filter((function(t){return t.username!==n})))},this.autorun(function(){function e(){var e,n;return r.async(function(){function r(r){for(;;)switch(r.prev=r.next){case 0:e=t.filter.get(),n=t.offset.get(),t.loadRooms(e,n);case 3:case"end":return r.stop()}}return r}())}return e}()),c.next=18,r.awrap(k.v1.get('livechat/department?sort={"name": 1}'));case 18:o=c.sent,a=o.departments,this.departments.set(a),u.call("livechat:getCustomFields",(function(e,n){n&&t.customFields.set(n)}));case 22:case"end":return c.stop()}}return c}(),null,this)}return t}()),c.livechatCurrentChats.onRendered((function(){this.$(".input-daterange").datepicker({autoclose:!0,todayHighlight:!0,format:i.localeData().longDateFormat("L").toLowerCase()})}))}

