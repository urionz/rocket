function module(e,n,t){let i,o,a,l,c,r,s,m,u,E,d,k,_,f,p;function g(e){let{canViewStatistics:n,isLoading:t,info:g,statistics:C,instances:h,onClickRefreshButton:S,onClickDownloadInfo:b}=e;const R=u();if(!g)return null;const I=C&&C.instanceCount>1&&!C.oplogEnabled;return r.createElement(m,{"data-qa":"admin-info"},r.createElement(m.Header,{title:R("Info")},n&&r.createElement(o,null,r.createElement(i,{disabled:t,external:!0,type:"button",onClick:b},r.createElement(l,{name:"download"})," ",R("Download_Info")),r.createElement(i,{disabled:t,primary:!0,type:"button",onClick:S},r.createElement(l,{name:"reload"})," ",R("Refresh")))),r.createElement(m.Content,null,I&&r.createElement(c,{blockEnd:"x16"},r.createElement(a,{type:"danger",title:R("Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances")},r.createElement("p",null,R("Error_RocketChat_requires_oplog_tailing_when_running_in_multiple_instances_details")),r.createElement("p",null,r.createElement(s,{external:!0,href:"https://rocket.chat/docs/installation/manual-installation/multiple-instances-to-improve-performance/#running-multiple-instances-per-host-to-improve-performance"},R("Click_here_for_more_info"))))),n&&r.createElement(E,{info:g,statistics:C,isLoading:t}),r.createElement(d,{info:g}),n&&r.createElement(k,{statistics:C,isLoading:t}),r.createElement(_,{info:g}),n&&r.createElement(f,{statistics:C,isLoading:t}),r.createElement(p,{instances:h})))}t.export({InformationPage:()=>g}),t.link("@rocket.chat/fuselage",{Button(e){i=e},ButtonGroup(e){o=e},Callout(e){a=e},Icon(e){l=e},Margins(e){c=e}},0),t.link("react",{default(e){r=e}},1),t.link("../../basic/Link",{Link(e){s=e}},2),t.link("../../basic/Page",{Page(e){m=e}},3),t.link("../../../contexts/TranslationContext",{useTranslation(e){u=e}},4),t.link("./RocketChatSection",{RocketChatSection(e){E=e}},5),t.link("./CommitSection",{CommitSection(e){d=e}},6),t.link("./RuntimeEnvironmentSection",{RuntimeEnvironmentSection(e){k=e}},7),t.link("./BuildEnvironmentSection",{BuildEnvironmentSection(e){_=e}},8),t.link("./UsageSection",{UsageSection(e){f=e}},9),t.link("./InstancesSection",{InstancesSection(e){p=e}},10)}
