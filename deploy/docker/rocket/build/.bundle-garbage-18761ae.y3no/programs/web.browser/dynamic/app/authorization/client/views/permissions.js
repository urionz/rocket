function module(e,t,s){let i,n,r,o,a,l,c,m,p,u,g,d,f;s.link("underscore",{default(e){i=e}},0),s.link("underscore.string",{default(e){n=e}},1),s.link("meteor/meteor",{Meteor(e){r=e}},2),s.link("meteor/reactive-dict",{ReactiveDict(e){o=e}},3),s.link("meteor/tracker",{Tracker(e){a=e}},4),s.link("meteor/templating",{Template(e){l=e}},5),s.link("../../../models",{Roles(e){c=e}},6),s.link("../lib/ChatPermissions",{ChatPermissions(e){m=e}},7),s.link("../hasPermission",{hasAllPermission(e){p=e}},8),s.link("../../../utils/client",{t(e){u=e}},9),s.link("../../../ui-utils/client/lib/SideNav",{SideNav(e){g=e}},10),s.link("../../lib",{CONSTANTS(e){d=e}},11),s.link("..",{hasAtLeastOnePermission(e){f=e}},12),l.permissions.helpers({tabsData(){const{state:e}=l.instance(),t={label:u("Permissions"),value:"permissions",condition:()=>!0},s={label:u("Settings"),value:"settings",condition:()=>!0},i=[t],n=p("access-setting-permissions");switch(n&&i.push(s),n&&e.get("tab")){case"settings":s.active=!0;break;case"permissions":t.active=!0;break;default:t.active=!0}return{tabs:i,onChange(t){e.set({tab:t,size:50})}}},roles:()=>c.find(),permissions(){const{state:e}=l.instance(),t=e.get("size"),s=new RegExp(n.escapeRegExp(e.get("filter")),"i");return m.find({level:{$ne:d.SETTINGS_LEVEL},_id:s},{sort:{_id:1},limit:t})},settingPermissions(){const{state:e}=l.instance(),t=e.get("size"),s=new RegExp(n.escapeRegExp(e.get("filter")),"i");return m.find({_id:s,level:d.SETTINGS_LEVEL,group:{$exists:!0}},{limit:t,sort:{group:1,section:1}})},hasPermission:()=>p("access-permissions"),hasNoPermission:()=>!f(["access-permissions","access-setting-permissions"]),filter:()=>l.instance().state.get("filter"),tab:()=>l.instance().state.get("tab")}),l.permissions.events({"keyup #permissions-filter"(e,t){e.stopPropagation(),e.preventDefault(),t.state.set("filter",e.currentTarget.value)},"scroll .content":i.throttle((e,t)=>{let{currentTarget:s}=e;if(s.offsetHeight+s.scrollTop>=s.scrollHeight-100)return t.state.set("size",t.state.get("size")+50)},300)}),l.permissions.onCreated((function(){this.state=new o({filter:"",tab:"",size:50}),this.autorun(()=>{this.state.get("filter"),this.state.set("size",50)})})),l.permissionsTable.helpers({granted:(e,t)=>e&&~e.indexOf(t._id)?"checked":null,permissionName(e){if(e.level===d.SETTINGS_LEVEL){let t="";return e.group&&(t="".concat(u(e.group)," > ")),e.section&&(t="".concat(t).concat(u(e.section)," > ")),"".concat(t).concat(u(e.settingId))}return u(e._id)},permissionDescription:e=>u("".concat(e._id,"_description"))}),l.permissionsTable.events({"click .role-permission"(e){const t=e.currentTarget.getAttribute("data-permission"),s=e.currentTarget.getAttribute("data-role"),i=t&&m.findOne(t),n=~i.roles.indexOf(s)?"authorization:removeRoleFromPermission":"authorization:addPermissionToRole";return r.call(n,t,s)}}),l.permissions.onRendered(()=>{a.afterFlush(()=>{g.setFlex("adminFlex"),g.openFlex()})})}
