function module(e,t,s){let a,n,r,i,o,u,l,c,d,f;s.link("@babel/runtime/helpers/objectSpread2",{default(e){a=e}},0),s.link("meteor/reactive-var",{ReactiveVar(e){n=e}},0),s.link("meteor/tracker",{Tracker(e){r=e}},1),s.link("meteor/kadira:flow-router",{FlowRouter(e){i=e}},2),s.link("meteor/templating",{Template(e){o=e}},3),s.link("underscore",{default(e){u=e}},4),s.link("../../../ui-utils",{SideNav(e){l=e},TabBar(e){c=e},RocketChatTabBar(e){d=e}},5),s.link("../../../utils/client",{APIClient(e){f=e}},6);const g=50;o.adminUsers.helpers({searchText(){const e=o.instance();return e.filter&&e.filter.get()},isReady(){const e=o.instance();return e.ready&&e.ready.get()},users:()=>o.instance().users.get(),isLoading(){const e=o.instance();if(!e.ready||!e.ready.get())return"btn-loading"},hasMore(){const e=o.instance(),t=e.users();if(e.offset&&e.offset.get()&&t&&t.length)return e.offset.get()===t.length},emailAddress(){return u.map(this.emails,(function(e){return e.address})).join(", ")},flexData:()=>({tabBar:o.instance().tabBar,data:o.instance().tabBarData.get()}),onTableScroll(){const e=o.instance();return function(t){if(t.offsetHeight+t.scrollTop>=t.scrollHeight-100)return e.offset.set(e.offset.get()+50)}},statusDeactivated:()=>o.instance().statusDeactivated.get(),statusOptions:()=>o.instance().statusOptions.get()}),o.adminUsers.onCreated((function(){var e=this;const t=this;this.offset=new n(0),this.filter=new n(""),this.status=new n(""),this.ready=new n(!0),this.tabBar=new d,this.tabBar.showGroup(i.current().route.name),this.tabBarData=new n,this.users=new n([]),this.statusDeactivated=new n({value:"deactivated",label:"未激活"}),this.statusOptions=new n([{value:"online",label:"在线"},{value:"offline",label:"离线"},{value:"away",label:"离开"},{value:"busy",label:"忙碌"}]),c.addButton({groups:["admin-users"],id:"invite-user",i18nTitle:"Invite_Users",icon:"send",template:"adminInviteUser",order:1}),c.addButton({groups:["admin-users"],id:"add-user",i18nTitle:"Add_User",icon:"plus",template:"adminUserEdit",order:2}),c.addButton({groups:["admin-users"],id:"admin-user-info",i18nTitle:"User_Info",icon:"user",template:"adminUserInfo",order:3}),this.loadUsers=async function(t,s){let a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";e.ready.set(!1);const n={$or:[{"emails.address":{$regex:t,$options:"i"}},{username:{$regex:t,$options:"i"}},{name:{$regex:t,$options:"i"}}]};""!==a&&(a===e.statusDeactivated.value?n.active=!1:n.status=a);let r="users.list?count=".concat(50,"&offset=").concat(s);(t||a)&&(r+="&query=".concat(JSON.stringify(n)));const{users:i}=await f.v1.get(r);0===s?e.users.set(i):e.users.set(e.users.get().concat(i)),e.ready.set(!0)},this.autorun(async()=>{const e=t.filter.get(),s=t.offset.get(),a=t.status.get();this.loadUsers(e,s,a)})})),o.adminUsers.onRendered((function(){r.afterFlush((function(){l.setFlex("adminFlex"),l.openFlex()}))}));const h=300;o.adminUsers.events({"keydown #users-filter"(e){13===e.which&&(e.stopPropagation(),e.preventDefault())},"keyup #users-filter":u.debounce((e,t)=>{e.stopPropagation(),e.preventDefault(),t.filter.set(e.currentTarget.value),t.offset.set(0)},300),"click .user-info"(e,t){e.preventDefault(),t.tabBarData.set(a({},t.users.get().find(e=>e._id===this._id),{onChange(){const e=t.filter.get(),s=t.offset.get(),a=t.status.get();t.loadUsers(e,s,a)}})),t.tabBar.open("admin-user-info")},"click .info-tabs button"(e){e.preventDefault(),$(".info-tabs button").removeClass("active"),$(e.currentTarget).addClass("active"),$(".user-info-content").hide(),$($(e.currentTarget).attr("href")).show()},"click .load-more"(e,t){e.preventDefault(),e.stopPropagation(),t.offset.set(t.offset.get()+50)},"change #filter-status"(e,t){t.status.set(e.currentTarget.value),t.offset.set(0)}})}
