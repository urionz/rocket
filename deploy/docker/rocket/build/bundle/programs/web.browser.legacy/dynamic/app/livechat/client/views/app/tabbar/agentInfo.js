function module(t,e,n){var a,r,i,s,u,o,c,l,f,g,m,d,v,p,h;n.link("@babel/runtime/regenerator",{default:function(t){a=t}},0),n.link("@babel/runtime/helpers/toConsumableArray",{default:function(t){r=t}},1),n.link("meteor/meteor",{Meteor:function(t){i=t}},0),n.link("meteor/reactive-var",{ReactiveVar:function(t){s=t}},1),n.link("meteor/session",{Session:function(t){u=t}},2),n.link("meteor/templating",{Template:function(t){o=t}},3),n.link("meteor/rocketchat:tap-i18n",{TAPi18n:function(t){c=t}},4),n.link("underscore",{default:function(t){l=t}},5),n.link("underscore.string",{default:function(t){f=t}},6),n.link("../customTemplates/register",{getCustomFormTemplate:function(t){g=t}},7),n.link("./agentInfo.html"),n.link("../../../../../ui-utils",{modal:function(t){m=t}},8),n.link("../../../../../utils/client",{t:function(t){d=t},handleError:function(t){v=t},APIClient:function(t){p=t}},9),n.link("../../../../../authorization",{hasPermission:function(t){h=t}},10);var k=function(){return g("livechatAgentInfoForm")};o.agentInfo.helpers({canEdit:function(){var t=r(o.instance().availableDepartments.get()),e=null!==k();return t.length>0&&h("add-livechat-department-agents")||e},uid:function(){return o.instance().agent.get()._id},name:function(){var t=o.instance().agent.get();return t&&t.name?t.name:c.__("Unnamed")},username:function(){var t=o.instance().agent.get();return t&&t.username},agentStatus:function(){var t=o.instance().agent.get(),e;return u.get("user_"+t.username+"_status")||c.__("offline")},agentStatusText:function(){var t=o.instance().agent.get(),e;return t&&f.trim(t.statusText)?t.statusText:u.get("user_"+t.username+"_status")||c.__("offline")},email:function(){var t=o.instance().agent.get();return t&&t.emails&&t.emails[0]&&t.emails[0].address},agent:function(){return o.instance().agent.get()},hasEmails:function(){var t=o.instance().agent.get();return t&&l.isArray(t.emails)},editingAgent:function(){return"edit"===o.instance().action.get()},agentToEdit:function(){var t=o.instance(),e=t.agent.get();return{agentId:e&&e._id,back:function(e){t.action.set(),t.agentEdited.set(e)}}},agentDepartments:function(){var t=o.instance().agentDepartments.get(),e;return o.instance().departments.get().filter((function(e){var n=e._id;return t.includes(n)}))},customFieldsTemplate:k,agentDataContext:function(){return o.instance().agent},isReady:function(){var t=o.instance();return t.ready&&t.ready.get()}}),o.agentInfo.events({"click .delete-agent":function(t,e){var n=this;t.preventDefault(),m.open({title:d("Are_you_sure"),type:"warning",showCancelButton:!0,confirmButtonColor:"#DD6B55",confirmButtonText:d("Yes"),cancelButtonText:d("Cancel"),closeOnConfirm:!1,html:!1},(function(){i.call("livechat:removeAgent",n.username,(function(t){if(t)return v(t);var n=e.tabBar,a=e.onRemoveAgent;n.close(),a&&a(),m.open({title:d("Removed"),text:d("Agent_removed"),type:"success",timer:1e3,showConfirmButton:!1})}))}))},"click .edit-agent":function(t,e){t.preventDefault(),e.action.set("edit")}}),o.agentInfo.onCreated(function(){function t(){var t=this,e,n,r;return a.async(function(){function i(i){for(;;)switch(i.prev=i.next){case 0:return this.agent=new s,this.ready=new s(!1),this.agentEdited=new s,this.departments=new s([]),this.availableDepartments=new s([]),this.agentDepartments=new s([]),this.action=new s,this.tabBar=o.currentData().tabBar,this.onRemoveAgent=o.currentData().onRemoveAgent,i.next=11,a.awrap(p.v1.get('livechat/department?sort={"name": 1}'));case 11:e=i.sent,n=e.departments,this.departments.set(n),this.availableDepartments.set(n.filter((function(t){var e;return t.enabled}))),r=function(){function e(e){var n,r,i,s;return a.async(function(){function u(u){for(;;)switch(u.prev=u.next){case 0:return t.ready.set(!1),u.next=3,a.awrap(p.v1.get("livechat/users/agent/"+e));case 3:return n=u.sent,r=n.user,u.next=7,a.awrap(p.v1.get("livechat/agents/"+e+"/departments"));case 7:i=u.sent,s=i.departments,t.agent.set(r),t.agentDepartments.set((s||[]).map((function(t){return t.departmentId}))),t.ready.set(!0);case 12:case"end":return u.stop()}}return u}())}return e}(),this.autorun((function(){var t,e=o.currentData().agentId;e&&r(e)})),this.autorun((function(){var e=t.agentEdited.get();e&&(r(e),t.agentEdited.set())}));case 18:case"end":return i.stop()}}return i}(),null,this)}return t}())}
