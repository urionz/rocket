function module(e,t,n){let l,a,r,c,i,o,m,s,u,d,E;function p(e){let{children:t,headerButtons:n,save:o,cancel:d,_id:p,i18nLabel:h,i18nDescription:g,changed:k}=e;const S=u(),f=e=>{e.preventDefault(),o()},x=e=>{e.preventDefault(),d()},y=e=>{e.preventDefault(),o()};return p?m.createElement(E,{is:"form",action:"#",method:"post",onSubmit:f},m.createElement(E.Header,{title:S(h)},m.createElement(c,null,k&&m.createElement(r,{danger:!0,primary:!0,type:"reset",onClick:x},S("Cancel")),m.createElement(r,{children:S("Save_changes"),className:"save",disabled:!k,primary:!0,type:"submit",onClick:y}),n)),m.createElement(E.Content,null,m.createElement(a,{style:s(()=>({margin:"0 auto",width:"100%",maxWidth:"590px"}),[])},S.has(g)&&m.createElement(i,{hintColor:!0},S(g)),m.createElement(l,{className:"page-settings"},t)))):m.createElement(E,null,m.createElement(E.Header,null),m.createElement(E.Content,null))}function h(){const e=u();return m.createElement(E,null,m.createElement(E.Header,{title:m.createElement(o,{style:{width:"20rem"}})},m.createElement(c,null,m.createElement(r,{children:e("Save_changes"),disabled:!0,primary:!0}))),m.createElement(E.Content,null,m.createElement(a,{style:s(()=>({margin:"0 auto",width:"100%",maxWidth:"590px"}),[])},m.createElement(i.Skeleton,null),m.createElement(l,{className:"page-settings"},m.createElement(d.Skeleton,null)))))}n.export({GroupPage:()=>p,GroupPageSkeleton:()=>h}),n.link("@rocket.chat/fuselage",{Accordion(e){l=e},Box(e){a=e},Button(e){r=e},ButtonGroup(e){c=e},Paragraph(e){i=e},Skeleton(e){o=e}},0),n.link("react",{default(e){m=e},useMemo(e){s=e}},1),n.link("../../../contexts/TranslationContext",{useTranslation(e){u=e}},2),n.link("./Section",{Section(e){d=e}},3),n.link("../../basic/Page",{Page(e){E=e}},4),p.Skeleton=h}

