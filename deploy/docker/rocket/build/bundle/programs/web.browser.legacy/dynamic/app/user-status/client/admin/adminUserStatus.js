function module(t,e,n){var s,a,i,r,u,o,c,l,f,d,m;n.link("@babel/runtime/regenerator",{default:function(t){s=t}},0),n.link("underscore",{default:function(t){a=t}},0),n.link("meteor/templating",{Template:function(t){i=t}},1),n.link("meteor/reactive-var",{ReactiveVar:function(t){r=t}},2),n.link("meteor/kadira:flow-router",{FlowRouter:function(t){u=t}},3),n.link("meteor/tracker",{Tracker:function(t){o=t}},4),n.link("../../../ui-utils",{TabBar:function(t){c=t},SideNav:function(t){l=t},RocketChatTabBar:function(t){f=t}},5),n.link("../../../utils",{t:function(t){d=t}},6),n.link("../../../utils/client",{APIClient:function(t){m=t}},7);var g=50,p=500;i.adminUserStatus.helpers({searchText:function(){var t=i.instance();return t.filter&&t.filter.get()},customUserStatus:function(){return i.instance().statuses.get().map((function(t){var e=t._id,n=t.name,s=t.statusType,a;return{_id:e,name:n,statusType:s,localizedStatusType:s?d(s):""}}))},isLoading:function(){return i.instance().isLoading.get()},flexData:function(){return{tabBar:i.instance().tabBar,data:i.instance().tabBarData.get()}},onTableScroll:function(){var t=i.instance();return function(e){if(!(e.offsetHeight+e.scrollTop<e.scrollHeight-100)){var n=t.statuses.get();t.total.get()>n.length&&t.offset.set(t.offset.get()+g)}}},onTableItemClick:function(){var t=i.instance();return function(e){t.tabBarData.set({status:t.statuses.get().find((function(t){return t._id===e._id})),onSuccess:t.onSuccessCallback}),t.tabBar.showGroup("user-status-custom-selected"),t.tabBar.open("admin-user-status-info")}}}),i.adminUserStatus.onCreated((function(){var t=this,e=this;this.limit=new r(50),this.filter=new r(""),this.ready=new r(!1),this.total=new r(0),this.query=new r({}),this.statuses=new r([]),this.isLoading=new r(!1),this.offset=new r(0),this.tabBar=new f,this.tabBar.showGroup(u.current().route.name),this.tabBarData=new r,c.addButton({groups:["user-status-custom","user-status-custom-selected"],id:"add-user-status",i18nTitle:"Custom_User_Status_Add",icon:"plus",template:"adminUserStatusEdit",order:1}),c.addButton({groups:["user-status-custom-selected"],id:"admin-user-status-info",i18nTitle:"Custom_User_Status_Info",icon:"customize",template:"adminUserStatusInfo",order:2}),this.onSuccessCallback=function(){return t.offset.set(0),t.loadStatus(t.query.get(),t.offset.get())},this.tabBarData.set({onSuccess:this.onSuccessCallback}),this.loadStatus=a.debounce(function(){function e(e,n){var a,i,r;return s.async(function(){function u(u){for(;;)switch(u.prev=u.next){case 0:return t.isLoading.set(!0),u.next=3,s.awrap(m.v1.get("custom-user-status.list",{count:g,offset:n,query:JSON.stringify(e)}));case 3:a=u.sent,i=a.statuses,r=a.total,t.total.set(r),0===n?t.statuses.set(i):t.statuses.set(t.statuses.get().concat(i)),t.isLoading.set(!1);case 9:case"end":return u.stop()}}return u}())}return e}(),500),this.autorun((function(){var e=t.filter.get()&&t.filter.get().trim(),n=t.offset.get();if(e){var s={$regex:e,$options:"i"};return t.loadStatus({name:s},n)}return t.loadStatus({},n)}))})),i.adminUserStatus.onRendered((function(){return o.afterFlush((function(){l.setFlex("adminFlex"),l.openFlex()}))})),i.adminUserStatus.events({"keydown #user-status-filter":function(t){13===t.which&&(t.stopPropagation(),t.preventDefault())},"keyup #user-status-filter":function(t,e){t.stopPropagation(),t.preventDefault(),e.filter.set(t.currentTarget.value),e.offset.set(0)},"click .load-more":function(t,e){t.preventDefault(),t.stopPropagation(),e.limit.set(e.limit.get()+50)}})}
