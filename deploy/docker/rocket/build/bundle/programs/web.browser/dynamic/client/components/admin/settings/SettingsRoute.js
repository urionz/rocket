function module(e,t,n){let i,o,l,r,u,s;function a(e){let{group:t}=e;l();const n=o(["view-privileged-setting","edit-privileged-setting","manage-selected-settings"]);return n?i.createElement(s,null,i.createElement(r,{groupId:t})):i.createElement(u,null)}n.export({SettingsRoute:()=>a}),n.link("react",{default(e){i=e}},0),n.link("../../../contexts/AuthorizationContext",{useAtLeastOnePermission(e){o=e}},1),n.link("../../../hooks/useAdminSideNav",{useAdminSideNav(e){l=e}},2),n.link("./GroupSelector",{GroupSelector(e){r=e}},3),n.link("./NotAuthorizedPage",{NotAuthorizedPage(e){u=e}},4),n.link("./SettingsState",{SettingsState(e){s=e}},5)}

